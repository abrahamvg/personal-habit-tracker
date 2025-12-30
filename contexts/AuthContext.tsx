/**
 * Authentication Context
 * Provides auth state and methods throughout the application
 * Following React Context pattern for state management
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { IStorageProvider } from '@/lib/providers/IDataProvider';
import { ProviderFactory, getProviderConfigFromEnv } from '@/lib/providers/ProviderFactory';
import { setGlobalProvider } from '@/lib/storage';
import { useHabitStore } from '@/lib/store';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  provider: IStorageProvider;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  customProvider?: IStorageProvider;
}

export function AuthProvider({ children, customProvider }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [provider] = useState<IStorageProvider>(() => {
    const providerInstance = customProvider || ProviderFactory.getInstance(getProviderConfigFromEnv());
    
    // Set as global provider so storage.ts can use it
    setGlobalProvider(providerInstance);
    
    return providerInstance;
  });

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const currentUser = await provider.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = provider.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [provider]);

  const signIn = async (email: string, password: string) => {
    try {
      const { user, error } = await provider.signIn(email, password);
      if (error) return { error };
      setUser(user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { user, error } = await provider.signUp(email, password);
      if (error) return { error };
      setUser(user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await provider.signOut();
      setUser(null);
      // Reset store to clear all user data
      useHabitStore.getState().reset();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    provider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to access the storage provider directly
 * Useful for data operations that need the provider
 */
export function useProvider(): IStorageProvider {
  const { provider } = useAuth();
  return provider;
}
