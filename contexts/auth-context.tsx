'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, ApiError } from '../lib/api';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a token
      const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // For development tokens, use mock user data instead of API call
      if (token.startsWith('dev-token-')) {
        setUser({
          id: 1,
          username: 'admin',
          email: 'admin@hotel.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          department: 'Management'
        });
        setIsLoading(false);
        return;
      }

      // For real tokens, verify with backend
      try {
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch (error) {
        // If profile fetch fails, clear token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('api_token');
        }
        throw error;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('api_token');
      }
      setError(error instanceof ApiError ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(username, password);
      
      if (response.user) {
        setUser(response.user);
      } else {
        // For development tokens, use mock user data
        const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;
        if (token && token.startsWith('dev-token-')) {
          setUser({
            id: 1,
            username: 'admin',
            email: 'admin@hotel.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            department: 'Management'
          });
        } else {
          // For real tokens, fetch profile separately
          const profile = await authApi.getProfile();
          setUser(profile);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof ApiError ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
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