/**
 * Authentication Service
 * Handles user authentication, token management, and session persistence
 */

import { httpClient } from './httpClient';
import { logger } from '../utils/logger';
import { handleAsync } from '../utils/errorHandler';
import type {
  LoginRequest,
  LoginResponse,
  User,
  AuthTokens,
  ApiResponse,
} from '../types/api.types';

class AuthService {
  private readonly TOKEN_KEY = 'skyraven_access_token';
  private readonly REFRESH_TOKEN_KEY = 'skyraven_refresh_token';
  private readonly USER_KEY = 'skyraven_user';
  private currentUser: User | null = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user) {
      httpClient.setAuthToken(token);
      this.currentUser = user;
      logger.info('Auth initialized from storage', { user: user.email });
    }
  }

  async login(credentials: LoginRequest): Promise<[User | null, Error | null]> {
    logger.info('Attempting login', { email: credentials.email });

    const [response, error] = await handleAsync(
      httpClient.post<LoginResponse>('/auth/login', credentials)
    );

    if (error || !response?.data) {
      logger.error('Login failed', error);
      return [null, error];
    }

    const { user, tokens } = response.data;
    this.setAuthData(user, tokens);
    
    logger.info('Login successful', { user: user.email });
    return [user, null];
  }

  async loginWithPasscode(passcode: string): Promise<[User | null, Error | null]> {
    logger.info('Attempting admin login with passcode');

    const [response, error] = await handleAsync(
      httpClient.post<LoginResponse>('/auth/admin-login', { passcode })
    );

    if (error || !response?.data) {
      logger.error('Admin login failed', error);
      return [null, error];
    }

    const { user, tokens } = response.data;
    this.setAuthData(user, tokens);
    
    logger.info('Admin login successful');
    return [user, null];
  }

  async logout(): Promise<void> {
    logger.info('Logging out user');

    // Attempt to notify backend
    try {
      await httpClient.post('/auth/logout');
    } catch (error) {
      logger.warn('Backend logout notification failed', error);
    }

    this.clearAuthData();
    logger.info('Logout complete');
  }

  async refreshToken(): Promise<[AuthTokens | null, Error | null]> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      return [null, new Error('No refresh token available')];
    }

    logger.info('Refreshing access token');

    const [response, error] = await handleAsync(
      httpClient.post<AuthTokens>('/auth/refresh', { refreshToken })
    );

    if (error || !response?.data) {
      logger.error('Token refresh failed', error);
      this.clearAuthData();
      return [null, error];
    }

    const tokens = response.data;
    this.storeTokens(tokens);
    httpClient.setAuthToken(tokens.accessToken);
    
    logger.info('Token refreshed successfully');
    return [tokens, null];
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    const token = this.getStoredToken();
    if (!token) {
      return null;
    }

    logger.info('Fetching current user');

    const [response, error] = await handleAsync(
      httpClient.get<User>('/auth/me')
    );

    if (error || !response?.data) {
      logger.error('Failed to fetch current user', error);
      this.clearAuthData();
      return null;
    }

    this.currentUser = response.data;
    this.storeUser(response.data);
    
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  getUser(): User | null {
    return this.currentUser || this.getStoredUser();
  }

  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission as any) || false;
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  private setAuthData(user: User, tokens: AuthTokens): void {
    this.currentUser = user;
    this.storeUser(user);
    this.storeTokens(tokens);
    httpClient.setAuthToken(tokens.accessToken);
  }

  private clearAuthData(): void {
    this.currentUser = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    httpClient.setAuthToken(null);
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      logger.error('Failed to parse stored user data', error);
      return null;
    }
  }
}

export const authService = new AuthService();
