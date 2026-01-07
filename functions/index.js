/**
 * Firebase Cloud Functions for SkyRaven Ministries
 * Handles Stripe payment processing and donation management
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

// CORS configuration
const corsHandler = cors({ 
  origin: true,
  credentials: true 
});

/**
 * Create Payment Intent
 * POST /createPaymentIntent
 */
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Only allow POST
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const {
        amount,
        currency = 'usd',
        donorName,
        donorEmail,
        projectId,
        message,
      } = req.body;

      // Validate required fields
      if (!amount || !donorName || !donorEmail) {
        return res.status(400).json({
          error: 'Missing required fields: amount, donorName, donorEmail',
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        receipt_email: donorEmail,
        metadata: {
          donorName,
          projectId: projectId?.toString() || '',
          message: message || '',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store donation in Firestore
      await admin.firestore().collection('donations').add({
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        donorName,
        donorEmail,
        projectId: projectId || null,
        message: message || '',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      res.status(500).json({
        error: 'Failed to create payment intent',
        message: error.message,
      });
    }
  });
});

/**
 * Create Customer
 * POST /createCustomer
 */
exports.createCustomer = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { email, name, metadata } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const customer = await stripe.customers.create({
        email,
        name,
        metadata: metadata || {},
      });

      res.json(customer);
    } catch (error) {
      console.error('Customer creation failed:', error);
      res.status(500).json({
        error: 'Failed to create customer',
        message: error.message,
      });
    }
  });
});

/**
 * Create Subscription
 * POST /createSubscription
 */
exports.createSubscription = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { customerId, priceId, paymentMethodId } = req.body;

      if (!customerId || !priceId || !paymentMethodId) {
        return res.status(400).json({
          error: 'Missing required fields: customerId, priceId, paymentMethodId',
        });
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      res.json(subscription);
    } catch (error) {
      console.error('Subscription creation failed:', error);
      res.status(500).json({
        error: 'Failed to create subscription',
        message: error.message,
      });
    }
  });
});

/**
 * Cancel Subscription
 * POST /cancelSubscription
 */
exports.cancelSubscription = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { subscriptionId } = req.body;

      if (!subscriptionId) {
        return res.status(400).json({ error: 'subscriptionId is required' });
      }

      const subscription = await stripe.subscriptions.cancel(subscriptionId);

      res.json({
        message: 'Subscription cancelled successfully',
        subscription,
      });
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      res.status(500).json({
        error: 'Failed to cancel subscription',
        message: error.message,
      });
    }
  });
});

/**
 * Get Payment Intent
 * GET /getPaymentIntent
 */
exports.getPaymentIntent = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { paymentIntentId } = req.query;

      if (!paymentIntentId) {
        return res.status(400).json({ error: 'paymentIntentId is required' });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      res.json(paymentIntent);
    } catch (error) {
      console.error('Payment intent retrieval failed:', error);
      res.status(500).json({
        error: 'Failed to retrieve payment intent',
        message: error.message,
      });
    }
  });
});

/**
 * Stripe Webhook Handler
 * POST /stripeWebhook
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = functions.config().stripe.webhook_secret;

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        
        // Update donation status in Firestore
        const donationSnapshot = await admin
          .firestore()
          .collection('donations')
          .where('paymentIntentId', '==', paymentIntent.id)
          .limit(1)
          .get();

        if (!donationSnapshot.empty) {
          await donationSnapshot.docs[0].ref.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('PaymentIntent failed:', failedPayment.id);
        
        // Update donation status
        const failedSnapshot = await admin
          .firestore()
          .collection('donations')
          .where('paymentIntentId', '==', failedPayment.id)
          .limit(1)
          .get();

        if (!failedSnapshot.empty) {
          await failedSnapshot.docs[0].ref.update({
            status: 'failed',
            failedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        
        // Store subscription in Firestore
        await admin.firestore().collection('subscriptions').add({
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        
        // Update subscription in Firestore
        const subSnapshot = await admin
          .firestore()
          .collection('subscriptions')
          .where('subscriptionId', '==', updatedSubscription.id)
          .limit(1)
          .get();

        if (!subSnapshot.empty) {
          await subSnapshot.docs[0].ref.update({
            status: updatedSubscription.status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription cancelled:', deletedSubscription.id);
        
        // Update subscription status
        const delSnapshot = await admin
          .firestore()
          .collection('subscriptions')
          .where('subscriptionId', '==', deletedSubscription.id)
          .limit(1)
          .get();

        if (!delSnapshot.empty) {
          await delSnapshot.docs[0].ref.update({
            status: 'cancelled',
            cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health Check
 * GET /health
 */
exports.health = functions.https.onRequest((req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Firebase Functions are running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get Stripe Account Balance
 * GET /getBalance
 */
exports.getBalance = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // Fetch balance from Stripe
      const balance = await stripe.balance.retrieve();

      // Calculate total available balance (sum all currencies)
      const totalAvailable = balance.available.reduce((sum, curr) => {
        return sum + curr.amount;
      }, 0);

      // Calculate total pending balance
      const totalPending = balance.pending.reduce((sum, curr) => {
        return sum + curr.amount;
      }, 0);

      res.json({
        available: totalAvailable / 100, // Convert from cents to dollars
        pending: totalPending / 100,
        currency: balance.available[0]?.currency || 'usd',
        details: balance
      });
    } catch (error) {
      console.error('Balance retrieval failed:', error);
      res.status(500).json({
        error: 'Failed to retrieve balance',
        message: error.message,
      });
    }
  });
});
