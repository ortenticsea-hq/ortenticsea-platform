# Quick Integration Checklist

**Purpose**: Checklist for integrating the new features into App.tsx  
**Estimated Time**: 1-2 hours  
**Status**: 🔴 NOT YET INTEGRATED

---

## ✏️ What's Already Done

✅ CheckoutView created and imported in App.tsx  
✅ Checkout routing added to App.tsx  
✅ FirestoreService enhanced with getOrder/deleteOrder  
✅ Paystack service ready to use  

---

## 📝 What Still Needs Integration

### 1. Integrate usePersistedCart (⏱️ 30 mins)

**File**: `App.tsx`

**Current Code**:
```typescript
const [cartItems, setCartItems] = useState<CartItem[]>([]);
```

**New Code**:
```typescript
// Option A: Replace entire cart logic with persisted hook
const { 
  cartItems, 
  addToCart: persistedAddToCart,
  removeFromCart: persistedRemoveFromCart,
  updateQuantity: persistedUpdateQuantity,
  clearCart 
} = usePersistedCart(currentUser?.id || null);

// Option B: Keep current code but sync to Firestore on changes
useEffect(() => {
  if (currentUser?.id) {
    const cartRef = doc(db, `users/${currentUser.id}/cart`, 'default');
    setDoc(cartRef, {
      userId: currentUser.id,
      items: cartItems,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(console.error);
  }
}, [cartItems, currentUser?.id]);
```

**Import Required**:
```typescript
import { usePersistedCart } from './hooks/usePersistedCart.ts';
```

**Test**:
- [ ] Add item to cart
- [ ] Refresh page
- [ ] Verify item still in cart
- [ ] Open in another tab
- [ ] Verify real-time sync

---

### 2. Integrate usePersistedConversation (⏱️ 45 mins)

**File**: `views/ChatView.tsx` (or wherever chat is implemented)

**Current Code**:
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
```

**New Code**:
```typescript
const { 
  messages, 
  sendMessage, 
  loading 
} = usePersistedConversation(currentUser?.id, selectedSellerId);

const handleSendMessage = async (text: string) => {
  await sendMessage(text, currentUser!.name, currentUser?.avatar);
};
```

**Import Required**:
```typescript
import { usePersistedConversation } from '../hooks/usePersistedConversation.ts';
```

**Test**:
- [ ] Send message from buyer
- [ ] Switch to seller account
- [ ] Verify message received
- [ ] Reply from seller
- [ ] Verify real-time update
- [ ] Refresh page
- [ ] Verify message history persisted

---

### 3. Integrate ImageUpload Component (⏱️ 45 mins)

**File**: `views/SellerOnboardingView.tsx` or `views/SellerDashboardView.tsx`

**Where to Add**:
```typescript
import ImageUpload from '../components/ImageUpload.tsx';

// In your form
<ImageUpload
  userId={currentUser.id}
  context="product"
  maxFiles={5}
  maxSizeKB={5000}
  onUploadSuccess={(urls) => {
    setProductData({ ...productData, images: urls });
  }}
  onUploadError={(error) => {
    setError(error);
  }}
/>
```

**Test**:
- [ ] Upload single image
- [ ] Upload multiple images (drag-drop)
- [ ] Test file size limit (5MB)
- [ ] Test file type validation
- [ ] Verify compression occurs
- [ ] Check Firebase Storage for files
- [ ] Verify URLs returned

---

### 4. Verify Paystack Integration (⏱️ 15 mins)

**Current Status**: ✅ Already integrated via CheckoutView

**Verify**:
```bash
# In .env.production, verify:
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...  # (or pk_test_...)

# In Cloud Functions, verify:
firebase functions:config:get
# Should output:
# { paystack: { secret_key: "sk_live_..." } }
```

**Test**:
- [ ] Go to cart
- [ ] Click "Proceed to Checkout"
- [ ] Click "Pay with Paystack"
- [ ] Paystack popup opens
- [ ] Can complete payment flow

---

### 5. Environment Variables Setup (⏱️ 10 mins)

**File**: `.env.production` (create if doesn't exist)

```env
# Firebase Config
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=ortenticsea-prod
VITE_FIREBASE_AUTH_DOMAIN=ortenticsea-prod.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=ortenticsea-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123...

# Payments
VITE_PAYSTACK_PUBLIC_KEY=pk_live_... (or pk_test_ for testing)

# AI
VITE_GEMINI_API_KEY=AIzaSy...

# Optional
VITE_USE_FIREBASE_EMULATOR=false
```

**⚠️ IMPORTANT**: Do NOT commit this file. Add to .gitignore:
```
.env.production
.env.local
.env*.local
```

---

### 6. Build & Test (⏱️ 20 mins)

```bash
# Install dependencies (if needed)
npm install

# Type check
npm run typecheck

# Build
npm run build

# Test build locally
npm run preview
# Go to http://localhost:4173

# Manual Testing Checklist:
# [ ] App loads without errors
# [ ] Can sign in
# [ ] Can browse products
# [ ] Can add to cart + refresh (persists)
# [ ] Can go to checkout
# [ ] Paystack popup opens
# [ ] Can send messages in chat
# [ ] Can upload images
```

---

### 7. Pre-Deployment Security Check (⏱️ 10 mins)

```bash
# Verify no secrets in code
grep -r "sk_live_" src/
grep -r "pk_live_" src/
# Should return: NOTHING

# Verify .env.production is in .gitignore
grep ".env.production" .gitignore
# Should return: .env.production

# Verify no console.log with sensitive data
grep -r "console.log.*secret\|console.log.*key" src/
# Should return: NOTHING
```

---

## 🔄 Integration Order (Recommended)

1. **First**: Verify Paystack integration (already done ✅)
2. **Second**: Integrate usePersistedCart (highest impact)
3. **Third**: Integrate ImageUpload (needed for sellers)
4. **Fourth**: Integrate usePersistedConversation (nice-to-have for this phase)
5. **Fifth**: Environment setup and build
6. **Sixth**: Full testing suite

---

## 📋 Testing Checklist After Integration

### Functional Testing
- [ ] All views load without errors
- [ ] Navigation works
- [ ] Data persists after refresh
- [ ] Real-time updates work
- [ ] Payments complete successfully
- [ ] Admin controls work
- [ ] Seller workflows complete

### Performance Testing
- [ ] Home page loads < 3 seconds
- [ ] No console errors
- [ ] Network requests reasonable
- [ ] Images load fast
- [ ] Chat loads messages quickly

### Security Testing
- [ ] Unauthenticated users blocked from protected routes
- [ ] Firestore security rules block unauthorized access
- [ ] Paystack secret key not exposed
- [ ] No sensitive data in localStorage
- [ ] HTTPS enforced

### Mobile Testing
- [ ] Responsive layout works
- [ ] Touch targets adequate
- [ ] Images scale correctly
- [ ] Navigation accessible

---

## 🐛 If You Get Errors...

### "usePersistedCart is not defined"
```bash
# Make sure import is correct:
import { usePersistedCart } from './hooks/usePersistedCart.ts';
```

### "ImageUpload component not found"
```bash
# Make sure component exists:
ls components/ImageUpload.tsx

# And import is correct:
import ImageUpload from '../components/ImageUpload.tsx';
```

### "Paystack not loading"
```typescript
// Check that script is loading:
// Should be in CheckoutView.tsx useEffect
// If not, manually add to index.html:
<script src="https://js.paystack.co/v1/inline.js"></script>
```

### "Firebase storage not authorized"
```
// Check storage.rules - should allow user uploads to /products/{uid}/*
// Check Firebase project has Storage enabled
// Check .env.production has STORAGE_BUCKET set
```

---

## ✅ Sign-Off

Once all integration is complete and tested, sign off:

**Developer**: _________________ Date: _______

**QA**: _________________ Date: _______

---

## 📞 Need Help?

- Check error messages in browser console
- Review the original feature docs:
  - Cart: `docs/FIRESTORE_MIGRATION.md`
  - Images: `components/ImageUpload.tsx` (comments in code)
  - Chat: `hooks/usePersistedConversation.ts` (comments in code)
- Review full testing guide: `docs/END_TO_END_TESTING_GUIDE.md`

---

*Last Updated: April 7, 2026*
