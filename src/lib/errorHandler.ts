/**
 * Error Handling Utilities
 * Provides consistent error handling, typing, and logging across the application
 */

import { logger } from './logger';

/**
 * Custom Application Errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    statusCode: number = 500,
    public endpoint?: string,
    public method?: string
  ) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'ApiError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is a standard Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

/**
 * Extract error code from unknown error
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  if (isError(error)) {
    return error.name;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Handle error with logging and optional user notification
 */
export function handleError(
  error: unknown,
  context?: string,
  options?: {
    log?: boolean;
    rethrow?: boolean;
    fallbackMessage?: string;
  }
): string {
  const { log = true, rethrow = false, fallbackMessage } = options || {};
  
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  
  if (log) {
    const contextMsg = context ? `[${context}] ` : '';
    logger.error(`${contextMsg}${code}: ${message}`, error);
  }
  
  if (rethrow) {
    throw error;
  }
  
  return fallbackMessage || message;
}

/**
 * Safely handle localStorage operations
 */
export function safeLocalStorage(
  operation: () => void,
  errorMessage: string = 'localStorage operation failed'
): boolean {
  try {
    operation();
    return true;
  } catch (error) {
    logger.warn(errorMessage, error);
    return false;
  }
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.warn('JSON parse failed', error);
    return fallback;
  }
}

/**
 * Async error wrapper
 * Wraps async functions to catch and handle errors consistently
 */
export function asyncErrorWrapper<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, onRetry } = options;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts) {
        onRetry?.(attempt, error);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): {
  title: string;
  message: string;
  variant: 'destructive' | 'default';
} {
  if (isAppError(error)) {
    return {
      title: error.name.replace(/([A-Z])/g, ' $1').trim(),
      message: error.message,
      variant: error.statusCode >= 500 ? 'destructive' : 'default',
    };
  }
  
  if (isError(error)) {
    return {
      title: 'Error',
      message: error.message,
      variant: 'destructive',
    };
  }
  
  return {
    title: 'Error',
    message: 'An unexpected error occurred',
    variant: 'destructive',
  };
}

/**
 * Error boundary helper for logging unhandled errors
 */
export function logUnhandledError(error: Error, errorInfo?: { componentStack?: string }): void {
  logger.error('Unhandled error in React component', {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
  });
}

