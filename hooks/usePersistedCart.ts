import { useState, useEffect, useCallback } from 'react';
import { collection, doc, setDoc, getDoc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../services/firestoreDb';
import { CartItem, Product } from '../types';

interface FirestoreCart {
  userId: string;
  items: CartItem[];
  totalQuantity: number;
  updatedAt: string;
  createdAt: string;
}

/**
 * Hook for persisting shopping cart to Firestore
 * Provides automatic sync across devices and browser tabs
 */
export const usePersistedCart = (userId: string | null) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);

  // Load cart from Firestore on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cartRef = doc(db, `users/${userId}/cart`, 'default');

      // Subscribe to real-time updates
      const unsub = onSnapshot(
        cartRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as FirestoreCart;
            setCartItems(data.items || []);
          } else {
            setCartItems([]);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error loading cart:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      setUnsubscribe(() => unsub);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading cart';
      console.error('Error setting up cart subscription:', err);
      setError(errorMessage);
      setLoading(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, [userId]);

  // Sync cart to Firestore
  const syncCart = useCallback(
    async (items: CartItem[]) => {
      if (!userId) {
        console.warn('No user ID provided for cart sync');
        return;
      }

      const now = new Date().toISOString();
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

      const cartData: FirestoreCart = {
        userId,
        items,
        totalQuantity,
        updatedAt: now,
        createdAt: now, // This should be preserved from initial creation
      };

      try {
        const cartRef = doc(db, `users/${userId}/cart`, 'default');
        await setDoc(cartRef, cartData, { merge: true });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error saving cart';
        console.error('Error saving cart:', err);
        setError(errorMessage);
        throw err;
      }
    },
    [userId]
  );

  // Add item to cart
  const addToCart = useCallback(
    async (product: Product, quantity: number = 1) => {
      const existingItem = cartItems.find((item) => item.product.id === product.id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = cartItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...cartItems, { product, quantity }];
      }

      setCartItems(newItems);
      await syncCart(newItems);
    },
    [cartItems, syncCart]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (productId: string) => {
      const newItems = cartItems.filter((item) => item.product.id !== productId);
      setCartItems(newItems);
      await syncCart(newItems);
    },
    [cartItems, syncCart]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const newItems = cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      setCartItems(newItems);
      await syncCart(newItems);
    },
    [cartItems, syncCart, removeFromCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!userId) return;

    setCartItems([]);
    try {
      const cartRef = doc(db, `users/${userId}/cart`, 'default');
      await deleteDoc(cartRef);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error clearing cart';
      console.error('Error clearing cart:', err);
      setError(errorMessage);
      throw err;
    }
  }, [userId]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCart,
  };
};
