#!/bin/bash

# Firestore Security Rules Deployment Script
# This script deploys the Firestore security rules to Firebase

echo "🔐 Deploying Firestore Security Rules..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Check if user is logged in
echo "🔑 Checking Firebase authentication..."
firebase login:list

# Deploy rules
echo ""
echo "🚀 Deploying rules to Firebase..."
firebase deploy --only firestore:rules

# Check deployment status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Firestore security rules deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Test rules in Firebase Console Rules Playground"
    echo "  2. Monitor for permission errors in Firebase Console"
    echo "  3. Review audit logs for security violations"
    echo ""
    echo "📚 Documentation: docs/SECURITY_RULES_GUIDE.md"
else
    echo ""
    echo "❌ Deployment failed. Please check the error messages above."
    echo ""
    echo "💡 Troubleshooting:"
    echo "  1. Ensure you're logged in: firebase login"
    echo "  2. Check your Firebase project: firebase use"
    echo "  3. Verify firestore.rules file exists"
    echo ""
fi
