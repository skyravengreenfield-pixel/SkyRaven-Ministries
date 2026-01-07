/**
 * Centralized Error Handling
 * Enterprise-grade error handling with classification and recovery strategies
 */

import { logger } from './logger';
import { ApiError } from '../types/api.types';

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Business logic errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  isOperational: boolean;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', details?: Record<string, unknown>) {
    super(message, ErrorCode.NETWORK_ERROR, 0, true, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: Record<string, unknown>) {
    super(message, ErrorCode.UNAUTHORIZED, 401, true, details);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: Record<string, unknown>) {
    super(message, ErrorCode.RESOURCE_NOT_FOUND, 404, true, details);
    this.name = 'NotFoundError';
  }
}

class ErrorHandler {
  handle(error: Error | AppError | unknown): AppError {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = this.convertToAppError(error);
    } else {
      appError = new AppError(
        'An unknown error occurred',
        ErrorCode.UNKNOWN_ERROR,
        500,
        false
      );
    }

    // Log the error
    logger.error(appError.message, appError);

    // Send to monitoring service if it's a programming error
    if (!appError.isOperational) {
      this.sendToMonitoringService(appError);
    }

    return appError;
  }

  private convertToAppError(error: Error): AppError {
    // Check for specific error types
    if (error.message.includes('fetch')) {
      return new NetworkError(error.message);
    }

    if (error.message.includes('timeout')) {
      return new AppError(
        error.message,
        ErrorCode.TIMEOUT_ERROR,
        408,
        true
      );
    }

    // Default conversion
    return new AppError(
      error.message,
      ErrorCode.UNKNOWN_ERROR,
      500,
      false
    );
  }

  private sendToMonitoringService(error: AppError): void {
    // Integration point for error monitoring (Sentry, etc.)
    try {
      // Example: Sentry.captureException(error);
      console.error('Sending to monitoring service:', error);
    } catch (monitoringError) {
      logger.error('Failed to send error to monitoring service', monitoringError);
    }
  }

  getUserFriendlyMessage(error: AppError): string {
    const friendlyMessages: Record<ErrorCode, string> = {
      [ErrorCode.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
      [ErrorCode.TIMEOUT_ERROR]: 'The request took too long. Please try again.',
      [ErrorCode.UNAUTHORIZED]: 'You need to log in to access this feature.',
      [ErrorCode.FORBIDDEN]: 'You don\'t have permission to perform this action.',
      [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
      [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorCode.INVALID_INPUT]: 'The information provided is invalid.',
      [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested item could not be found.',
      [ErrorCode.DUPLICATE_RESOURCE]: 'This item already exists.',
      [ErrorCode.INSUFFICIENT_FUNDS]: 'Insufficient funds for this transaction.',
      [ErrorCode.INTERNAL_SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
      [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later.',
      [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    };

    return friendlyMessages[error.code] || error.message;
  }
}

export const errorHandler = new ErrorHandler();

// Utility function for async error handling
export const handleAsync = <T>(
  promise: Promise<T>
): Promise<[T | null, AppError | null]> => {
  return promise
    .then((data) => [data, null] as [T, null])
    .catch((error) => [null, errorHandler.handle(error)] as [null, AppError]);
};
