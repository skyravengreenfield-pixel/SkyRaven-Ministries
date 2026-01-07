/**
 * Enhanced API Client
 * Enterprise-grade HTTP client with interceptors, retries, and caching
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { getEnv } from '../config/validation';
import { logger } from '../utils/logger';
import { AppError, NetworkError, UnauthorizedError } from '../utils/errorHandler';

class ApiClient {
  private client: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: getEnv('VITE_API_BASE_URL'),
      timeout: getEnv('VITE_API_TIMEOUT'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracing
        const requestId = this.generateRequestId();
        if (config.headers) {
          config.headers['X-Request-ID'] = requestId;
        }

        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          requestId,
          params: config.params,
        });

        return config;
      },
      (error: AxiosError) => {
        logger.error('Request interceptor error', { error });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      async (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  private async handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const { status, data } = error.response;

      logger.error(`API Error: ${status}`, {
        url: error.config?.url,
        method: error.config?.method,
        status,
        data,
      });

      // Handle specific error codes
      switch (status) {
        case 401:
          // Attempt token refresh
          if (await this.tryRefreshToken()) {
            return this.client.request(error.config!);
          }
          localStorage.removeItem('authToken');
          window.location.href = '/auth';
          throw new UnauthorizedError('Session expired. Please login again.');

        case 403:
          throw new AppError('You do not have permission to perform this action.', status);

        case 404:
          throw new AppError('The requested resource was not found.', status);

        case 429:
          throw new AppError('Too many requests. Please try again later.', status);

        case 500:
        case 502:
        case 503:
        case 504:
          throw new NetworkError('Server error. Please try again later.');

        default:
          throw new AppError(
            (data as any)?.message || 'An unexpected error occurred.',
            status
          );
      }
    } else if (error.request) {
      logger.error('Network error - no response', { error });
      throw new NetworkError('Network error. Please check your connection.');
    } else {
      logger.error('Request setup error', { error });
      throw new AppError('Failed to make request.');
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await axios.post(
        `${getEnv('VITE_API_BASE_URL')}/auth/refresh`,
        { refreshToken }
      );

      const { token } = response.data;
      localStorage.setItem('authToken', token);
      return true;
    } catch {
      return false;
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Deduplicate concurrent identical requests
   */
  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const key = `GET:${url}:${JSON.stringify(config?.params)}`;
    return this.deduplicateRequest(key, async () => {
      const response = await this.client.get<T>(url, config);
      return response.data;
    });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    return this.post<T>(url, formData, config);
  }

  /**
   * Set auth token
   */
  setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }
}

export const apiClient = new ApiClient();
