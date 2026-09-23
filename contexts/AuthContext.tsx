// Powered by OnSpace.AI
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  AuthUser,
  getStoredAuth,
  signOut as authSignOut,
  updateStoredRewardPoints,
} from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  updateRewardPoints: (points: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const stored = await getStoredAuth();
      setUser(stored);
      setIsLoading(false);
    };
    init();
  }, []);

  const logout = async () => {
    await authSignOut();
    setUser(null);
  };

  const updateRewardPoints = async (points: number) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      rewardPoints: points,
    };

    await updateStoredRewardPoints(points);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        logout,
        updateRewardPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
