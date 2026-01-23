import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from './types';
import { FirebaseAuthService } from './services/firebaseAuthService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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

  useEffect(() => {
    // Subscribe to auth state changes from our service
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
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