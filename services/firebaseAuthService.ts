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
  sendEmailVerification,
  sendPasswordResetEmail,
  getIdTokenResult,
  reload,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { auth } from './firebaseAuth';
import { db } from './firestoreDb';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '../types';

// Some mobile browsers or privacy modes reject persistent storage. That
// should not prevent the app from booting.
void setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Auth persistence unavailable, continuing without local persistence.', error);
});

export class FirebaseAuthService {
  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private static isInvalidCredentialError(code?: string): boolean {
    return (
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-login-credentials' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found'
    );
  }

  private static async tryEmailSignIn(
    email: string,
    password: string
  ): Promise<{ user: FirebaseUser; usedTrimmedPassword: boolean }> {
    const trimmedPassword = password.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, usedTrimmedPassword: false };
    } catch (error: any) {
      if (
        !this.isInvalidCredentialError(error?.code) ||
        trimmedPassword === password ||
        trimmedPassword.length === 0
      ) {
        throw error;
      }

      const retryCredential = await signInWithEmailAndPassword(auth, email, trimmedPassword);
      return { user: retryCredential.user, usedTrimmedPassword: true };
    }
  }

  private static async mapSignInError(error: any, email: string): Promise<Error> {
    const code = error?.code as string | undefined;

    if (code === 'auth/unauthorized-domain') {
      return this.mapUnauthorizedDomainError();
    }

    if (code === 'auth/user-disabled') {
      return new Error('This account has been disabled. Contact support.');
    }

    if (this.isInvalidCredentialError(code)) {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes(GoogleAuthProvider.PROVIDER_ID) && !methods.includes('password')) {
          return new Error('This account uses Google Sign-In. Tap "Sign in with Google" to continue.');
        }
      } catch {
        // Ignore lookup failures and fall back to generic guidance.
      }

      return new Error('Invalid email or password. Check your details or use "Forgot password?".');
    }

    return new Error(error?.message || 'Failed to sign in');
  }

  private static async mapRegisterError(error: any, email: string): Promise<Error> {
    const code = error?.code as string | undefined;

    if (code === 'auth/unauthorized-domain') {
      return this.mapUnauthorizedDomainError();
    }

    if (code === 'auth/email-already-in-use') {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes(GoogleAuthProvider.PROVIDER_ID) && !methods.includes('password')) {
          return new Error('This email is already registered with Google. Use "Sign in with Google" instead.');
        }
      } catch {
        // Ignore lookup failures and still provide a useful message.
      }
      return new Error('An account with this email already exists. Sign in instead or use "Forgot password?".');
    }

    if (code === 'auth/invalid-email') {
      return new Error('Please enter a valid email address.');
    }

    if (code === 'auth/weak-password') {
      return new Error('Password is too weak. Use at least 6 characters.');
    }

    if (code === 'auth/operation-not-allowed') {
      return new Error('Email/password sign-up is not enabled. Contact support.');
    }

    return new Error(error?.message || 'Failed to register user');
  }

  private static mapUnauthorizedDomainError(): Error {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return new Error(
      `This domain (${currentHost}) is not authorized for Firebase Auth. Add it in Firebase Console > Authentication > Settings > Authorized domains.`
    );
  }

  private static async mapGoogleSignInError(error: any): Promise<Error> {
    const code = error?.code as string | undefined;

    if (code === 'auth/unauthorized-domain') {
      return this.mapUnauthorizedDomainError();
    }

    if (code === 'auth/popup-blocked') {
      return new Error('Sign-in popup was blocked. Allow popups for this site and try again.');
    }

    if (code === 'auth/popup-closed-by-user') {
      return new Error('Sign-in popup was closed before completion. Try again.');
    }

    if (code === 'auth/account-exists-with-different-credential') {
      const email = error?.customData?.email as string | undefined;
      if (email) {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, this.normalizeEmail(email));
          if (methods.includes('password')) {
            return new Error('An account with this email already exists. Sign in with email and password instead.');
          }
          if (methods.length > 0) {
            return new Error(
              `An account with this email already exists using ${methods[0]}. Sign in with that method first.`
            );
          }
        } catch {
          // Ignore lookup failure and use fallback message.
        }
      }
      return new Error('An account already exists with a different sign-in method. Use the original provider first.');
    }

    return new Error(error?.message || 'Failed to sign in with Google');
  }

  /**
   * Register a new user with email and password
   */
  static async registerWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    const normalizedEmail = this.normalizeEmail(email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const firebaseUser = userCredential.user;

      // Send verification email on signup
      await sendEmailVerification(firebaseUser);

      // Create user document in Firestore
      const userDoc: User = {
        id: firebaseUser.uid,
        name: displayName,
        email: normalizedEmail,
        role: 'buyer',
        emailVerified: firebaseUser.emailVerified,
        sellerStatus: 'none',
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);
      return userDoc;
    } catch (error: any) {
      throw await this.mapRegisterError(error, normalizedEmail);
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string): Promise<User> {
    const normalizedEmail = this.normalizeEmail(email);
    try {
      const { user: firebaseUser, usedTrimmedPassword } = await this.tryEmailSignIn(normalizedEmail, password);
      const user = await this.fetchUserFromFirestore(firebaseUser.uid);
      if (!user) {
        throw new Error('User profile not found');
      }

      // Sync emailVerified status from Auth
      user.emailVerified = firebaseUser.emailVerified;

      // Sync role from custom claims if present
      await this.applyRoleFromClaims(firebaseUser, user);

      if (usedTrimmedPassword) {
        console.warn('Signed in after trimming extra spaces from password input.');
      }

      return user;
    } catch (error: any) {
      throw await this.mapSignInError(error, normalizedEmail);
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
          emailVerified: firebaseUser.emailVerified,
          sellerStatus: 'none',
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), user);
      }

      // Sync role from custom claims if present
      await this.applyRoleFromClaims(firebaseUser, user);

      return user;
    } catch (error: any) {
      throw await this.mapGoogleSignInError(error);
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
          // Force refresh to pick up emailVerified changes
          await reload(firebaseUser);
          const user = await this.fetchUserFromFirestore(firebaseUser.uid);
          if (user) {
            user.emailVerified = firebaseUser.emailVerified;
            await this.applyRoleFromClaims(firebaseUser, user);
          }
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
        if (user) {
          user.emailVerified = firebaseUser.emailVerified;
          await this.applyRoleFromClaims(firebaseUser, user);
        }
        callback(user || null);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Sends a verification email to the currently signed-in user.
   */
  static async sendVerificationEmail(): Promise<void> {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  /**
   * Sends a password reset email.
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, this.normalizeEmail(email));
  }

  /**
   * If a custom claim is present, sync role into the user profile.
   */
  private static async applyRoleFromClaims(firebaseUser: FirebaseUser, user: User): Promise<void> {
    const token = await getIdTokenResult(firebaseUser, true);
    const claimedRole = token.claims.role;
    if (claimedRole === 'admin' && user.role !== 'admin') {
      user.role = 'admin';
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), user, { merge: true });
      } catch (error) {
        // Role remains updated in-memory even if Firestore write is blocked.
        console.warn('Failed to persist admin role to Firestore:', error);
      }
    }
  }
}
