import { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { Product, Review, SellerApplication, User, InventoryItem, SharedCartComment, Shop } from '../types';

/**
 * Custom hook to fetch and subscribe to products
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = FirestoreService.subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}

/**
 * Custom hook to fetch and subscribe to a specific user
 */
export function useUser(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = FirestoreService.subscribeToUser(userId, (updatedUser) => {
      setUser(updatedUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userId]);

  return { user, loading, error };
}

/**
 * Custom hook to fetch and subscribe to reviews for a target
 */
export function useReviews(targetId: string | null) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!targetId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = FirestoreService.subscribeToReviews(targetId, (updatedReviews) => {
      setReviews(updatedReviews);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [targetId]);

  return { reviews, loading, error };
}

/**
 * Custom hook to fetch and subscribe to seller applications
 */
export function useApplications() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = FirestoreService.subscribeToApplications((updatedApplications) => {
      setApplications(updatedApplications);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { applications, loading, error };
}

/**
 * Custom hook to fetch and subscribe to a shop by owner
 */
export function useShopByOwner(ownerId: string | null) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ownerId) {
      setShop(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = FirestoreService.subscribeToShopByOwner(ownerId, (updatedShop) => {
      setShop(updatedShop);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ownerId]);

  return { shop, loading, error };
}

/**
 * Custom hook to fetch and subscribe to all shops
 */
export function useShops(enabled = true) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setShops([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = FirestoreService.subscribeToShops((updatedShops) => {
      setShops(updatedShops);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [enabled]);

  return { shops, loading, error };
}

/**
 * Custom hook to fetch and subscribe to seller inventory
 */
export function useInventory(sellerId: string | null) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sellerId) {
      setInventory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = FirestoreService.subscribeToInventory(sellerId, (updatedInventory) => {
      setInventory(updatedInventory);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [sellerId]);

  return { inventory, loading, error };
}

/**
 * Custom hook to fetch and subscribe to shared cart comments
 */
export function useSharedCartComments(cartId: string | null) {
  const [comments, setComments] = useState<SharedCartComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!cartId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = FirestoreService.subscribeToSharedCartComments(cartId, (updatedComments) => {
      setComments(updatedComments);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [cartId]);

  return { comments, loading, error };
}

/**
 * Custom hook to fetch a single product by ID
 */
export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    FirestoreService.getProductById(productId)
      .then((fetchedProduct) => {
        setProduct(fetchedProduct);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [productId]);

  return { product, loading, error };
}
