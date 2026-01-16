import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '../types';

// Set persistence for auth
setPersistence(auth, browserLocalPersistence);

export class FirebaseAuthService {
  /**
   * Register a new user with email and password
   */
  static async registerWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userDoc: User = {
        id: firebaseUser.uid,
        name: displayName,
        email: email,
        role: 'buyer',
        sellerStatus: 'none',
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);
      return userDoc;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to register user');
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = await this.fetchUserFromFirestore(userCredential.user.uid);
      if (!user) {
        throw new Error('User profile not found');
      }
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Sign in with Google
   */
  static async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      let user = await this.fetchUserFromFirestore(firebaseUser.uid);

      // If new user, create profile
      if (!user) {
        user = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email || '',
          role: 'buyer',
          sellerStatus: 'none',
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), user);
      }

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const user = await this.fetchUserFromFirestore(firebaseUser.uid);
          resolve(user || null);
        } else {
          resolve(null);
        }
        unsubscribe();
      });
    });
  }

  /**
   * Fetch user from Firestore
   */
  static async fetchUserFromFirestore(userId: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      return docSnap.exists() ? (docSnap.data() as User) : null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.fetchUserFromFirestore(firebaseUser.uid);
        callback(user || null);
      } else {
        callback(null);
      }
    });
  }
}
