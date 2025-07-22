'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const defaultUser: User = {
    id: 1,
    username: 'guest',
    email: 'guest@hotel.com',
    first_name: 'Guest',
    last_name: 'User',
    role: 'guest',
    department: 'N/A'
  };

  const [user, setUser] = useState<User | null>(defaultUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = true;

  const login = async (username: string, password: string) => {
    // Login is no longer necessary, but keeping the function signature
    // to avoid breaking existing calls. It will effectively do nothing.
    setUser(defaultUser);
    setIsLoading(false);
    setError(null);
  };

  const logout = async () => {
    // Logout is no longer necessary, but keeping the function signature
    // to avoid breaking existing calls. It will effectively do nothing.
    setUser(null);
    setIsLoading(false);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}