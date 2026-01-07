# ⚠️ Firebase Functions Deployment Required

## Current Status
Your application is **configured but not deployed**. Demo mode has been **removed**.

## What You Need to Do

### 1. Upgrade Firebase Project to Blaze Plan
Your Firebase project needs to be on the **Blaze (pay-as-you-go)** plan to deploy Cloud Functions.

**Upgrade here:**
https://console.firebase.google.com/project/skyraven-ministries/usage/details

**Important Notes:**
- Blaze plan is required for Cloud Functions
- You only pay for what you use
- Firebase provides a generous free tier
- Typical costs for small-medium apps: $0-5/month

### 2. Deploy Firebase Functions
Once upgraded, run:
```bash
cd /workspaces/SkyRaven-Ministries
firebase deploy --only functions
```

This will deploy:
- `createPaymentIntent` - Processes Stripe payments
- `createCustomer` - Creates Stripe customers
- `handleWebhook` - Processes Stripe webhooks
- `createSubscription` - Handles recurring donations

### 3. Test Your Deployment
After deployment, test the payment flow:
1. Visit your app
2. Try making a donation
3. Check Firebase Console > Functions for logs
4. Check Stripe Dashboard for payment events

## Environment Configuration

Your `.env.local` is already configured for production:
```
VITE_API_BASE_URL=https://us-central1-skyraven-ministries.cloudfunctions.net
```

## Stripe Configuration

Stripe is configured with:
- ✅ Publishable Key: `pk_live_51SmmyZ...`
- ✅ Secret Key set in Firebase Functions config

## What Changed

1. **Removed demo mode fallback** - App now shows proper error messages
2. **Updated API URL** - Points to production Firebase Functions
3. **Firebase Functions configured** - Stripe secret key is set

## If You Get Errors

### "Unable to connect to payment server"
- Functions not deployed yet
- Upgrade to Blaze plan and deploy

### "Payment processing failed"
- Check Firebase Console > Functions > Logs
- Verify Stripe keys are correct
- Check Stripe Dashboard for events

## Need Help?

See:
- [Firebase Pricing](https://firebase.google.com/pricing)
- [QUICKSTART_FIREBASE_STRIPE.md](QUICKSTART_FIREBASE_STRIPE.md)
- [FIREBASE_FUNCTIONS_SETUP.md](FIREBASE_FUNCTIONS_SETUP.md)
