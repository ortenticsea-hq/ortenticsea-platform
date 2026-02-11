# Firestore Migration Guide

## Overview

This document outlines the migration from localStorage to Cloud Firestore for the Ortenticsea marketplace application. The migration enables real-time data synchronization, better scalability, and multi-device support.

## Migration Status

### ✅ Completed Migrations

1. **Users Collection** - User profiles synced with Firebase Auth
2. **Products Collection** - Product listings with real-time updates
3. **Applications Collection** - Seller KYC applications
4. **Inventory Collection** - Seller inventory management (Seller Tools)
5. **Reviews Collection** - Product and seller reviews
6. **Shared Cart Comments** - Comments on shared shopping carts

### 🔄 Pending Migrations

1. **Conversations Collection** - Chat message persistence (currently in-memory)
2. **Cart Items** - User shopping carts (currently session-based)

## Architecture Changes

### Before (localStorage)
```typescript
// Data stored in browser localStorage
const [reviews, setReviews] = useState(() => {
  const saved = localStorage.getItem('reviews');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('reviews', JSON.stringify(reviews));
}, [reviews]);
```

### After (Firestore)
```typescript
// Data synced with Firestore in real-time
const { reviews, loading } = useReviews(productId);

// Updates automatically propagate to all connected clients
await FirestoreService.createReview(newReview);
```

## New Files Created

### 1. `hooks/useFirestore.ts`
Custom React hooks for Firestore data access:
- `useProducts()` - Subscribe to all products
- `useUser(userId)` - Subscribe to user profile
- `useReviews(targetId)` - Subscribe to reviews
- `useApplications()` - Subscribe to seller applications
- `useInventory(sellerId)` - Subscribe to seller inventory
- `useSharedCartComments(cartId)` - Subscribe to cart comments
- `useProduct(productId)` - Fetch single product

### 2. Enhanced `services/firestoreService.ts`
Added methods for:
- User CRUD operations
- Inventory management
- Shared cart comments
- Real-time subscriptions for all collections

### 3. Updated `services/sellerToolsService.ts`
- Now uses Firestore as primary storage
- Maintains localStorage fallback for backward compatibility
- All methods are now async

## Collection Schemas

### Users Collection (`users/{userId}`)
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  emailVerified: boolean;
  sellerStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  phone?: string;
  location?: string;
}
```

### Products Collection (`products/{productId}`)
```typescript
{
  id: string;
  name: string;
  price: number;
  condition: 'Like New' | 'Used';
  images: string[];
  sellerId: string;
  category: string;
  description: string;
  status: 'pending_approval' | 'live' | 'rejected' | 'sold' | 'flagged';
  isTrending?: boolean;
  isNewArrival?: boolean;
  submittedAt?: string;
}
```

### Applications Collection (`applications/{applicationId}`)
```typescript
{
  id: string;
  userId: string;
  shopName: string;
  description: string;
  phone: string;
  email: string;
  idDocument: string;
  sourcingProof: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
}
```

### Inventory Collection (`inventory/{itemId}`)
```typescript
{
  id: string;
  sellerId: string;  // Added for querying
  name: string;
  purchasePrice: number;
  expectedPrice: number;
  soldPrice?: number;
  expenses: ToolExpense[];
  location: string;
  dateAcquired: string;
  dateSold?: string;
  image?: string;
  status: 'available' | 'sold';
  category: string;
}
```

### Reviews Collection (`reviews/{reviewId}`)
```typescript
{
  id: string;
  userId: string;
  userName: string;
  targetId: string;  // Product ID or Seller ID
  targetType: 'product' | 'seller';
  rating: number;
  comment: string;
  date: string;
}
```

### Shared Cart Comments Collection (`sharedCartComments/{commentId}`)
```typescript
{
  id: string;
  cartId: string;  // Added for querying
  userName: string;
  text: string;
  timestamp: string;
}
```

## Key Changes in App.tsx

### State Management
```typescript
// OLD: localStorage-based state
const [applications, setApplications] = useState(() => {
  const saved = localStorage.getItem('apps');
  return saved ? JSON.parse(saved) : [];
});

// NEW: Firestore hooks with real-time updates
const { applications } = useApplications();
```

### Data Operations
```typescript
// OLD: Local state updates
setApplications(prev => [...prev, newApp]);

// NEW: Firestore operations
await FirestoreService.createApplication(newApp);
// State updates automatically via subscription
```

## Real-time Features

All Firestore hooks use `onSnapshot` for real-time updates:

```typescript
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });
    
    return () => unsubscribe();
  }, []);
  
  return { products, loading, error };
}
```

**Benefits:**
- Changes propagate instantly to all connected clients
- No manual refresh needed
- Optimistic UI updates possible
- Offline support (with Firestore offline persistence)

## Backward Compatibility

The migration maintains backward compatibility:

1. **SellerToolsService** - Dual writes to both Firestore and localStorage
2. **Products** - Falls back to PRODUCTS constant if Firestore is empty
3. **Applications** - Falls back to empty array if Firestore is empty

## Migration Steps for Developers

### 1. Using Firestore Hooks
```typescript
import { useProducts, useReviews } from './hooks/useFirestore';

function MyComponent() {
  const { products, loading, error } = useProducts();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{products.map(p => ...)}</div>;
}
```

### 2. Writing Data
```typescript
import { FirestoreService } from './services/firestoreService';

// Create
await FirestoreService.createProduct(newProduct);

// Update
await FirestoreService.updateProduct(productId, { price: 5000 });

// Delete
await FirestoreService.deleteInventoryItem(itemId);
```

### 3. Real-time Subscriptions
```typescript
useEffect(() => {
  const unsubscribe = FirestoreService.subscribeToReviews(
    productId,
    (reviews) => {
      console.log('Reviews updated:', reviews);
    }
  );
  
  return () => unsubscribe();
}, [productId]);
```

## Security Considerations

### Firestore Security Rules (To Be Implemented)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Products are publicly readable
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null && 
                      request.auth.token.role == 'seller';
      allow update, delete: if request.auth != null && 
                              resource.data.sellerId == request.auth.uid;
    }
    
    // Applications
    match /applications/{appId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              resource.data.userId == request.auth.uid;
    }
    
    // Inventory
    match /inventory/{itemId} {
      allow read, write: if request.auth != null && 
                           resource.data.sellerId == request.auth.uid;
    }
  }
}
```

## Performance Optimizations

1. **Indexed Queries** - Add composite indexes for common queries:
   - `products`: `(category, status)`
   - `reviews`: `(targetId, date)`
   - `inventory`: `(sellerId, status)`

2. **Pagination** - Implement cursor-based pagination for large collections

3. **Caching** - Firestore SDK automatically caches data for offline access

## Testing Checklist

- [ ] User registration creates Firestore document
- [ ] User login syncs with Firestore profile
- [ ] Products load from Firestore
- [ ] Real-time product updates work
- [ ] Seller applications persist to Firestore
- [ ] Admin can approve/reject applications
- [ ] Reviews save to Firestore
- [ ] Inventory items sync across devices
- [ ] Shared cart comments appear in real-time
- [ ] Offline mode works (with cached data)

## Next Steps

1. **Implement Firestore Security Rules** - Protect data access
2. **Add Conversations Collection** - Persist chat messages
3. **Migrate Cart Items** - Save user carts to Firestore
4. **Add Pagination** - For products and reviews
5. **Implement Search** - Use Algolia or Firestore queries
6. **Add Analytics** - Track user behavior with Firebase Analytics
7. **Optimize Queries** - Add composite indexes
8. **Error Handling** - Improve error messages and retry logic

## Troubleshooting

### Issue: Data not loading
- Check Firebase console for Firestore data
- Verify Firebase config in `.env`
- Check browser console for errors
- Ensure Firestore is initialized

### Issue: Permission denied
- Implement Firestore security rules
- Check user authentication status
- Verify user has correct role/permissions

### Issue: Slow queries
- Add composite indexes
- Implement pagination
- Use query limits
- Cache frequently accessed data

## Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
