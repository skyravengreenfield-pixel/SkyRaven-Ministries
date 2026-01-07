# 🔥 Firebase Cloud Functions Setup Guide

Your Express server has been converted to Firebase Cloud Functions! Everything now runs on Firebase.

## 📋 Prerequisites

- Firebase CLI installed
- Firebase project created (skyraven-ministries)
- Blaze plan enabled (pay-as-you-go, free tier included)

## 🚀 Quick Start

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase (if not done already)

```bash
firebase init
```

Select:
- ✅ Functions
- ✅ Firestore
- ✅ Storage

Choose:
- **Existing project**: skyraven-ministries
- **Language**: JavaScript
- **Install dependencies**: Yes

### 4. Set Stripe Configuration

Firebase Cloud Functions use environment configuration instead of .env files.

```bash
firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY_HERE"
```

For webhooks (after deployment):
```bash
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
```

### 5. Install Dependencies

```bash
cd functions
npm install
```

### 6. Test Locally (Optional)

Start Firebase emulators:
```bash
firebase emulators:start
```

Functions will run at: `http://localhost:5001/skyraven-ministries/us-central1/`

### 7. Deploy to Firebase

```bash
firebase deploy --only functions
```

This deploys all Cloud Functions to Firebase!

## 🌐 Your Function URLs

After deployment, your functions will be available at:

```
https://us-central1-skyraven-ministries.cloudfunctions.net/createPaymentIntent
https://us-central1-skyraven-ministries.cloudfunctions.net/createCustomer
https://us-central1-skyraven-ministries.cloudfunctions.net/createSubscription
https://us-central1-skyraven-ministries.cloudfunctions.net/cancelSubscription
https://us-central1-skyraven-ministries.cloudfunctions.net/getPaymentIntent
https://us-central1-skyraven-ministries.cloudfunctions.net/stripeWebhook
https://us-central1-skyraven-ministries.cloudfunctions.net/health
```

## 🔗 Update Frontend

Update `.env.local` with your Cloud Functions URL:

```env
VITE_API_BASE_URL=https://us-central1-skyraven-ministries.cloudfunctions.net
```

## 🎯 Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://us-central1-skyraven-ministries.cloudfunctions.net/stripeWebhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Set it in Firebase:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_your_secret"
   firebase deploy --only functions
   ```

## 📊 Deploy Security Rules

Deploy Firestore and Storage rules:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## 🧪 Test Your Functions

### Test Health Check
```bash
curl https://us-central1-skyraven-ministries.cloudfunctions.net/health
```

### Test Payment Intent Creation
```bash
curl -X POST https://us-central1-skyraven-ministries.cloudfunctions.net/createPaymentIntent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "donorName": "Test User",
    "donorEmail": "test@example.com"
  }'
```

## 📈 Monitor Functions

### View Logs
```bash
firebase functions:log
```

### Real-time Logs
```bash
firebase functions:log --only createPaymentIntent
```

### Firebase Console
View logs, metrics, and errors: https://console.firebase.google.com/project/skyraven-ministries/functions

## 💰 Pricing

**Free Tier (Monthly):**
- 2M function invocations
- 400,000 GB-seconds
- 200,000 CPU-seconds
- 5GB outbound networking

**After free tier:** ~$0.40 per million invocations

Your usage will likely stay in the free tier!

## 🔄 Update Function Code

1. Edit `functions/index.js`
2. Deploy:
   ```bash
   firebase deploy --only functions
   ```

3. Deploy specific function:
   ```bash
   firebase deploy --only functions:createPaymentIntent
   ```

## 🆚 Benefits Over Express Server

✅ **No separate hosting** - Everything in Firebase
✅ **Auto-scaling** - Handles traffic spikes
✅ **No server management** - Firebase handles infrastructure
✅ **Integrated** - Direct access to Firestore/Storage
✅ **Free tier** - 2M invocations/month free
✅ **Better security** - Firestore security rules

## 🚨 Troubleshooting

**Functions not deploying:**
```bash
firebase deploy --only functions --debug
```

**View configuration:**
```bash
firebase functions:config:get
```

**Clear local cache:**
```bash
firebase functions:config:unset stripe
firebase deploy --only functions
```

**CORS errors:**
- Functions already have CORS enabled with `origin: true`
- Check frontend is using correct function URLs

## 📝 Next Steps

1. ✅ Deploy functions: `firebase deploy --only functions`
2. ✅ Update frontend `.env.local` with function URLs
3. ✅ Configure Stripe webhooks
4. ✅ Deploy security rules
5. ✅ Test payment flow
6. ✅ Monitor logs in Firebase Console

## 🎉 You're All Set!

Your backend now runs entirely on Firebase Cloud Functions. No need for Railway, Render, or any other hosting platform!

**All your infrastructure:**
- Frontend: Vercel/Netlify
- Backend: Firebase Cloud Functions
- Database: Firestore
- Storage: Firebase Storage
- Auth: Firebase Auth
- Payments: Stripe

One platform, fully integrated! 🚀
