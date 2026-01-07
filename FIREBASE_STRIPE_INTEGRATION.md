# Firebase & Stripe Integration Guide

## Overview
This guide covers the integration of Firebase (authentication, database, storage) and Stripe (payment processing) into the SkyRaven Ministries application.

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard
4. Enable the following services:
   - Authentication
   - Firestore Database
   - Storage

### 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Scroll to "Your apps" section
3. Click the web icon (</>)
4. Copy the configuration object
5. Add to `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Enable Authentication Methods

1. Go to Authentication > Sign-in method
2. Enable:
   - Email/Password
   - Google (optional)
3. Configure authorized domains

### 4. Set Up Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects are readable by all, writable by admins
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Administrator';
    }
    
    // Donations are readable by owner, writable by authenticated users
    match /donations/{donationId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Administrator');
      allow create: if request.auth != null;
    }
    
    // Expenses readable by all, writable by admins
    match /expenses/{expenseId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Administrator';
    }
  }
}
```

### 5. Set Up Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /receipts/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /profile_photos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 💳 Stripe Setup

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in
3. Complete account setup

### 2. Get API Keys

1. Go to Developers > API keys
2. Copy your Publishable key and Secret key
3. Add to `.env.local`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Important:** Never expose the Secret Key in frontend code!

### 3. Set Up Webhook Endpoint (Backend)

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-api.com/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Save webhook secret for backend

### 4. Enable Payment Methods

1. Go to Settings > Payment methods
2. Enable:
   - Cards (Visa, Mastercard, Amex, etc.)
   - Bank transfers (optional)
   - Digital wallets (optional)

## 📦 Usage Examples

### Firebase Authentication

```typescript
import { firebaseAuthService } from '@/services/firebaseAuth';
import { initializeFirebase } from '@/config/firebase';

// Initialize Firebase
initializeFirebase();

// Sign up
const user = await firebaseAuthService.signUp(
  'user@example.com',
  'password123',
  'John Doe'
);

// Sign in
const user = await firebaseAuthService.signIn(
  'user@example.com',
  'password123'
);

// Sign in with Google
const user = await firebaseAuthService.signInWithGoogle();

// Listen to auth changes
const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
  if (user) {
    console.log('User logged in:', user);
  } else {
    console.log('User logged out');
  }
});
```

### Firestore Database

```typescript
import { firebaseFirestoreService, COLLECTIONS } from '@/services/firebaseFirestore';

// Add document
const projectId = await firebaseFirestoreService.addDocument(
  COLLECTIONS.PROJECTS,
  {
    title: 'Community Pool Passes',
    goal: 8000,
    raised: 0,
    category: 'Community',
  }
);

// Get document
const project = await firebaseFirestoreService.getDocument(
  COLLECTIONS.PROJECTS,
  projectId
);

// Update document
await firebaseFirestoreService.updateDocument(
  COLLECTIONS.PROJECTS,
  projectId,
  { raised: 1000 }
);

// Query documents
const activeProjects = await firebaseFirestoreService.queryDocuments(
  COLLECTIONS.PROJECTS,
  [{ field: 'status', operator: '==', value: 'active' }],
  'createdAt',
  10
);
```

### Firebase Storage

```typescript
import { firebaseStorageService, STORAGE_FOLDERS } from '@/services/firebaseStorage';

// Upload file
const file = event.target.files[0];
const path = firebaseStorageService.generatePath(
  userId,
  STORAGE_FOLDERS.DOCUMENTS,
  file.name
);

const downloadURL = await firebaseStorageService.uploadFile(
  file,
  path,
  (progress) => {
    console.log(`Upload progress: ${progress.progress}%`);
  }
);

// Get file URL
const url = await firebaseStorageService.getFileURL(path);

// Delete file
await firebaseStorageService.deleteFile(path);
```

### Stripe Payments

```typescript
import { stripePaymentService } from '@/services/stripePayment';
import { StripePayment } from '@/components/StripePayment';

// Create payment intent (in your component)
const handleDonate = async () => {
  const { clientSecret, paymentIntentId } = await stripePaymentService.createPaymentIntent({
    amount: 50.00,
    donorName: 'John Doe',
    donorEmail: 'john@example.com',
    projectId: 1,
    message: 'Keep up the great work!',
  });

  // Show payment form with clientSecret
  setClientSecret(clientSecret);
};

// In your JSX
<StripePayment
  clientSecret={clientSecret}
  amount={50.00}
  onSuccess={(paymentIntentId) => {
    console.log('Payment successful!', paymentIntentId);
    // Save donation to database
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
  }}
/>
```

### Recurring Donations

```typescript
// Create subscription
const subscription = await stripePaymentService.createSubscription(
  customerId,
  priceId,
  paymentMethodId
);

// Cancel subscription
await stripePaymentService.cancelSubscription(subscriptionId);
```

## 🔒 Security Best Practices

### Firebase

1. **Never expose sensitive data** in Firestore documents
2. **Use Security Rules** to protect data
3. **Validate data** on both client and server
4. **Enable App Check** to prevent abuse
5. **Monitor usage** in Firebase Console

### Stripe

1. **Never expose Secret Key** in frontend code
2. **Use HTTPS** for all communications
3. **Validate webhooks** with signatures
4. **Handle errors gracefully**
5. **Log all transactions** for audit trail
6. **Test with test mode** before going live

## 🧪 Testing

### Firebase Testing

```bash
# Install Firebase Emulators
npm install -g firebase-tools

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

### Stripe Testing

Use test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## 📊 Monitoring

### Firebase

- Check Firebase Console for:
  - Authentication metrics
  - Database reads/writes
  - Storage usage
  - Security rule violations

### Stripe

- Monitor in Stripe Dashboard:
  - Payment success rate
  - Failed payments
  - Subscription churn
  - Revenue metrics

## 🚀 Going Live

1. **Firebase:**
   - Switch to production configuration
   - Update security rules
   - Set up backup schedules
   - Enable monitoring alerts

2. **Stripe:**
   - Get live API keys
   - Update webhook endpoints
   - Enable production mode
   - Set up payment notifications

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Stripe Testing](https://stripe.com/docs/testing)
- [PCI Compliance](https://stripe.com/docs/security)

## 🆘 Troubleshooting

### Common Issues

**Firebase Auth not working:**
- Check authorized domains
- Verify API key is correct
- Check browser console for errors

**Firestore permissions denied:**
- Review security rules
- Check user authentication status
- Verify document paths

**Stripe payment fails:**
- Verify publishable key
- Check test mode vs live mode
- Review webhook signatures
- Check network errors

For more help, contact support or check the documentation links above.
