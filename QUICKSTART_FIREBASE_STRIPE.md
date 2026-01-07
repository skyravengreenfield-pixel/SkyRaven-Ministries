# Quick Start: Firebase & Stripe Integration

## 🚀 Setup in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `firebase` - Firebase SDK
- `@stripe/stripe-js` - Stripe JavaScript SDK
- `@stripe/react-stripe-js` - Stripe React components

### Step 2: Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env.local
```

Add your credentials to `.env.local`:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### Step 3: Initialize Firebase

In your `src/main.tsx`, add Firebase initialization:

```typescript
import { initializeFirebase } from './config/firebase';

// Initialize Firebase before rendering
initializeFirebase();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 4: Use Firebase Auth

```typescript
import { firebaseAuthService } from './services/firebaseAuth';

// Sign up a user
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
```

### Step 5: Process Payments with Stripe

```typescript
import { stripePaymentService } from './services/stripePayment';
import { StripePayment } from './components/StripePayment';

// Create payment intent
const { clientSecret } = await stripePaymentService.createPaymentIntent({
  amount: 50.00,
  donorName: 'John Doe',
  donorEmail: 'john@example.com',
});

// Render payment form
<StripePayment
  clientSecret={clientSecret}
  amount={50.00}
  onSuccess={(paymentIntentId) => {
    console.log('Payment successful!', paymentIntentId);
  }}
/>
```

## 📦 What's Included

### Firebase Services

1. **Authentication** (`firebaseAuth.ts`)
   - Email/password sign up and login
   - Google authentication
   - Password reset
   - Auth state observer

2. **Firestore Database** (`firebaseFirestore.ts`)
   - CRUD operations
   - Query with filters
   - Real-time updates support
   - Collection management

3. **Storage** (`firebaseStorage.ts`)
   - File uploads with progress
   - File deletion
   - Download URLs
   - Directory listing

### Stripe Services

1. **Payment Processing** (`stripePayment.ts`)
   - One-time payments
   - Payment intents
   - Card validation
   - Subscription support

2. **Payment Component** (`StripePayment.tsx`)
   - Ready-to-use payment form
   - Stripe Elements integration
   - Error handling
   - Loading states

## 🎯 Common Use Cases

### User Registration

```typescript
import { firebaseAuthService } from '@/services/firebaseAuth';
import { firebaseFirestoreService, COLLECTIONS } from '@/services/firebaseFirestore';

async function registerUser(email: string, password: string, name: string) {
  // Create auth account
  const user = await firebaseAuthService.signUp(email, password, name);
  
  // Create user document in Firestore
  await firebaseFirestoreService.addDocument(COLLECTIONS.USERS, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'Supporter',
    createdAt: new Date(),
  });
}
```

### Process Donation

```typescript
import { stripePaymentService } from '@/services/stripePayment';
import { firebaseFirestoreService, COLLECTIONS } from '@/services/firebaseFirestore';

async function processDonation(amount: number, donorInfo: any) {
  // Create payment intent
  const { clientSecret, paymentIntentId } = 
    await stripePaymentService.createPaymentIntent({
      amount,
      donorName: donorInfo.name,
      donorEmail: donorInfo.email,
    });
  
  // After successful payment, save to Firestore
  await firebaseFirestoreService.addDocument(COLLECTIONS.DONATIONS, {
    amount,
    donorName: donorInfo.name,
    donorEmail: donorInfo.email,
    paymentIntentId,
    status: 'completed',
  });
}
```

### Upload Document

```typescript
import { firebaseStorageService, STORAGE_FOLDERS } from '@/services/firebaseStorage';

async function uploadDocument(file: File, userId: string) {
  const path = firebaseStorageService.generatePath(
    userId,
    STORAGE_FOLDERS.DOCUMENTS,
    file.name
  );
  
  const downloadURL = await firebaseStorageService.uploadFile(
    file,
    path,
    (progress) => {
      console.log(`Upload: ${progress.progress}%`);
    }
  );
  
  return downloadURL;
}
```

## 🔑 Get Your Credentials

### Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select project
3. Go to Project Settings > General
4. Scroll to "Your apps" and add a web app
5. Copy the configuration

### Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API keys
3. Copy your Publishable key (starts with `pk_test_` or `pk_live_`)

## ✅ Verification

Test your setup:

```bash
# Start dev server
npm run dev

# In browser console:
# Check Firebase
console.log('Firebase initialized:', window.firebase !== undefined);

# Check Stripe
console.log('Stripe loaded:', window.Stripe !== undefined);
```

## 📚 Next Steps

1. Set up Firebase Security Rules (see `FIREBASE_STRIPE_INTEGRATION.md`)
2. Configure Stripe webhooks for your backend
3. Test with Stripe test cards
4. Review security best practices
5. Set up monitoring and alerts

## 🆘 Need Help?

- Firebase issues: Check Firebase Console > Usage
- Stripe issues: Check Stripe Dashboard > Logs
- See full documentation: `FIREBASE_STRIPE_INTEGRATION.md`

---

**You're all set! Start building amazing features! 🎉**
