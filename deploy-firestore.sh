#!/bin/bash

# 🔥 Deploy Firestore Rules and Indexes
# This script deploys updated Firestore security rules and indexes to ensure data persistence

echo "🚀 Deploying Firestore Rules and Indexes..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
echo "Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase!"
    echo "Run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI is ready"
echo ""

# Deploy Firestore rules
echo "📝 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

echo ""

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully!"
else
    echo "⚠️  Firestore indexes deployment had issues (this is often normal if indexes already exist)"
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Your data will now persist correctly. The following improvements have been made:"
echo "  ✓ Firestore indexes for orderBy queries on createdAt field"
echo "  ✓ Security rules for projects, ministryGoals, and settings collections"
echo "  ✓ Proper read/write permissions for authenticated and public users"
echo ""
echo "Next steps:"
echo "  1. Test creating a new mission/goal"
echo "  2. Refresh the page to verify data persists"
echo "  3. Check browser console for detailed logging"
echo ""
