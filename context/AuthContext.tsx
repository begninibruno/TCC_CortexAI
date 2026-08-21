'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/src/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import type { User, AuthContextType } from '@/types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Escutar mudanças de autenticação no Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          const appUser: User = {
            id: firebaseUser.uid,
            nome: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
          };

          setUser(appUser);
          setToken(idToken);
          localStorage.setItem('@CortexAI:token', idToken);
          localStorage.setItem('@CortexAI:user', JSON.stringify(appUser));
          localStorage.setItem('@CortexAI:uid', firebaseUser.uid);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('@CortexAI:token');
          localStorage.removeItem('@CortexAI:user');
          localStorage.removeItem('@CortexAI:uid');
        }
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem('@CortexAI:token');
        localStorage.removeItem('@CortexAI:user');
        localStorage.removeItem('@CortexAI:uid');
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('@CortexAI:token', newToken);
    localStorage.setItem('@CortexAI:user', JSON.stringify(newUser));
    localStorage.setItem('@CortexAI:uid', newUser.id);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('@CortexAI:token');
    localStorage.removeItem('@CortexAI:user');
    localStorage.removeItem('@CortexAI:uid');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('@CortexAI:user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
