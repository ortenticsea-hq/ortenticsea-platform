# Firestore Security Rules Guide

## Overview

This document explains the Firestore Security Rules implemented for the Ortenticsea marketplace and provides instructions for deployment and testing.

## Security Rules Location

The security rules are defined in [`firestore.rules`](../firestore.rules) at the project root.

## Deployment Instructions

### Method 1: Firebase Console (Recommended for First-Time Setup)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of [`firestore.rules`](../firestore.rules)
5. Paste into the rules editor
6. Click **Publish**

### Method 2: Firebase CLI (Recommended for Production)

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### Method 3: Automated Deployment (CI/CD)

Add to your GitHub Actions or deployment pipeline:

```yaml
- name: Deploy Firestore Rules
  run: |
    npm install -g firebase-tools
    firebase deploy --only firestore:rules --token ${{ secrets.FIREBASE_TOKEN }}
```

## Security Rules Structure

### Helper Functions

```javascript
// Check if user is authenticated
function isAuthenticated()

// Check if user owns a resource
function isOwner(userId)

// Check if user is admin
function isAdmin()

// Check if user is seller
function isSeller()

// Check if user is seller or admin
function isSellerOrAdmin()

// Validate email format
function isValidEmail(email)
```

### Collection Rules Summary

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| **users** | Owner/Admin | Owner | Owner/Admin | Admin |
| **products** | Public | Seller/Admin | Owner/Admin | Owner/Admin |
| **sellers** | Public | Authenticated | Owner/Admin | Admin |
| **categories** | Public | Admin | Admin | Admin |
| **reviews** | Public | Authenticated | Owner/Admin | Owner/Admin |
| **applications** | Owner/Admin | Authenticated | Admin | Admin |
| **inventory** | Owner/Admin | Seller/Admin | Owner | Owner/Admin |
| **sharedCartComments** | Public | Authenticated | None | Admin |
| **reports** | Admin | Authenticated | Admin | Admin |
| **transactions** | Participant/Admin | Authenticated | Admin | None |
| **conversations** | Participant/Admin | Participant | Participant | Admin |

## Detailed Rules Explanation

### 1. Users Collection (`/users/{userId}`)

**Purpose:** Store user profiles synced with Firebase Auth

**Rules:**
- **Read:** Users can read their own profile, admins can read all
- **Create:** Users can create their own profile with valid data
- **Update:** Users can update their own profile, admins can update any
- **Delete:** Only admins can delete users

**Validation:**
- Email must be valid format
- Role must be 'buyer' or 'seller'
- User ID must match authenticated user

**Example:**
```javascript
// ✅ Allowed: User reading own profile
get(/databases/$(database)/documents/users/$(request.auth.uid))

// ❌ Denied: User reading another user's profile
get(/databases/$(database)/documents/users/otherUserId)

// ✅ Allowed: Admin reading any profile
// (if user's role is 'admin')
```

### 2. Products Collection (`/products/{productId}`)

**Purpose:** Marketplace product listings

**Rules:**
- **Read:** Public (anyone can browse products)
- **Create:** Sellers/Admins only, must own the product
- **Update:** Product owner or admin
- **Delete:** Product owner or admin

**Validation:**
- Seller ID must match authenticated user
- Name must be string
- Price must be positive number
- Status must be valid enum value

**Example:**
```javascript
// ✅ Allowed: Anyone reading products
// ✅ Allowed: Seller creating product with their ID
// ❌ Denied: Seller creating product with another seller's ID
// ❌ Denied: Buyer creating product
```

### 3. Applications Collection (`/applications/{applicationId}`)

**Purpose:** Seller KYC applications

**Rules:**
- **Read:** Application owner or admin
- **Create:** Authenticated users, must be 'pending' status
- **Update:** Admin only (for approval/rejection)
- **Delete:** Admin only

**Validation:**
- User ID must match authenticated user
- Initial status must be 'pending'
- Shop name, phone, and email required
- Email must be valid format

**Example:**
```javascript
// ✅ Allowed: User creating their own application
// ✅ Allowed: Admin approving application
// ❌ Denied: User updating their own application
// ❌ Denied: User reading another user's application
```

### 4. Inventory Collection (`/inventory/{itemId}`)

**Purpose:** Seller inventory management (Seller Tools)

**Rules:**
- **Read:** Inventory owner or admin
- **Create:** Sellers/Admins, must own the inventory
- **Update:** Inventory owner
- **Delete:** Inventory owner or admin

**Validation:**
- Seller ID must match authenticated user
- Name, purchase price, expected price required
- Status must be 'available' or 'sold'

**Example:**
```javascript
// ✅ Allowed: Seller reading their own inventory
// ✅ Allowed: Seller creating inventory item
// ❌ Denied: Seller reading another seller's inventory
// ❌ Denied: Buyer accessing inventory
```

### 5. Reviews Collection (`/reviews/{reviewId}`)

**Purpose:** Product and seller reviews

**Rules:**
- **Read:** Public (transparency)
- **Create:** Authenticated users
- **Update/Delete:** Review owner or admin

**Validation:**
- User ID must match authenticated user
- Rating must be 1-5
- Target type must be 'product' or 'seller'

**Example:**
```javascript
// ✅ Allowed: Anyone reading reviews
// ✅ Allowed: Authenticated user creating review
// ✅ Allowed: User updating their own review
// ❌ Denied: User updating another user's review
```

### 6. Shared Cart Comments (`/sharedCartComments/{commentId}`)

**Purpose:** Collaborative shopping comments

**Rules:**
- **Read:** Public (cart sharing is public by design)
- **Create:** Authenticated users
- **Update:** None (immutable)
- **Delete:** Admin only

**Validation:**
- Cart ID, user name, text, timestamp required
- All fields must be strings

**Example:**
```javascript
// ✅ Allowed: Anyone reading comments
// ✅ Allowed: Authenticated user adding comment
// ❌ Denied: Anyone updating comments (immutable)
```

### 7. Transactions Collection (`/transactions/{transactionId}`)

**Purpose:** Payment and escrow tracking (Future)

**Rules:**
- **Read:** Transaction participants or admin
- **Create:** Authenticated users
- **Update:** Admin only (status changes)
- **Delete:** None (immutable)

**Example:**
```javascript
// ✅ Allowed: Buyer reading their transaction
// ✅ Allowed: Seller reading their transaction
// ✅ Allowed: Admin updating transaction status
// ❌ Denied: User updating transaction
// ❌ Denied: Anyone deleting transaction
```

### 8. Conversations Collection (`/conversations/{conversationId}`)

**Purpose:** Chat message persistence (Future)

**Rules:**
- **Read:** Conversation participants or admin
- **Create:** Authenticated users (must be participant)
- **Update:** Participants only
- **Delete:** Admin only

**Subcollection - Messages:**
- **Read:** Conversation participants
- **Create:** Participants (must be sender)
- **Update/Delete:** None (immutable)

**Example:**
```javascript
// ✅ Allowed: Participant reading conversation
// ✅ Allowed: Participant sending message
// ❌ Denied: Non-participant reading conversation
// ❌ Denied: Anyone updating messages
```

## Role-Based Access Control

### Admin Role

Admins have elevated privileges:
- Read all user profiles
- Manage all products
- Approve/reject seller applications
- Manage all inventory
- Delete any content
- Update transaction statuses
- Access all conversations

**Admin Check:**
```javascript
function isAdmin() {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

**Setting Admin Role:**
Admins must be set in the users collection:
```javascript
{
  id: "userId",
  role: "admin",
  // ... other fields
}
```

### Seller Role

Sellers have special privileges:
- Create products
- Manage their own inventory
- Update their seller profile

**Seller Check:**
```javascript
function isSeller() {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'seller';
}
```

### Buyer Role

Buyers have standard privileges:
- Browse products
- Create reviews
- Submit seller applications
- Add cart comments

## Testing Security Rules

### Method 1: Firebase Console Rules Playground

1. Go to Firebase Console → Firestore → Rules
2. Click **Rules Playground** tab
3. Select operation type (get, list, create, update, delete)
4. Enter document path
5. Set authentication state
6. Click **Run**

### Method 2: Firebase Emulator Suite

```bash
# Install emulators
firebase init emulators

# Start emulators
firebase emulators:start

# Run tests
npm test
```

### Method 3: Unit Tests

Create `firestore.rules.test.js`:

```javascript
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

describe('Firestore Security Rules', () => {
  it('allows users to read their own profile', async () => {
    const db = getFirestore('user123');
    await assertSucceeds(db.collection('users').doc('user123').get());
  });
  
  it('denies users from reading other profiles', async () => {
    const db = getFirestore('user123');
    await assertFails(db.collection('users').doc('user456').get());
  });
  
  // Add more tests...
});
```

## Common Security Scenarios

### Scenario 1: User Registration

```javascript
// ✅ Allowed
await setDoc(doc(db, 'users', currentUser.uid), {
  id: currentUser.uid,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'buyer',
  emailVerified: false
});
```

### Scenario 2: Seller Creating Product

```javascript
// ✅ Allowed (if user is seller)
await setDoc(doc(db, 'products', productId), {
  id: productId,
  sellerId: currentUser.uid, // Must match auth user
  name: 'iPhone 12',
  price: 50000,
  status: 'pending_approval'
});

// ❌ Denied (sellerId doesn't match)
await setDoc(doc(db, 'products', productId), {
  sellerId: 'anotherUserId', // ❌ Not allowed
  // ...
});
```

### Scenario 3: Admin Approving Application

```javascript
// ✅ Allowed (if user is admin)
await updateDoc(doc(db, 'applications', appId), {
  status: 'approved'
});

// ❌ Denied (if user is not admin)
```

### Scenario 4: User Adding Review

```javascript
// ✅ Allowed (if authenticated)
await addDoc(collection(db, 'reviews'), {
  userId: currentUser.uid, // Must match auth user
  userName: currentUser.name,
  targetId: productId,
  targetType: 'product',
  rating: 5, // Must be 1-5
  comment: 'Great product!',
  date: new Date().toISOString()
});
```

## Security Best Practices

### 1. Always Validate Input

```javascript
// ✅ Good: Validate data types and ranges
allow create: if request.resource.data.price is number &&
                request.resource.data.price > 0;

// ❌ Bad: No validation
allow create: if true;
```

### 2. Use Helper Functions

```javascript
// ✅ Good: Reusable helper
function isOwner(userId) {
  return request.auth.uid == userId;
}

// ❌ Bad: Repeated logic
allow read: if request.auth.uid == resource.data.userId;
allow update: if request.auth.uid == resource.data.userId;
```

### 3. Principle of Least Privilege

```javascript
// ✅ Good: Specific permissions
allow read: if isOwner(resource.data.userId);
allow update: if isOwner(resource.data.userId);

// ❌ Bad: Overly permissive
allow read, write: if true;
```

### 4. Immutable Data

```javascript
// ✅ Good: Prevent updates to critical fields
allow update: if request.resource.data.userId == resource.data.userId;

// ❌ Bad: Allow changing ownership
allow update: if true;
```

### 5. Validate Relationships

```javascript
// ✅ Good: Verify user exists
allow create: if exists(/databases/$(database)/documents/users/$(request.resource.data.userId));

// ❌ Bad: No relationship validation
allow create: if true;
```

## Monitoring and Auditing

### Enable Firestore Audit Logs

1. Go to Firebase Console → Firestore
2. Enable **Audit Logs** in settings
3. Monitor for:
   - Permission denied errors
   - Unusual access patterns
   - Failed authentication attempts

### Set Up Alerts

```javascript
// Cloud Function to monitor security violations
exports.monitorSecurityViolations = functions.firestore
  .document('{collection}/{docId}')
  .onWrite((change, context) => {
    // Log access patterns
    // Alert on suspicious activity
  });
```

## Troubleshooting

### Issue: Permission Denied

**Symptoms:** `FirebaseError: Missing or insufficient permissions`

**Solutions:**
1. Check if user is authenticated
2. Verify user role in users collection
3. Ensure document ownership matches
4. Test rules in Rules Playground

### Issue: Rules Not Updating

**Symptoms:** Old rules still in effect

**Solutions:**
1. Clear browser cache
2. Redeploy rules: `firebase deploy --only firestore:rules`
3. Wait 1-2 minutes for propagation
4. Check Firebase Console for deployment status

### Issue: Admin Access Not Working

**Symptoms:** Admin can't access protected resources

**Solutions:**
1. Verify user document has `role: 'admin'`
2. Check helper function logic
3. Ensure admin check uses correct path
4. Test with Rules Playground

## Migration Checklist

- [x] Create comprehensive security rules
- [ ] Deploy rules to Firebase
- [ ] Test all CRUD operations
- [ ] Verify role-based access
- [ ] Test with different user types
- [ ] Monitor for permission errors
- [ ] Set up audit logging
- [ ] Document any custom rules
- [ ] Train team on security model
- [ ] Schedule regular security reviews

## Next Steps

1. **Deploy Rules:** Use Firebase CLI or Console
2. **Test Thoroughly:** Use Rules Playground and unit tests
3. **Monitor:** Set up logging and alerts
4. **Iterate:** Refine rules based on usage patterns
5. **Document:** Keep this guide updated with changes

## Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Common Patterns](https://firebase.google.com/docs/firestore/security/rules-structure)

---

**Last Updated:** January 27, 2026
**Status:** ✅ Ready for Deployment
