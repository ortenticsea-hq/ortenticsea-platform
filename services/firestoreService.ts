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
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firestoreDb';
import { Product, ProductStatus, Order, Seller, Category, Review, SellerApplication, User, InventoryItem, SharedCartComment, Shop, ShopDocument } from '../types';

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
        where('status', '==', 'approved')
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

  static subscribeToSellers(callback: (sellers: Seller[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'sellers'),
      (querySnapshot) => {
        const sellers = querySnapshot.docs.map((doc) => doc.data() as Seller);
        callback(sellers);
      },
      (error) => {
        console.error('Error subscribing to sellers:', error);
        callback([]);
      }
    );
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

  // ===== USERS =====
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      return docSnap.exists() ? (docSnap.data() as User) : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async createUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static subscribeToUser(userId: string, callback: (user: User | null) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'users', userId),
      (docSnap) => {
        callback(docSnap.exists() ? (docSnap.data() as User) : null);
      },
      (error) => {
        console.error('Error subscribing to user:', error);
        callback(null);
      }
    );
  }

  // ===== INVENTORY (Seller Tools) =====
  static async getInventoryItems(sellerId: string): Promise<InventoryItem[]> {
    try {
      const q = query(collection(db, 'inventory'), where('sellerId', '==', sellerId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as InventoryItem);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
  }

  static async saveInventoryItem(sellerId: string, item: InventoryItem): Promise<void> {
    try {
      await setDoc(doc(db, 'inventory', item.id), { ...item, sellerId });
    } catch (error) {
      console.error('Error saving inventory item:', error);
      throw error;
    }
  }

  static async deleteInventoryItem(itemId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'inventory', itemId));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  static subscribeToInventory(sellerId: string, callback: (items: InventoryItem[]) => void): Unsubscribe {
    const q = query(collection(db, 'inventory'), where('sellerId', '==', sellerId));
    return onSnapshot(
      q,
      (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => doc.data() as InventoryItem);
        callback(items);
      },
      (error) => {
        console.error('Error subscribing to inventory:', error);
        callback([]);
      }
    );
  }

  // ===== SHARED CART COMMENTS =====
  static async getSharedCartComments(cartId: string): Promise<SharedCartComment[]> {
    try {
      const q = query(collection(db, 'sharedCartComments'), where('cartId', '==', cartId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as SharedCartComment);
    } catch (error) {
      console.error('Error fetching shared cart comments:', error);
      return [];
    }
  }

  static async addSharedCartComment(cartId: string, comment: SharedCartComment): Promise<void> {
    try {
      await addDoc(collection(db, 'sharedCartComments'), { ...comment, cartId });
    } catch (error) {
      console.error('Error adding shared cart comment:', error);
      throw error;
    }
  }

  static subscribeToSharedCartComments(cartId: string, callback: (comments: SharedCartComment[]) => void): Unsubscribe {
    const q = query(collection(db, 'sharedCartComments'), where('cartId', '==', cartId));
    return onSnapshot(
      q,
      (querySnapshot) => {
        const comments = querySnapshot.docs.map((doc) => doc.data() as SharedCartComment);
        callback(comments);
      },
      (error) => {
        console.error('Error subscribing to shared cart comments:', error);
        callback([]);
      }
    );
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====
  static subscribeToProducts(
    callback: (products: Product[]) => void,
    status?: ProductStatus
  ): Unsubscribe {
    const base = collection(db, 'products');
    const productQuery: Query<DocumentData> = status
      ? query(base, where('status', '==', status))
      : base;

    return onSnapshot(
      productQuery,
      (querySnapshot) => {
        const products = querySnapshot.docs.map((doc) => doc.data() as Product);
        callback(products);
      },
      (error) => {
        console.error('Error subscribing to products:', error);
        callback([]);
      }
    );
  }

  // ===== ORDERS =====
  static async createOrder(order: Order): Promise<void> {
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), updates);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  static subscribeToOrdersByBuyer(
    buyerId: string,
    callback: (orders: Order[]) => void
  ): Unsubscribe {
    const q = query(collection(db, 'orders'), where('buyerId', '==', buyerId));
    return onSnapshot(
      q,
      (querySnapshot) => {
        const orders = querySnapshot.docs.map((doc) => doc.data() as Order);
        callback(orders);
      },
      (error) => {
        console.error('Error subscribing to buyer orders:', error);
        callback([]);
      }
    );
  }

  static subscribeToOrders(callback: (orders: Order[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'orders'),
      (querySnapshot) => {
        const orders = querySnapshot.docs.map((doc) => doc.data() as Order);
        callback(orders);
      },
      (error) => {
        console.error('Error subscribing to orders:', error);
        callback([]);
      }
    );
  }

  static subscribeToProductsBySeller(
    sellerId: string,
    callback: (products: Product[]) => void
  ): Unsubscribe {
    const q = query(collection(db, 'products'), where('sellerId', '==', sellerId));
    return onSnapshot(
      q,
      (querySnapshot) => {
        const products = querySnapshot.docs.map((doc) => doc.data() as Product);
        callback(products);
      },
      (error) => {
        console.error('Error subscribing to seller products:', error);
        callback([]);
      }
    );
  }

  static subscribeToReviews(targetId: string, callback: (reviews: Review[]) => void): Unsubscribe {
    const q = query(collection(db, 'reviews'), where('targetId', '==', targetId));
    return onSnapshot(
      q,
      (querySnapshot) => {
        const reviews = querySnapshot.docs.map((doc) => doc.data() as Review);
        callback(reviews);
      },
      (error) => {
        console.error('Error subscribing to reviews:', error);
        callback([]);
      }
    );
  }

  static subscribeToApplications(callback: (applications: SellerApplication[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'applications'),
      (querySnapshot) => {
        const applications = querySnapshot.docs.map((doc) => doc.data() as SellerApplication);
        callback(applications);
      },
      (error) => {
        console.error('Error subscribing to applications:', error);
        callback([]);
      }
    );
  }

  static subscribeToApplicationsByUserId(
    userId: string,
    callback: (applications: SellerApplication[]) => void
  ): Unsubscribe {
    const q = query(collection(db, 'applications'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (querySnapshot) => {
        const applications = querySnapshot.docs.map((doc) => doc.data() as SellerApplication);
        callback(applications);
      },
      (error) => {
        console.error('Error subscribing to user applications:', error);
        callback([]);
      }
    );
  }

  // ===== SHOPS =====
  static async getShopByOwner(ownerId: string): Promise<Shop | null> {
    try {
      const docSnap = await getDoc(doc(db, 'shops', ownerId));
      return docSnap.exists() ? (docSnap.data() as Shop) : null;
    } catch (error) {
      console.error('Error fetching shop:', error);
      return null;
    }
  }

  static async updateShop(shopId: string, updates: Partial<Shop>): Promise<void> {
    try {
      await updateDoc(doc(db, 'shops', shopId), updates);
    } catch (error) {
      console.error('Error updating shop:', error);
      throw error;
    }
  }

  static subscribeToShopByOwner(ownerId: string, callback: (shop: Shop | null) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'shops', ownerId),
      (docSnap) => {
        callback(docSnap.exists() ? (docSnap.data() as Shop) : null);
      },
      (error) => {
        console.error('Error subscribing to shop:', error);
        callback(null);
      }
    );
  }

  static subscribeToShops(callback: (shops: Shop[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'shops'),
      (querySnapshot) => {
        const shops = querySnapshot.docs.map((doc) => doc.data() as Shop);
        callback(shops);
      },
      (error) => {
        console.error('Error subscribing to shops:', error);
        callback([]);
      }
    );
  }

  // ===== SHOP DOCUMENTS =====
  static async getShopDocuments(shopId: string): Promise<ShopDocument[]> {
    try {
      const q = query(collection(db, 'shopDocuments'), where('shopId', '==', shopId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as ShopDocument);
    } catch (error) {
      console.error('Error fetching shop documents:', error);
      return [];
    }
  }

  static async updateShopDocument(docId: string, updates: Partial<ShopDocument>): Promise<void> {
    try {
      await updateDoc(doc(db, 'shopDocuments', docId), updates);
    } catch (error) {
      console.error('Error updating shop document:', error);
      throw error;
    }
  }
}
