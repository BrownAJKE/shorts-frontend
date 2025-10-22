'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, User, LoginCredentials, RegisterData, ApiError } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
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
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  // Check if user has a token
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

  // Query for current user data
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getCurrentUser,
    enabled: hasToken, // Only run if user has a token
    retry: false, // Don't retry auth queries
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store token in both localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token);
        // Also store in cookies for middleware access
        document.cookie = `auth_token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      }
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      // Registration successful, user can now login
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  const login = async (credentials: LoginCredentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await registerMutation.mutateAsync(userData);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Also clear token from cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    // Clear all cached data
    queryClient.clear();
    // Invalidate auth queries
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
  };

  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending;
  const isAuthenticated = !!user && !userError;
  const error = userError?.message || loginMutation.error?.message || registerMutation.error?.message || null;

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
