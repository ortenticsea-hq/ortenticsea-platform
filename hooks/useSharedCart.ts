import { useState, useEffect } from 'react';
import { SharedCartService } from '../services/sharedCartService';
import { SharedCart, SharedCartError } from '../types';

/**
 * Custom hook to fetch and manage a shared cart
 * 
 * Handles loading, error states, and access validation.
 * Optimized for public viewer experience.
 * 
 * @param shareId - Shared cart ID from URL
 * @returns Shared cart data, loading state, and error
 */
export function useSharedCart(shareId: string | null) {
  const [cart, setCart] = useState<SharedCart | null>(null);
  const [error, setError] = useState<SharedCartError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareId) {
      setCart(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Validate share ID format
    if (!SharedCartService.isValidShareId(shareId)) {
      setCart(null);
      setError({
        type: 'not-found',
        message: 'Invalid share link',
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch shared cart
    SharedCartService.getSharedCart(shareId)
      .then(({ cart: fetchedCart, error: fetchError }) => {
        setCart(fetchedCart);
        setError(fetchError);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading shared cart:', err);
        setCart(null);
        setError({
          type: 'not-found',
          message: 'Failed to load shared cart',
        });
        setLoading(false);
      });
  }, [shareId]);

  return { cart, error, loading };
}
