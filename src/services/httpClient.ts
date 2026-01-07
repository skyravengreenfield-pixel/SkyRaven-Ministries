/**
 * HTTP Client
 * Centralized HTTP client with interceptors, retry logic, and error handling
 */

import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { errorHandler, NetworkError, UnauthorizedError, AppError } from '../utils/errorHandler';
import { ApiResponse } from '../types/api.types';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = config.get('apiBaseUrl');
    this.defaultTimeout = config.get('apiTimeout');
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
    logger.debug('Auth token updated');
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retry = 3,
      retryDelay = 1000,
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(fetchOptions.headers);

    const requestConfig: RequestInit = {
      ...fetchOptions,
      headers,
    };

    logger.debug(`HTTP ${fetchOptions.method || 'GET'} ${url}`, { headers, body: fetchOptions.body });

    try {
      const response = await this.fetchWithTimeout(url, requestConfig, timeout);
      return await this.handleResponse<T>(response);
    } catch (error) {
      // Retry logic for network errors
      if (retry > 0 && this.shouldRetry(error)) {
        logger.warn(`Request failed, retrying... (${retry} attempts left)`);
        await this.delay(retryDelay);
        return this.request<T>(endpoint, { ...options, retry: retry - 1 });
      }

      throw errorHandler.handle(error);
    }
  }

  private buildHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.authToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    // Add request ID for tracing
    headers.set('X-Request-ID', this.generateRequestId());

    return headers;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: unknown;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      throw new NetworkError('Failed to parse response');
    }

    logger.debug(`HTTP ${response.status} Response`, data);

    if (!response.ok) {
      this.handleErrorResponse(response.status, data);
    }

    return data as ApiResponse<T>;
  }

  private handleErrorResponse(status: number, data: unknown): never {
    const errorData = data as { message?: string; code?: string; details?: Record<string, unknown> };

    switch (status) {
      case 401:
        throw new UnauthorizedError(errorData.message || 'Unauthorized');
      case 403:
        throw new AppError(
          errorData.message || 'Forbidden',
          'FORBIDDEN' as any,
          403
        );
      case 404:
        throw new AppError(
          errorData.message || 'Not found',
          'RESOURCE_NOT_FOUND' as any,
          404
        );
      case 422:
        throw new AppError(
          errorData.message || 'Validation error',
          'VALIDATION_ERROR' as any,
          422,
          true,
          errorData.details
        );
      case 500:
        throw new AppError(
          errorData.message || 'Internal server error',
          'INTERNAL_SERVER_ERROR' as any,
          500
        );
      default:
        throw new NetworkError(errorData.message || 'Request failed');
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof NetworkError) {
      return true;
    }
    if (error instanceof AppError) {
      return error.statusCode >= 500;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public HTTP methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    const uploadConfig = { ...config };
    // Remove Content-Type header to let browser set it with boundary
    const headers = new Headers(uploadConfig.headers);
    headers.delete('Content-Type');
    
    return this.request<T>(endpoint, {
      ...uploadConfig,
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

export const httpClient = new HttpClient();
