# End-to-End Testing Guide

**Last Updated**: April 7, 2026  
**Scope**: Production Pre-Launch Testing  
**Duration**: ~2-3 hours for complete test cycle

---

## 🎯 Test Environment Setup

### Prerequisites
- [ ] Production Firebase project active
- [ ] Paystack test merchant account (or live)
- [ ] At least 3 test user accounts (Buyer, Seller, Admin)
- [ ] Test credit card (for Paystack): `4111 1111 1111 1111`
- [ ] Proxy/VPN for testing from Nigeria (optional)

### Test Users to Create
1. **Buyer** - buyer@test.com (email verified)
2. **Seller** - seller@test.com (email verified, KYC approved)
3. **Admin** - admin@test.com (admin role assigned via custom claims)

---

## 🔐 Phase 1: Authentication & User Management

### Test 1.1: Email/Password Signup
**Steps:**
1. Go to app → Click "Login"
2. Enter new email: `testuser_${timestamp}@test.com`
3. Set password: `Test@123456`
4. Click "Sign Up"
5. Check inbox for verification email
6. Click verification link
7. Return to app

**Expected Results:**
- [ ] User created in Firebase Auth
- [ ] User document created in Firestore `users/{uid}`
- [ ] Verification email received within 30 seconds
- [ ] Email verification works
- [ ] Can log in immediately after verification

**Failure Points to Check:**
- Email received with valid verification link
- Can't proceed until email verified
- Verification link works only once

---

### Test 1.2: Google Sign-In
**Steps:**
1. Click "Sign In with Google"
2. Select Google account (or create test account)
3. Authorize app permissions
4. Return to app

**Expected Results:**
- [ ] Redirects back to app
- [ ] Logged in automatically
- [ ] User profile created
- [ ] Email verified automatically (Google provides verified email)

---

### Test 1.3: Phone Authentication (Nigeria SMS)
**Steps:**
1. Go to Login → Phone tab (if implemented)
2. Enter Nigerian phone: `+2348000000001`
3. Click "Send OTP"
4. Check SMS for OTP code
5. Enter OTP
6. Verify

**Expected Results:**
- [ ] SMS received within 30 seconds
- [ ] OTP code correct (valid 10 minutes)
- [ ] Can only retry 3 times
- [ ] Account created on successful verification

**Note**: Requires Firebase Phone Auth setup + SMS provider

---

### Test 1.4: Logout & Session Persistence
**Steps:**
1. Log in as buyer user
2. Refresh page (F5)
3. Verify still logged in
4. Click Logout
5. Refresh page again
6. Verify logged out

**Expected Results:**
- [ ] Session persists after refresh
- [ ] Logout clears session completely
- [ ] Cannot access protected routes while logged out

---

## 👤 Phase 2: Buyer Journey

### Test 2.1: Browse Products
**Steps:**
1. Log in as buyer
2. Homepage loads
3. Click "Categories"
4. Filter by category
5. Search for product
6. Click on product card

**Expected Results:**
- [ ] All approved products displayed
- [ ] Pending/rejected products hidden
- [ ] Search filters work correctly
- [ ] Product details load correctly
- [ ] Images display properly
- [ ] Seller name/rating visible

**Performance Check:**
- [ ] Page loads < 2 seconds
- [ ] Images load < 1 second each
- [ ] No console errors

---

### Test 2.2: Add to Cart & Cart Persistence
**Steps:**
1. On product detail page
2. Click "Add to Cart"
3. Hear audio feedback (if enabled)
4. Open cart
5. Verify item in cart
6. Increase quantity
7. Remove item
8. Refresh page
9. Verify cart state persisted

**Expected Results:**
- [ ] Product added to cart
- [ ] Audio feedback plays
- [ ] Cart count updates
- [ ] Quantity can be changed
- [ ] Items can be removed
- [ ] Cart persisted in Firestore
- [ ] Cart syncs across browser tabs
- [ ] Total price calculates correctly

---

### Test 2.3: Share Cart with Friend
**Steps:**
1. Add 3 products to cart
2. Click "Share Cart"
3. Copy link
4. Open incognito tab
5. Paste link
6. Verify friend sees same cart
7. Friend adds comment in shared cart
8. Return to main tab
9. Verify comment visible

**Expected Results:**
- [ ] Share link copies to clipboard
- [ ] Non-authenticated user can view shared cart
- [ ] Real-time comments work
- [ ] Comments persist
- [ ] Can regenerate link
- [ ] Can revoke access

---

### Test 2.4: Checkout Flow (Without Payment)
**Steps:**
1. Have 2 items in cart
2. Click "Proceed to Checkout"
3. Verify items listed
4. Verify total correct (₦X,XXX.00)
5. Verify delivery info auto-filled
6. Click "Edit Delivery Info"
7. Update phone/location
8. Save changes

**Expected Results:**
- [ ] Checkout view loads
- [ ] All items listed
- [ ] Total = sum of (price × qty)
- [ ] Free delivery shown
- [ ] Buyer info displays from profile
- [ ] Can edit delivery info
- [ ] Changes save to Firestore

---

### Test 2.5: Paystack Payment Integration
**Steps:**
1. At checkout with ₦X,000 total
2. Click "Pay with Paystack"
3. Paystack popup opens
4. Enter test card: `4111 1111 1111 1111`
5. Expiry: `12/25`
6. CVV: `123`
7. OTP: Check email for OTP
8. Enter OTP
9. Payment completes

**Expected Results:**
- [ ] Paystack popup opens in iframe
- [ ] Card form appears
- [ ] OTP email received
- [ ] Payment succeeds
- [ ] Redirected to success page
- [ ] Order created in Firestore `orders/{orderId}`
- [ ] Order status = "paid"
- [ ] Product quantities decremented
- [ ] Cart cleared
- [ ] Order confirmation email sent

**Error Scenarios to Test:**
- [ ] Invalid card (use `4000 0000 0000 0002`)
- [ ] Expired card
- [ ] Wrong OTP
- [ ] Close popup without completing
- [ ] Network error mid-payment

---

### Test 2.6: Order Tracking
**Steps:**
1. After successful payment
2. Go to "Your Orders"
3. Click on order
4. View order details
5. See timeline (Pending → Paid → Shipped → Delivered)

**Expected Results:**
- [ ] Order appears in list
- [ ] Order details show all items
- [ ] Order status shows "Paid"
- [ ] Seller name visible
- [ ] Timeline displays
- [ ] Can message seller

---

## 🏪 Phase 3: Seller Workflow

### Test 3.1: Seller Registration & KYC
**Steps:**
1. Log in as seller
2. Click "Start Selling"
3. Fill registration form:
   - Shop Name: "Test Shop"
   - Description: "Quality fashion"
   - Phone: +234800000000
   - Location: Abuja
4. Upload documents:
   - CAC: (PDF file)
   - Government ID: (PDF file)
   - Address: (PDF file)
5. Submit application

**Expected Results:**
- [ ] Application created in Firestore `applications/{id}`
- [ ] Status = "pending"
- [ ] Admin can see in Admin Dashboard
- [ ] Seller gets email confirmation
- [ ] Shop created with status "SUBMITTED"
- [ ] Cannot list products until approved

---

### Test 3.2: Admin Reviews Application
**Steps:**
1. Log in as admin
2. Go to Admin Dashboard
3. Click "Pending Applications"
4. Review seller documents
5. Click "Approve"

**Expected Results:**
- [ ] Application status changes to "approved"
- [ ] Seller role assigned
- [ ] Shop status changes to "APPROVED"
- [ ] Seller receives approval email
- [ ] Seller can now list products

**Rejection Flow:**
- [ ] Click "Reject"
- [ ] Enter reason: "Invalid documents"
- [ ] Application status = "rejected"
- [ ] Seller notified via email
- [ ] Seller can reapply

---

### Test 3.3: Upload Product with Images
**Steps:**
1. Log in as approved seller
2. Go to Seller Dashboard
3. Click "Add New Product"
4. Fill form:
   - Name: "iPhone 13 Pro"
   - Price: ₦150,000
   - Condition: "Like New"
   - Category: "Electronics"
   - Description: "Mint condition, 256GB"
5. Upload 3 images via drag-drop
6. Verify images compress as they upload
7. Click "List Product"

**Expected Results:**
- [ ] Images upload successfully
- [ ] Progress shows during upload
- [ ] Images compress client-side (check file sizes)
- [ ] Product created in Firestore
- [ ] Product status = "pending"
- [ ] Images stored in Firebase Storage `/products/{sellerId}/...`
- [ ] Download URLs generated
- [ ] Product appears in Seller Dashboard

**Image Validation:**
- [ ] Test with large image (10MB) → should reject
- [ ] Test with non-image file → should reject  
- [ ] Test with 6 images → should reject (max 5)

---

### Test 3.4: Admin Approves Product
**Steps:**
1. Log in as admin
2. Go to Admin Dashboard → "Pending Products"
3. Review product details
4. Click "Approve"

**Expected Results:**
- [ ] Product status changes to "approved"
- [ ] Product visible to all buyers
- [ ] Seller notified via email
- [ ] Product appears in buyer search
- [ ] Seller can edit details

**Rejection Flow:**
- [ ] Click "Reject"
- [ ] Reason: "Images not clear"
- [ ] Product status = "rejected"
- [ ] Seller can see rejection reason
- [ ] Seller can edit and resubmit

---

### Test 3.5: Seller Inventory Tracking
**Steps:**
1. Log in as seller
2. Go to "Seller Tools"
3. Add inventory item:
   - Name: "Samsung A12"
   - Purchase Price: ₦50,000
   - Expected Sell Price: ₦80,000
   - Category: "Electronics"
4. Add expense: "Transport: ₦2,000"
5. Mark as "Sold"
6. View profit calculation

**Expected Results:**
- [ ] Inventory item created in Firestore `inventory/{id}`
- [ ] Expense tracked
- [ ] Profit calculated: (₦80,000 - ₦50,000 - ₦2,000) = ₦28,000
- [ ] Data persisted across sessions
- [ ] Can view cash flow dashboard
- [ ] Can export data

---

## 💬 Phase 4: Communication

### Test 4.1: Buyer-Seller Chat
**Steps:**
1. Log in as buyer
2. Go to product detail
3. Click "Message Seller"
4. Type: "Is this still available?"
5. Send message
6. Switch to seller account
7. Check message inbox
8. Reply: "Yes, available now"

**Expected Results:**
- [ ] Conversation created in Firestore
- [ ] Messages stored with timestamps
- [ ] Real-time notification (if implemented)
- [ ] Chat history persisted
- [ ] Both parties see same conversation
- [ ] Message timestamps correct
- [ ] Can send multiple messages
- [ ] Works across tabs/devices

---

### Test 4.2: Product Inquiries
**Steps:**
1. As buyer, go to product
2. Ask question in comments/inbox
3. Seller responds
4. Verify thread format

**Expected Results:**
- [ ] Questions visible to seller
- [ ] Seller can reply
- [ ] Other buyers don't see private messages
- [ ] Conversation persisted

---

## ⭐ Phase 5: Reviews & Ratings

### Test 5.1: Post Product Review
**Steps:**
1. Log in as buyer
2. Purchase product (complete payment)
3. Wait 24 hours OR review immediately (configurable)
4. Go to "Your Orders"
5. Click product → "Leave Review"
6. Rate: 5 stars
7. Comment: "Excellent quality! Arrived quickly."
8. Submit

**Expected Results:**
- [ ] Review created in Firestore `reviews/{id}`
- [ ] Appears on product detail page
- [ ] Shows buyer name, rating, comment, date
- [ ] Product average rating updates
- [ ] Only verified buyers can review
- [ ] Only one review per buyer per product

---

### Test 5.2: Post Seller Review
**Steps:**
1. Purchase from seller
2. Delivery confirmed
3. Go to seller profile
4. Click "Rate Seller"
5. Rate: 4 stars
6. Comment: "Great seller, Fast shipping"
7. Submit

**Expected Results:**
- [ ] Seller review created
- [ ] Appears on seller profile
- [ ] Seller average rating updates
- [ ] Seller can see review in admin panel

---

## 👨‍💼 Phase 6: Admin Functions

### Test 6.1: Admin Dashboard Overview
**Steps:**
1. Log in as admin
2. Go to "Admin Dashboard"
3. Verify dashboard shows:
   - Total users count
   - Total products count
   - Total orders value
   - Pending applications
   - Pending products

**Expected Results:**
- [ ] Dashboard loads
- [ ] Numbers are accurate
- [ ] Real-time updates work
- [ ] Can filter/search

---

### Test 6.2: Manage Applications
**Steps:**
Already covered in Test 3.1

**Additional:**
- [ ] Can download seller documents
- [ ] Can request additional info
- [ ] Can block seller application

---

### Test 6.3: Manage Products  
**Steps:**
Already covered in Test 3.4

**Additional:**
- [ ] Can view all products across sellers
- [ ] Can filter by status/category
- [ ] Can search by name/ID
- [ ] Can see seller info

---

### Test 6.4: Manage Orders
**Steps:**
1. Go to Admin Dashboard → "All Orders"
2. View order details:
   - Buyer info
   - Items list  
   - Payment status
   - Shipping status
3. Click order to see full details
4. Can mark as "Shipped" or "Delivered"

**Expected Results:**
- [ ] Can see all orders
- [ ] Payment status shows correctly
- [ ] Can update order status
- [ ] Updates reflected in Firestore
- [ ] Seller notified of status changes

---

### Test 6.5: Moderate Content
**Steps:**
1. Go to Admin Dashboard → "Reports"
2. Review flagged products/sellers
3. Click "Review"
4. Take action: Approve, Reject, or Remove

**Expected Results:**
- [ ] Reports displayed
- [ ] Can see reporter and reason
- [ ] Can take action
- [ ] Decisions logged
- [ ] User notified

---

## 🔒 Phase 7: Security

### Test 7.1: Firestore Security Rules
**Test:** Unauthenticated user tries to read all orders
```bash
# From browser console (not logged in):
db.collection('orders').get()
```
**Expected:** Permission denied error

**Test:** Buyer tries to read another buyer's cart
**Expected:** Permission denied

**Test:** Seller tries to read another seller's inventory
**Expected:** Permission denied

---

### Test 7.2: Storage Security
**Test:** Try to upload file with invalid extension
**Expected:** Upload fails

**Test:** Upload file > 5MB
**Expected:** Upload fails

**Test:** Try to access another seller's uploaded images
**Expected:** 403 Forbidden

---

### Test 7.3: API Key Security
**Test:** Try to use API key from browser console
**Expected:** Works for public operations only

**Test:** Try to access secret Paystack key
**Expected:** Not exposed in client code

---

## 📱 Phase 8: Mobile & Responsive

### Test 8.1: Mobile Canvas
**Steps:**
1. Open app on iPhone 12 (or DevTools mobile view)
2. Test all flows from Phase 1-6

**Expected Results:**
- [ ] Layout responsive
- [ ] Touch targets ≥ 44x44px
- [ ] Images scale correctly
- [ ] Navigation accessible
- [ ] No horizontal scroll

### Test 8.2: Network Conditions
**Steps:**
1. DevTools → Network tab
2. Select "Slow 3G"
3. Load app and perform actions

**Expected Results:**
- [ ] App loads (initial < 10s)
- [ ] Images load with placeholder/lazy loading
- [ ] Core functionality works
- [ ] Error messages clear

### Test 8.3: Offline Mode
**Steps:**
1. DevTools → Network tab → Offline
2. Try to add product to cart
3. Go back online
4. Verify data syncs

**Expected Results:**
- [ ] Shows offline indicator
- [ ] Cart updates persist when back online
- [ ] Error messages clear
- [ ] No data loss

---

## 🎯 Phase 9: Performance

### Test 9.1: Page Load Times
Use Chrome DevTools Lighthouse:

**Targets (Nigeria 4G: ~10 Mbps):**
- [ ] Home Page: < 3 seconds (Largest Contentful Paint)
- [ ] Product Detail: < 2 seconds  
- [ ] Checkout: < 2 seconds
- [ ] Admin Dashboard: < 3 seconds

**Steps:**
1. Open DevTools → Lighthouse
2. Select "Mobile"
3. Run audit
4. Check "Performance" score ≥ 70

---

### Test 9.2: Bundle Size
```bash
npm run build

# Check dist/ folder
# Expected: < 1MB total (gzipped < 300KB)
```

---

### Test 9.3: Image Optimization
**Steps:**
1. Upload 10MB image
2. Check Console Network tab
3. Verify compressed size < 500KB

---

## ✅ Final Verification Checklist

### Critical Functions
- [ ] Authentication works (Email, Google, Phone)
- [ ] Complete payment flow works end-to-end
- [ ] Seller onboarding & approval works
- [ ] Product listing & approval works
- [ ] Orders created and tracked
- [ ] Chat/Messages work
- [ ] Admin controls work
- [ ] All data persists in Firestore
- [ ] Images upload and display correctly
- [ ] Carts sync across devices
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Security rules block unauthorized access

### Performance
- [ ] Page load times acceptable
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Works on slow networks
- [ ] Mobile responsive

### User Experience
- [ ] Error messages clear and helpful
- [ ] Loading states visible
- [ ] Forms validate properly
- [ ] Notifications work
- [ ] Navigation intuitive
- [ ] Accessibility (keyboard nav, screen reader)

---

## 🚀 Launch Sign-Off

Once **all** tests pass:

**Developer:**
- [ ] Sign-off date: ________
- [ ] Signature: _______________

**QA:**
- [ ] Sign-off date: ________
- [ ] Signature: _______________

**Product:**
- [ ] Sign-off date: ________
- [ ] Signature: _______________

---

## 📝 Defect Log

| Date | Issue | Severity | Status | Fix |
|------|-------|----------|--------|-----|
| | | | | |

---

*For ongoing testing procedures, see: `/docs/TESTING_PROCEDURES.md`*
