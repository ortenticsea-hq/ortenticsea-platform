# OrtenticSEA Production Deployment Guide

**Status**: Pre-Launch Checklist  
**Last Updated**: April 7, 2026  
**Launch Target**: Q2 2026

---

## 📋 Pre-Deployment Checklist

### 1. Firebase Project Setup
- [ ] Create or use existing Firebase project for production
- [ ] Enable Firestore database
- [ ] Enable Firebase Storage
- [ ] Enable Firebase Authentication
- [ ] Enable Cloud Functions (Node.js 20+)
- [ ] Set up Firebase Hosting
- [ ] Generate Firebase Admin SDK service account JSON

### 2. Secrets Management
- [ ] Generate Paystack API keys (live/production)
- [ ] Add `PAYSTACK_SECRET_KEY` as Cloud Functions secret
- [ ] Add `GEMINI_API_KEY` environment variable
- [ ] Store service account JSON securely (NOT in git)

### 3. Authentication Setup
- [ ] Configure Firebase Auth providers:
  - [ ] Email/Password enabled
  - [ ] Google Sign-in enabled
  - [ ] Phone authentication enabled (for Nigeria)
- [ ] Add authorized redirect domains
- [ ] Create sign-up flow (if needed)

---

## 🚀 Deployment Steps

### Step 1: Deploy Firestore Security Rules ✅ READY

**Why**: Locks down database to prevent unauthorized access and data leaks.

```bash
cd c:\Users\USER\Downloads\ortenticsea-app

# Option A: Using deployment script (Windows)
scripts\deploy-firestore-rules.bat

# Option B: Manual deployment
firebase login
firebase deploy --only firestore:rules
```

**Verification**:
```bash
firebase firestore:indexes
```

**What Gets Locked Down**:
- `users/*` - Only accessible by the user or admins
- `products/{productId}` - Only approved products visible to buyers
- `sellers/*` - Only sellers and admins can read
- `orders/{orderId}` - Only buyer or admin can read
- `inventory/*` - Only seller's own inventory visible
- `applications/*` - Only admin visible (seller KYC)

---

### Step 2: Deploy Firebase Storage Rules ✅ READY

```bash
firebase deploy --only storage
```

**What It Protects**:
- Sellers can only upload to `/products/{uid}/*`
- Max file size: 5MB (products), 10MB (shops)
- Allowed formats: JPEG, PNG, WebP, PDF

---

### Step 3: Deploy Cloud Functions (Paystack)

```bash
# Set production secret
firebase functions:config:set paystack.secret_key="sk_live_..."

# Deploy functions
firebase deploy --only functions

# Verify deployment
firebase functions:list
```

**Expected Functions**:
- `initPaystackTransaction` - Initialize payment
- `paystackWebhook` - Handle payment callbacks

---

### Step 4: Configure Paystack Webhook

**Paystack Dashboard Setup**:
1. Go to https://dashboard.paystack.com/settings/developers
2. Under "Webhooks", set URL to:
   ```
   https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/paystackWebhook
   ```
3. Select events: `charge.success`, `charge.failed`
4. Verify webhook signature (already implemented)

---

### Step 5: Deploy Frontend

#### Option A: Firebase Hosting (Recommended)
```bash
npm run build
firebase deploy --only hosting
```

#### Option B: Vercel
```bash
vercel --prod
```

#### Option C: Custom Domain
1. Add custom domain in Firebase Console
2. Update DNS records (CNAME/A records)
3. Wait for SSL provisioning (24-48hrs)

---

### Step 6: Environment Variables

**Create `.env.production`** (NOT committed):
```
VITE_FIREBASE_API_KEY=sk_live_...
VITE_FIREBASE_PROJECT_ID=ortenticsea-prod
VITE_FIREBASE_STORAGE_BUCKET=ortenticsea-prod.appspot.com
VITE_GEMINI_API_KEY=sk_gemini_...
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
```

**Build for production**:
```bash
npm run typecheck
npm run build
# Output: dist/ folder ready to deploy
```

---

## 🧪 Post-Deployment Testing

### Authentication Flow
```bash
# Test Signup
- Open app at production URL
- Sign up with email
- Verify email confirmation
- Log out and log in again
- Verify session persists after refresh
```

### Seller Onboarding
```bash
# Test as seller
- Complete KYC form
- Upload shop documents (PDF)
- Verify application appears in admin dashboard
- Admin approves application
- Verify seller dashboard becomes accessible
```

### Product Listing
```bash
# Test as seller
- Upload product (with image)
- Verify product appears as "pending"
- Log in as admin
- Approve product on admin dashboard
- Log out and browse as buyer
- Verify approved product appears in feed
```

### Payment Flow
```bash
# Test Paystack integration
- Add items to cart
- Proceed to checkout
- Click "Pay Now"
- Paystack popup opens
- Complete test payment (use test card: 4111111111111111)
- Verify order status updates to "Paid"
- Verify product stock decrements
```

---

## 📊 Production Monitoring

### Firestore Quotas
Monitor in Firebase Console:
- **Read Operations**: Track to stay under free tier or budget
- **Write Operations**: Every cart update counts
- **Storage**: Images and documents
- **Egress**: Data downloads

### Cloud Functions
- Monitor cold start times
- Track error rates
- Set up alerts for failures

### Errors & Logging
```bash
# View logs
firebase functions:log

# Export logs
firebase functions:log --limit=100 > logs.json
```

---

## 🔒 Security Checklist

- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] Paystack secret key stored as Cloud Functions secret
- [ ] API keys rotated
- [ ] CORS configured (if needed)
- [ ] Rate limiting enabled (for abuse prevention)
- [ ] Email verification required for signups
- [ ] Two-factor authentication available for sellers/admins
- [ ] Failed login attempts logged
- [ ] Data encryption at rest (Firebase default)

---

## 🆘 Troubleshooting

### "Permission Denied" when deploying rules
```bash
# Ensure logged in
firebase login
firebase projects:list
firebase project:set prod-project-id
```

### Paystack webhook not firing
- Check Firebase Cloud Functions logs
- Verify webhook URL in Paystack dashboard matches deployment
- Test webhook signature validation

### Images not uploading
- Check Storage rules in `storage.rules`
- Verify file size < 5MB
- Verify format is JPEG/PNG/WebP

---

## 📞 Support Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Paystack Support**: support@paystack.com
- **Gemini API**: https://ai.google.dev/support

---

*For questions, refer to architecture documentation in `/docs`*
