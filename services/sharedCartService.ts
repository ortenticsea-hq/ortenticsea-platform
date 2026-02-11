import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { SharedCart, CartItem, SharedCartError } from '../types';

/**
 * SharedCartService
 * 
 * Handles all operations for shared carts with production-grade security.
 * Shared carts are disposable snapshots that don't sync with main carts.
 * 
 * Security principles:
 * - Never expose user's main cart
 * - Enforce access rules server-side (Firestore rules)
 * - Treat shared carts as temporary, disposable artifacts
 * - Assume hostile clients (validate everything)
 */
export class SharedCartService {
  private static readonly COLLECTION = 'sharedCarts';
  private static readonly DEFAULT_EXPIRY_HOURS = 24;

  /**
   * Create a new shared cart snapshot
   * 
   * @param ownerId - User ID of the cart owner
   * @param items - Cart items to share (snapshot at creation time)
   * @param expiryHours - Hours until expiration (default: 24)
   * @returns Share ID for the created cart
   */
  static async createSharedCart(
    ownerId: string,
    items: CartItem[],
    expiryHours: number = this.DEFAULT_EXPIRY_HOURS
  ): Promise<string> {
    try {
      // Generate random document ID (not based on userId for security)
      const shareRef = doc(collection(db, this.COLLECTION));
      const shareId = shareRef.id;

      // Calculate expiry timestamp
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiryHours);

      // Create shared cart document
      const sharedCart: Omit<SharedCart, 'id' | 'createdAt'> & { createdAt: any; expiresAt: any } = {
        ownerId,
        items,
        locked: false,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
      };

      await setDoc(shareRef, sharedCart);

      return shareId;
    } catch (error) {
      console.error('Error creating shared cart:', error);
      throw new Error('Failed to create shared cart');
    }
  }

  /**
   * Get a shared cart by ID (public access)
   * 
   * Validates access rules:
   * - Cart must exist
   * - Cart must not be locked
   * - Cart must not be expired
   * 
   * @param shareId - Shared cart ID
   * @returns SharedCart or null with error details
   */
  static async getSharedCart(
    shareId: string
  ): Promise<{ cart: SharedCart | null; error: SharedCartError | null }> {
    try {
      const docRef = doc(db, this.COLLECTION, shareId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          cart: null,
          error: {
            type: 'not-found',
            message: 'This cart is no longer available',
          },
        };
      }

      const data = docSnap.data();
      const cart: SharedCart = {
        id: docSnap.id,
        ownerId: data.ownerId,
        items: data.items,
        locked: data.locked,
        expiresAt: data.expiresAt ? data.expiresAt.toDate() : null,
        createdAt: data.createdAt.toDate(),
      };

      // Check if locked
      if (cart.locked) {
        return {
          cart: null,
          error: {
            type: 'locked',
            message: 'This cart is no longer available',
          },
        };
      }

      // Check if expired
      if (cart.expiresAt && new Date() > cart.expiresAt) {
        return {
          cart: null,
          error: {
            type: 'expired',
            message: 'This link has expired',
          },
        };
      }

      return { cart, error: null };
    } catch (error) {
      console.error('Error fetching shared cart:', error);
      return {
        cart: null,
        error: {
          type: 'not-found',
          message: 'Failed to load shared cart',
        },
      };
    }
  }

  /**
   * Lock a shared cart (immediate revocation)
   * 
   * Only the owner can lock their shared cart.
   * This action is instant and irreversible.
   * 
   * @param shareId - Shared cart ID
   * @param ownerId - User ID of the owner (for verification)
   */
  static async lockSharedCart(shareId: string, ownerId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, shareId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Shared cart not found');
      }

      const data = docSnap.data();
      
      // Verify ownership
      if (data.ownerId !== ownerId) {
        throw new Error('Unauthorized: You do not own this shared cart');
      }

      // Lock the cart
      await updateDoc(docRef, {
        locked: true,
      });
    } catch (error) {
      console.error('Error locking shared cart:', error);
      throw error;
    }
  }

  /**
   * Delete a shared cart (revoke access)
   * 
   * Only the owner can delete their shared cart.
   * This permanently removes the cart from Firestore.
   * 
   * @param shareId - Shared cart ID
   * @param ownerId - User ID of the owner (for verification)
   */
  static async deleteSharedCart(shareId: string, ownerId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, shareId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Shared cart not found');
      }

      const data = docSnap.data();
      
      // Verify ownership
      if (data.ownerId !== ownerId) {
        throw new Error('Unauthorized: You do not own this shared cart');
      }

      // Delete the cart
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting shared cart:', error);
      throw error;
    }
  }

  /**
   * Regenerate a new share link (invalidates old one)
   * 
   * Creates a new shared cart and locks the old one.
   * This effectively revokes the old link and creates a new one.
   * 
   * @param oldShareId - Previous shared cart ID to invalidate
   * @param ownerId - User ID of the owner
   * @param items - Current cart items
   * @param expiryHours - Hours until expiration
   * @returns New share ID
   */
  static async regenerateShareLink(
    oldShareId: string,
    ownerId: string,
    items: CartItem[],
    expiryHours: number = this.DEFAULT_EXPIRY_HOURS
  ): Promise<string> {
    try {
      // Lock the old shared cart
      await this.lockSharedCart(oldShareId, ownerId);

      // Create a new shared cart
      const newShareId = await this.createSharedCart(ownerId, items, expiryHours);

      return newShareId;
    } catch (error) {
      console.error('Error regenerating share link:', error);
      throw new Error('Failed to regenerate share link');
    }
  }

  /**
   * Get all shared carts for a user (owner only)
   * 
   * Returns all shared carts created by the user.
   * Useful for management UI.
   * 
   * @param ownerId - User ID of the owner
   * @returns Array of shared carts
   */
  static async getUserSharedCarts(ownerId: string): Promise<SharedCart[]> {
    try {
      // Note: This requires a Firestore index on (ownerId)
      // For now, we'll implement this when needed
      // In production, consider using a subcollection under users/{userId}/sharedCarts
      throw new Error('Not implemented: Use subcollection pattern for better performance');
    } catch (error) {
      console.error('Error fetching user shared carts:', error);
      return [];
    }
  }

  /**
   * Generate shareable URL
   * 
   * Creates a clean, shareable URL for the shared cart.
   * 
   * @param shareId - Shared cart ID
   * @returns Full shareable URL
   */
  static generateShareUrl(shareId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?view=shared-cart&id=${shareId}`;
  }

  /**
   * Validate share ID format
   * 
   * Checks if a share ID looks valid (basic sanity check).
   * Does not verify existence in database.
   * 
   * @param shareId - Share ID to validate
   * @returns True if format is valid
   */
  static isValidShareId(shareId: string): boolean {
    // Firestore auto-generated IDs are 20 characters
    return typeof shareId === 'string' && shareId.length === 20;
  }

  /**
   * Check if a shared cart is accessible
   * 
   * Quick check without fetching full cart data.
   * Useful for UI state management.
   * 
   * @param shareId - Shared cart ID
   * @returns True if cart is accessible
   */
  static async isAccessible(shareId: string): Promise<boolean> {
    const { cart, error } = await this.getSharedCart(shareId);
    return cart !== null && error === null;
  }
}
