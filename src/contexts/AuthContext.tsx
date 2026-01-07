/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (passcode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = await authService.verifyToken(token);
          setUser(userData);
        }
      } catch (error) {
        logger.error('Failed to initialize auth', { error });
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: userData, token } = await authService.login(email, password);
      localStorage.setItem('authToken', token);
      setUser(userData);
      logger.info('User logged in successfully', { userId: userData.id });
    } catch (error) {
      logger.error('Login failed', { error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adminLogin = useCallback(async (passcode: string) => {
    try {
      setIsLoading(true);
      const { user: userData, token } = await authService.adminLogin(passcode);
      localStorage.setItem('authToken', token);
      setUser(userData);
      logger.info('Admin logged in successfully');
    } catch (error) {
      logger.error('Admin login failed', { error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      localStorage.removeItem('authToken');
      setUser(null);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      const userData = await authService.verifyToken(token);
      setUser(userData);
    } catch (error) {
      logger.error('Failed to refresh auth', { error });
      localStorage.removeItem('authToken');
      setUser(null);
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    adminLogin,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
