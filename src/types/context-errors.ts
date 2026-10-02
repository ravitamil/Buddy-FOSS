import {logger as appLogger} from '@/services/LoggerService';

const logger = appLogger.contextLogger('ContextFoundation');

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class ContextError extends Error {
  constructor(
    message: string,
    public code: string,
    public context: string,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public originalError?: Error,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'ContextError';
  }

  static retryable(
    message: string,
    code: string,
    context: string,
    originalError?: Error,
  ): ContextError {
    return new ContextError(message, code, context, ErrorSeverity.MEDIUM, originalError, true);
  }

  static critical(
    message: string,
    code: string,
    context: string,
    originalError?: Error,
  ): ContextError {
    return new ContextError(message, code, context, ErrorSeverity.CRITICAL, originalError, false);
  }
}

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  operationName: string,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    severity?: ErrorSeverity;
  } = {},
): Promise<T> => {
  const {maxRetries = 0, retryDelay = 1000, severity = ErrorSeverity.MEDIUM} = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      const isRetryable = error instanceof ContextError ? error.retryable : true;
      if (!isRetryable) {
        break;
      }

      logger.warn(`${operationName} failed, retrying`, {
        context,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1,
        retryDelay,
      });

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  const contextError = new ContextError(
    `Failed to ${operationName} in ${context} after ${maxRetries + 1} attempts`,
    `${context.toUpperCase()}_${operationName.toUpperCase()}_ERROR`,
    context,
    severity,
    lastError || undefined,
    false,
  );

  logger.error(`${operationName} failed permanently`, {
    context,
    error: contextError,
    originalError: lastError,
    attempts: maxRetries + 1,
    timestamp: new Date().toISOString(),
  });

  throw contextError;
};
