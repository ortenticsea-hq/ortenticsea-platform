# Firebase Hosting Deployment Guide

**Last Updated**: April 7, 2026  
**Status**: Production Ready  

---

## 🚀 Quick Start

### Prerequisites
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify you're logged in
firebase projects:list
```

### Deploy in 3 commands
```bash
# Set your project
firebase use --add

# Build the app
npm run build

# Deploy
firebase deploy
```

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Create `.env.production` (NOT committed to git):
```env
# Firebase
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_PROJECT_ID=ortenticsea-prod
VITE_FIREBASE_AUTH_DOMAIN=ortenticsea-prod.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=ortenticsea-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123...

# Gemini AI
VITE_GEMINI_API_KEY=AIzaSy...

# Paystack (Public key only - Secret handled by Cloud Functions)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...

# Optional: Firebase Emulator
VITE_USE_FIREBASE_EMULATOR=false
```

### 2. Firebase Configuration
Verify `firebase.json`:
```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 3. Security Rules Deployed
```bash
# Verify Firestore rules are live
firebase firestore:indexes

# Verify Storage rules are live  
firebase deploy --only storage --dry-run
```

### 4. Cloud Functions Secrets Set
```bash
# Set Paystack secret
firebase functions:config:set paystack.secret_key="sk_live_..."

# View all secrets
firebase functions:config:get
```

### 5. Build Works Locally
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run typecheck
npm run build

# Test build locally
npm run preview
```

---

## 🔧 Detailed Deployment Steps

### Step 1: Setup Firebase Project

#### In Firebase Console
1. Go to https://console.firebase.google.com
2. Create or select your production project
3. Enable Firestore, Storage, Cloud Functions, Hosting
4. Note your Project ID

#### In Your Project
```bash
cd c:\Users\USER\Downloads\ortenticsea-app

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Storage
# - Functions (Node.js)
# - Hosting
# - Emulators (optional)
```

### Step 2: Configure Project
```bash
# Set active project
firebase projects:list
firebase use ortenticsea-prod  # Replace with your project ID

# Verify configuration
cat firebase.json
```

### Step 3: Set Environment & Secrets
```bash
# Create .env.production file
# (Add values from Firebase Console and Paystack Dashboard)

# Set Cloud Functions secrets
firebase functions:config:set paystack.secret_key="sk_live_YOUR_KEY"
firebase functions:config:set gemini.api_key="AIzaSy_YOUR_KEY" # Optional

# Verify secrets are set
firebase functions:config:get
```

### Step 4: Build Application
```bash
# Install dependencies
npm install

# Create optimized production build
npm run build

# Output goes to: dist/

# Verify build
ls -la dist/
```

### Step 5: Deploy
```bash
# Option A: Deploy Everything (Recommended first time)
firebase deploy

# Option B: Deploy Selectively
firebase deploy --only firestore:rules,storage,hosting,functions

# Option C: Dry run to preview changes
firebase deploy --dry-run

# Option D: Deploy with specific project
firebase deploy -P ortenticsea-prod
```

### Step 6: Monitor Deployment
```bash
# View deployment logs
firebase deploy --log-json  # JSON format for parsing

# View function logs (real-time)
firebase functions:log

# View hosting logs
firebase hosting:list
```

---

## 🌍 Custom Domain Setup

### Add Custom Domain
```bash
# In Firebase Console:
# 1. Go to Hosting tab
# 2. Click "Add Custom Domain"
# 3. Enter your domain (e.g., ortenticsea.com)
```

### DNS Configuration
1. **For CNAME** (subdomain):
   ```
   Host: www
   Value: YOUR-PROJECT.firebaseapp.com
   TTL: 3600
   ```

2. **For A record** (root domain):
   ```
   Host: @
   Value: 151.101.1.195    (Firebase IP1)
   Value: 151.101.65.195   (Firebase IP2)
   Value: 151.101.129.195  (Firebase IP3)
   Value: 151.101.193.195  (Firebase IP4)
   ```

### SSL Certificate
- Firebase automatically provisions SSL
- Wait 24-48 hours for DNS propagation
- Check status in Firebase Console

---

## 📊 Post-Deployment Checklist

### Verify Deployment
```bash
# Check hosting deployment
firebase hosting:list

# Test API endpoints
curl https://YOUR-PROJECT.firebaseapp.com/

# Check function endpoints
firebase functions:list
```

### Performance Check
- Open app in browser
- Check Network tab (should load in <3s)
- Check Console for errors
- Test on mobile device

### Functionality Tests
- [ ] Authentication (Sign up/Login)
- [ ] Product browsing
- [ ] Seller onboarding
- [ ] Product upload (with images)
- [ ] Payment flow (Paystack)
- [ ] Admin dashboard
- [ ] Chat functionality

---

## 🔍 Troubleshooting

### "Cannot find dist directory"
```bash
# Rebuild
npm run build

# Verify dist exists
ls -la dist/
```

### "Authentication required"
```bash
# Login again
firebase logout
firebase login

# Or use service account
firebase deploy --token "$FIREBASE_TOKEN"  # CI/CD
```

### "Firestore rules not deployed"
```bash
# Deploy rules explicitly
firebase deploy --only firestore:rules

# Check rule status
firebase firestore:indexes
```

### "Cloud Function deployment fails"
```bash
# Check function logs
firebase functions:log --limit 50

# Verify secrets are set
firebase functions:config:get

# Redeploy functions only
firebase deploy --only functions
```

### "504 Gateway Timeout"
- Function is cold starting (first invocation takes 5-10s)
- Wait for warm-up invocations
- Consider using Cloud Functions budget tier

### "Domain still resolving to old IP"
- DNS cache: clear browser cache, restart router
- Wait 24-48 hours for full propagation
- Check with `nslookup` or `dig` command

---

## 🚨 Emergency Rollback

### If Deployment Breaks Production
```bash
# View previous versions
firebase hosting:versions:list

# Rollback to previous version
firebase hosting:versions:promote VERSION_ID

# Or redeploy last working build
git checkout last_working_commit
npm run build
firebase deploy --only hosting
```

---

## 📈 Monitoring & Analytics

### View Real-time Metrics
1. Go to Firebase Console
2. Navigate to Hosting → Analytics
3. Monitor:
   - Page load times
   - Error rates
   - Bandwidth usage

### Set Up Alerts
```bash
# Monitor Cloud Functions for errors
firebase functions:log --log-only "error"

# Monitor Firestore writes
firebase firestore:stats
```

### Logs & Debugging
```bash
# Export logs for analysis
firebase functions:log > logs.txt

# View specific function logs
firebase functions:log --function=initPaystackTransaction

# Live streaming logs
firebase functions:log --follow
```

---

## 💾 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run typecheck
      - run: npm run build
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: ortenticsea-prod
```

---

## 🔐 Security Best Practices

- [ ] Never commit `.env.production` or `serviceAccount.json`
- [ ] Rotate API keys quarterly
- [ ] Use Cloud Functions for sensitive operations
- [ ] Enable 2FA on Firebase account
- [ ] Audit access logs regularly
- [ ] Set up billing alerts
- [ ] Use strong database backup strategy

---

## 📞 Support Resources

- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **CLI Reference**: https://firebase.google.com/docs/cli
- **Community**: https://stackoverflow.com/questions/tagged/firebase
- **Status**: https://status.firebase.google.com

---

*For emergency support: Check Firebase Status Page or contact Firebase Support*
