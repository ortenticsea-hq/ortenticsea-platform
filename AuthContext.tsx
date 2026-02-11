import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User } from './types';
import { FirebaseAuthService } from './services/firebaseAuthService';
import { FirestoreService } from './services/firestoreService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<User | null>;
  signInWithEmail: typeof FirebaseAuthService.signInWithEmail;
  signInWithGoogle: typeof FirebaseAuthService.signInWithGoogle;
  registerWithEmail: typeof FirebaseAuthService.registerWithEmail;
  signOut: typeof FirebaseAuthService.signOut;
  sendVerificationEmail: typeof FirebaseAuthService.sendVerificationEmail;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userSubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes from our service
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Keep user document fresh for role/seller status changes
    if (!user?.id) {
      if (userSubRef.current) userSubRef.current();
      userSubRef.current = null;
      return;
    }

    if (userSubRef.current) userSubRef.current();

    const unsubscribe = FirestoreService.subscribeToUser(user.id, (freshUser) => {
      if (freshUser) {
        // Preserve emailVerified from auth
        setUser((prev) => (prev ? { ...freshUser, emailVerified: prev.emailVerified } : freshUser));
      }
    });

    userSubRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const refreshUser = useCallback(async () => {
    const nextUser = await FirebaseAuthService.getCurrentUser();
    setUser(nextUser);
    return nextUser;
  }, []);

  const value = {
    user,
    loading,
    setUser,
    refreshUser,
    signInWithEmail: FirebaseAuthService.signInWithEmail,
    signInWithGoogle: FirebaseAuthService.signInWithGoogle,
    registerWithEmail: FirebaseAuthService.registerWithEmail,
    signOut: FirebaseAuthService.signOut,
    sendVerificationEmail: FirebaseAuthService.sendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
