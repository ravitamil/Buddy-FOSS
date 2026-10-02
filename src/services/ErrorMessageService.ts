/**
 * Error Message Service
 *
 * Translates technical errors into user-friendly messages with recovery guidance.
 */

import {logger as appLogger} from './LoggerService';

const logger = appLogger.contextLogger('ErrorMessageService');

// Error categories
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  DATA_SYNC = 'DATA_SYNC',
  PERMISSION = 'PERMISSION',
  GENERIC = 'GENERIC',
}

// User-friendly error message structure
export interface UserFriendlyError {
  title: string;
  message: string;
  category: ErrorCategory;
  recoveryActions: RecoveryAction[];
  technicalDetails?: string; // For debug mode only
}

// Recovery action structure
export interface RecoveryAction {
  label: string;
  action: 'retry' | 'dismiss' | 'navigate' | 'custom';
  navigationRoute?: string;
  customHandler?: () => void;
}

class ErrorMessageService {
  /**
   * Classify error based on technical error message or error object
   */
  classifyError(error: unknown): ErrorCategory {
    const errorMessage = this.extractErrorMessage(error);
    const errorCode = this.extractErrorCode(error);

    // Network errors
    if (
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorCode === 'NETWORK_ERROR'
    ) {
      return ErrorCategory.NETWORK;
    }

    // Authentication errors
    if (
      errorMessage.includes('auth/') ||
      errorCode.startsWith('auth/') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('invalid-email') ||
      errorMessage.includes('user-not-found')
    ) {
      return ErrorCategory.AUTHENTICATION;
    }

    // Validation errors
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid input') ||
      errorMessage.includes('required field')
    ) {
      return ErrorCategory.VALIDATION;
    }

    // Storage errors
    if (
      errorMessage.includes('SecureStore') ||
      errorMessage.includes('quota exceeded') ||
      errorMessage.includes('storage full')
    ) {
      return ErrorCategory.STORAGE;
    }

    // Data sync errors
    if (
      errorMessage.includes('Firestore') ||
      errorMessage.includes('Supabase') ||
      errorMessage.includes('PostgreSQL') ||
      errorMessage.includes('sync conflict') ||
      errorMessage.includes('conflict')
    ) {
      return ErrorCategory.DATA_SYNC;
    }

    // Permission errors
    if (
      errorMessage.includes('permission') ||
      errorMessage.includes('denied') ||
      errorMessage.includes('Camera') ||
      errorMessage.includes('location')
    ) {
      return ErrorCategory.PERMISSION;
    }

    return ErrorCategory.GENERIC;
  }

  /**
   * Convert technical error to user-friendly error message
   */
  getUserFriendlyError(
    error: unknown,
    context?: {screen?: string; action?: string},
  ): UserFriendlyError {
    const category = this.classifyError(error);
    const errorMessage = this.extractErrorMessage(error);

    // Log the technical error
    logger.error(
      `Error occurred: ${category}`,
      {screen: context?.screen, action: context?.action},
      error,
      {category, originalMessage: errorMessage},
    );

    // Get user-friendly message based on category
    switch (category) {
      case ErrorCategory.NETWORK:
        return this.getNetworkError(error, context);

      case ErrorCategory.AUTHENTICATION:
        return this.getAuthenticationError(error, context);

      case ErrorCategory.VALIDATION:
        return this.getValidationError(error, context);

      case ErrorCategory.STORAGE:
        return this.getStorageError(error, context);

      case ErrorCategory.DATA_SYNC:
        return this.getDataSyncError(error, context);

      case ErrorCategory.PERMISSION:
        return this.getPermissionError(error, context);

      default:
        return this.getGenericError(error, context);
    }
  }

  /**
   * Extract error message from various error formats
   */
  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (this.isRecord(error)) {
      if (typeof error.message === 'string') return error.message;
      if (this.isRecord(error.error) && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }
    return 'Unknown error';
  }

  private extractErrorCode(error: unknown): string {
    if (this.isRecord(error) && typeof error.code === 'string') {
      return error.code;
    }

    return '';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  /**
   * Network error messages
   */
  private getNetworkError(
    error: unknown,
    context?: {screen?: string; action?: string},
  ): UserFriendlyError {
    return {
      title: 'Connection Error',
      message:
        'Unable to connect to the server. Please check your internet connection and try again.',
      category: ErrorCategory.NETWORK,
      recoveryActions: [
        {
          label: 'Retry',
          action: 'retry',
        },
        {
          label: 'Go Offline',
          action: 'custom',
          customHandler: () => {
            // Switch to offline mode
            logger.info('User switched to offline mode');
          },
        },
        {
          label: 'Dismiss',
          action: 'dismiss',
        },
      ],
      technicalDetails: __DEV__ ? this.extractErrorMessage(error) : undefined,
    };
  }

  /**
   * Authentication error messages
   */
  private getAuthenticationError(
    error: unknown,
    context?: {screen?: string; action?: string},
  ): UserFriendlyError {
    const errorCode = this.extractErrorCode(error);

    let message = 'Authentication failed. Please sign in again.';

    if (errorCode === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (errorCode === 'auth/user-not-found') {
      message = 'No account found with this email. Please sign up first.';
    } else if (errorCode === 'auth/wrong-password') {
      message = 'Incorrect password. Please try again.';
    } else if (errorCode === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Please try again later.';
    }

    return {
      title: 'Authentication Error',
      message,
      category: ErrorCategory.AUTHENTICATION,
      recoveryActions: [
        {
          label: 'Try Again',
          action: 'retry',
        },
        {
          label: 'Sign Out',
          action: 'navigate',
          navigationRoute: '/auth/sign-in',
        },
      ],
      technicalDetails: __DEV__ ? `${errorCode}: ${this.extractErrorMessage(error)}` : undefined,
    };
  }

  /**
   * Validation error messages
   */
  private getValidationError(
    error: unknown,
    context?: {screen?: string; action?: string},
  ): UserFriendlyError {
    const errorMessage = this.extractErrorMessage(error);

    return {
      title: 'Invalid Input',
      message: errorMessage || 'Please check your input and try again.',
      category: ErrorCategory.VALIDATION,
      recoveryActions: [
        {
          label: 'OK',
          action: 'dismiss',
        },
      ],
      technicalDetails: __DEV__ ? this.extractErrorMessage(error) : undefined,
    };
  }

  /**
   * Storage error messages
   */
  private getStorageError(
    error: unknown,
    context?: {screen?: string; action?: string},
  ): UserFriendlyError {
    return {
      title: 'Storage Error',
      message: 'Unable to save data. Please free up storage space on your device.',
      category: ErrorCategory.STORAGE,
      recoveryActions: [
        {
          label: 'Clear Cache',
          action: 'custom',
          customHandler: () => {
            // Clear app cache
            logger.info('User requested cache clear');
          },
        },
        {
          label: 'Dismiss',
          action: 'dismiss',
        },
      ],
      technicalDetails: __DEV__ ? this.extractErrorMessage(error) : undefined,
    };
  }

  /**
   * Data sync error messages
   */
  private getDataSyncError(
    error: unknown,
    context?: {screen?: string; action?: string},
  ): UserFriendlyError {
    return {
      title: 'Sync Error',
      message: 'Unable to sync your data. Your changes will be saved when connection is restored.',
      category: ErrorCategory.DATA_SYNC,
      recoveryActions: [
        {
          label: 'Retry Sync',
          action: 'retry',
        },
        {
          label: 'Continue Offline',
          action: 'dismiss',
        },
      ],
      technicalDetails: __DEV__ ? this.extractErrorMessage(error) : undefined,
    };
  }

  /**
   * Permission error messages
   */
  private getPermissionError(
    error: unknown,
    context?: {screen?: string; action?: string},
  ): UserFriendlyError {
    return {
      title: 'Permission Required',
      message: 'This feature requires permission. Please enable it in your device settings.',
      category: ErrorCategory.PERMISSION,
      recoveryActions: [
        {
          label: 'Open Settings',
          action: 'custom',
          customHandler: () => {
            // Open device settings
            logger.info('User navigated to settings for permission');
          },
        },
        {
          label: 'Cancel',
          action: 'dismiss',
        },
      ],
      technicalDetails: __DEV__ ? this.extractErrorMessage(error) : undefined,
    };
  }

  /**
   * Generic error messages
   */
  private getGenericError(
    error: unknown,
    context?: {screen?: string; action?: string},
  ): UserFriendlyError {
    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again later.',
      category: ErrorCategory.GENERIC,
      recoveryActions: [
        {
          label: 'Retry',
          action: 'retry',
        },
        {
          label: 'Report Issue',
          action: 'custom',
          customHandler: () => {
            // Navigate to report issue screen
            logger.info('User reported issue');
          },
        },
        {
          label: 'Dismiss',
          action: 'dismiss',
        },
      ],
      technicalDetails: __DEV__ ? this.extractErrorMessage(error) : undefined,
    };
  }
}

// Export singleton instance
export const errorMessageService = new ErrorMessageService();
export default errorMessageService;
