#!/bin/bash
# Deploy Firebase Functions Script
# Run this on your LOCAL COMPUTER, not in the dev container

echo "🚀 SkyRaven Ministries - Firebase Functions Deployment"
echo "=================================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login

# Navigate to functions directory and install dependencies
echo "📦 Installing function dependencies..."
cd functions
npm install
cd ..

# Get Stripe Secret Key from user
echo ""
echo "🔑 Enter your Stripe Secret Key (from https://dashboard.stripe.com/apikeys)"
echo "    It should start with sk_live_ or sk_test_"
read -p "Stripe Secret Key: " STRIPE_KEY

# Configure Stripe
echo "⚙️  Configuring Stripe..."
firebase functions:config:set stripe.secret_key="$STRIPE_KEY"

# Deploy functions
echo "🚀 Deploying Firebase Functions..."
firebase deploy --only functions

echo ""
echo "✅ Deployment Complete!"
echo "Your payment portal is now LIVE!"
echo ""
echo "Function URLs:"
echo "https://us-central1-skyraven-ministries.cloudfunctions.net/createPaymentIntent"
echo "https://us-central1-skyraven-ministries.cloudfunctions.net/createCustomer"
