import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Query,
  DocumentData,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Product, Seller, Category, Review, SellerApplication } from '../types';

/**
 * Firestore Service for all database operations
 * Handles CRUD operations for all collections
 */
export class FirestoreService {
  // ===== PRODUCTS =====
  static async getProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map((doc) => doc.data() as Product);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const docSnap = await getDoc(doc(db, 'products', productId));
      return docSnap.exists() ? (docSnap.data() as Product) : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('status', '==', 'live')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as Product);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  static async createProduct(product: Product): Promise<void> {
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), updates);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // ===== SELLERS =====
  static async getSellers(): Promise<Seller[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'sellers'));
      return querySnapshot.docs.map((doc) => doc.data() as Seller);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      return [];
    }
  }

  static async getSellerById(sellerId: string): Promise<Seller | null> {
    try {
      const docSnap = await getDoc(doc(db, 'sellers', sellerId));
      return docSnap.exists() ? (docSnap.data() as Seller) : null;
    } catch (error) {
      console.error('Error fetching seller:', error);
      return null;
    }
  }

  static async createSeller(seller: Seller): Promise<void> {
    try {
      await setDoc(doc(db, 'sellers', seller.id), seller);
    } catch (error) {
      console.error('Error creating seller:', error);
      throw error;
    }
  }

  // ===== REVIEWS =====
  static async getReviews(targetId: string): Promise<Review[]> {
    try {
      const q = query(collection(db, 'reviews'), where('targetId', '==', targetId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as Review);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  static async createReview(review: Review): Promise<void> {
    try {
      await addDoc(collection(db, 'reviews'), review);
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // ===== SELLER APPLICATIONS =====
  static async createApplication(application: SellerApplication): Promise<void> {
    try {
      await setDoc(doc(db, 'applications', application.id), application);
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  static async getApplicationsByUserId(userId: string): Promise<SellerApplication[]> {
    try {
      const q = query(collection(db, 'applications'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as SellerApplication);
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  static async getApplications(): Promise<SellerApplication[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'applications'));
      return querySnapshot.docs.map((doc) => doc.data() as SellerApplication);
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  static async updateApplication(
    applicationId: string,
    updates: Partial<SellerApplication>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'applications', applicationId), updates);
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  // ===== CATEGORIES =====
  static async getCategories(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Note: icons need to be re-created on the client since they're React elements
        return {
          ...data,
          icon: null, // Icons will be matched by category ID in the app
        } as any;
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
}
