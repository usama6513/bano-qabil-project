'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  country?: string;
  preferredLanguage: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    bio?: string;
    dateOfBirth?: string;
    phone?: string;
    educationLevel?: string;
    occupation?: string;
    timezone?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string; country?: string; preferredLanguage?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await apiClient.get<{ data: { user: User } }>('/api/auth/me');
      setUser(response.data.user);
    } catch {
      const refreshed = await apiClient.refreshTokens();
      if (refreshed) {
        try {
          const response = await apiClient.get<{ data: { user: User } }>('/api/auth/me');
          setUser(response.data.user);
          return;
        } catch {
          // fall through
        }
      }
      setUser(null);
      apiClient.clearTokens();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ data: { user: User; tokens: { accessToken: string; refreshToken: string } } }>('/api/auth/login', { email, password });
    const { user: userData, tokens } = response.data;
    apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(userData);
  };

  const register = async (data: { name: string; email: string; password: string; confirmPassword: string; country?: string; preferredLanguage?: string }) => {
    const response = await apiClient.post<{ data: { user: User; tokens: { accessToken: string; refreshToken: string } } }>('/api/auth/register', data);
    const { user: userData, tokens } = response.data;
    apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await apiClient.post('/api/auth/logout', { refreshToken });
    } catch {
      // Ignore logout errors
    } finally {
      apiClient.clearTokens();
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
