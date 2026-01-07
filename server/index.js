/**
 * SkyRaven Ministries API Server
 * Handles Stripe payment processing
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parser - except for webhooks
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/**
 * Create Payment Intent
 * POST /api/payments/create-intent
 */
app.post('/api/payments/create-intent', async (req, res) => {
  try {
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

/**
 * Create Subscription
 * POST /api/payments/create-subscription
 */
app.post('/api/payments/create-subscription', async (req, res) => {
  try {
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

/**
 * Cancel Subscription
 * POST /api/payments/cancel-subscription/:subscriptionId
 */
app.post('/api/payments/cancel-subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

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

/**
 * Retrieve Payment Intent
 * GET /api/payments/intent/:paymentIntentId
 */
app.get('/api/payments/intent/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

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

/**
 * Create Customer
 * POST /api/payments/create-customer
 */
app.post('/api/payments/create-customer', async (req, res) => {
  try {
    const { email, name, metadata } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
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

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // TODO: Update database with successful payment
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('PaymentIntent failed:', failedPayment.id);
        // TODO: Handle failed payment
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        // TODO: Update database with subscription
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        // TODO: Update database
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription cancelled:', deletedSubscription.id);
        // TODO: Update database
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`🔥 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  Warning: STRIPE_SECRET_KEY not set!');
  }
});
