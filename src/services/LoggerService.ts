/**
 * Public Logger Service
 *
 * Provides the app-facing logger API and delegates low-level queueing,
 * sanitization, transport, and level filtering to the private core logger.
 */

import {logger as coreLogger, type LogEntry} from './logger/loggerCore';
export {LogLevel} from './logger/loggerCore';
export type {LogEntry} from './logger/loggerCore';

// Context-specific logger interface
interface ContextLogger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  critical: (message: string, ...args: unknown[]) => void;
}

// Service-specific logger interface
interface ServiceLogger extends ContextLogger {
  operation: (operationName: string, data?: unknown) => void;
  performance: (operationName: string, duration: number, data?: unknown) => void;
}

type LoggerConfigUpdate = Parameters<typeof coreLogger.updateConfig>[0];

interface ParsedLogArgs {
  context?: LogEntry['context'];
  error?: Error;
  data?: unknown;
}

class AppLoggerService {
  private contextLoggers: Map<string, ContextLogger> = new Map();
  private serviceLoggers: Map<string, ServiceLogger> = new Map();
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
  };

  constructor() {
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };

    // Initialize console replacement in development (but not during tests)
    if (__DEV__ && !process.env.NODE_ENV?.includes('test')) {
      this.initializeConsoleReplacement();
    }
  }

  private stringifyConsoleArg(arg: unknown): string {
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'bigint') {
      return arg.toString();
    }
    if (typeof arg === 'symbol') return arg.description ?? '[Symbol]';
    if (typeof arg === 'function') return `[Function ${arg.name || 'anonymous'}]`;
    if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';

    try {
      return JSON.stringify(arg);
    } catch {
      try {
        return Object.prototype.toString.call(arg);
      } catch {
        return '[Unserializable]';
      }
    }
  }

  private isLogContext(value: unknown): value is LogEntry['context'] {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  private asError(value: unknown): Error | undefined {
    if (value instanceof Error) return value;
    if (value && typeof value === 'object' && 'stack' in value) {
      return new Error(this.stringifyConsoleArg(value));
    }
    return undefined;
  }

  // Helper to parse flexible argument lists into logger parameters
  private parseArgs(rest: unknown[]): ParsedLogArgs {
    const args = [...rest];

    // Strip CSS console style strings if present
    if (typeof args[0] === 'string' && args[0].includes('color')) {
      args.shift();
    }

    let context: LogEntry['context'] | undefined;
    let error: Error | undefined;
    let data: unknown;

    // Detect error-like object first
    for (let i = 0; i < args.length; i++) {
      const item = args[i];
      const parsedError = this.asError(item);
      if (parsedError) {
        error = parsedError;
        args.splice(i, 1);
        break;
      }
    }

    if (args.length === 1) {
      // Single remaining argument -> treat as data
      data = args[0];
    } else if (args.length >= 2) {
      // If first is a plain object -> context, rest -> data (aggregate)
      if (this.isLogContext(args[0])) {
        context = args[0];
        data = args.length === 2 ? args[1] : args.slice(1);
      } else {
        // No context -> aggregate as data array
        data = args;
      }
    }

    return {context, error, data};
  }

  // Delegate base logger methods with flexible params
  debug(message: string, ...rest: unknown[]): void {
    const {context, data} = this.parseArgs(rest);
    coreLogger.debug(message, context, data);
  }

  info(message: string, ...rest: unknown[]): void {
    const {context, data} = this.parseArgs(rest);
    coreLogger.info(message, context, data);
  }

  warn(message: string, ...rest: unknown[]): void {
    const {context, data} = this.parseArgs(rest);
    coreLogger.warn(message, context, data);
  }

  error(message: string, ...rest: unknown[]): void {
    const {context, error, data} = this.parseArgs(rest);
    coreLogger.error(message, context, error, data);
  }

  critical(message: string, ...rest: unknown[]): void {
    const {context, error, data} = this.parseArgs(rest);
    coreLogger.critical(message, context, error, data);
  }

  getRecentLogs(count?: number): LogEntry[] {
    return coreLogger.getRecentLogs(count);
  }

  clearLogs(): void {
    coreLogger.clearLogs();
  }

  updateConfig(config: LoggerConfigUpdate): void {
    coreLogger.updateConfig(config);
  }

  /**
   * Create or get a context-specific logger
   */
  contextLogger(contextName: string): ContextLogger {
    if (!this.contextLoggers.has(contextName)) {
      const contextLogger: ContextLogger = {
        debug: (message: string, data?: unknown) =>
          this.debug(`[${contextName}] ${message}`, {context: contextName}, data),

        info: (message: string, data?: unknown) =>
          this.info(`[${contextName}] ${message}`, {context: contextName}, data),

        warn: (message: string, data?: unknown) =>
          this.warn(`[${contextName}] ${message}`, {context: contextName}, data),

        error: (message: string, error?: unknown, data?: unknown) =>
          this.error(`[${contextName}] ${message}`, {context: contextName}, error, data),

        critical: (message: string, error?: unknown, data?: unknown) =>
          this.critical(`[${contextName}] ${message}`, {context: contextName}, error, data),
      };

      this.contextLoggers.set(contextName, contextLogger);
    }

    return this.contextLoggers.get(contextName)!;
  }

  /**
   * Create or get a component-specific logger (alias for contextLogger)
   */
  component(componentName: string): ContextLogger {
    return this.contextLogger(componentName);
  }

  /**
   * Create or get a service-specific logger with additional methods
   */
  serviceLogger(serviceName: string): ServiceLogger {
    if (!this.serviceLoggers.has(serviceName)) {
      const baseLogger = this.contextLogger(serviceName);

      const serviceLogger: ServiceLogger = {
        ...baseLogger,

        operation: (operationName: string, data?: unknown) =>
          this.info(
            `[${serviceName}] Operation: ${operationName}`,
            {context: serviceName, operation: operationName},
            data,
          ),

        performance: (operationName: string, duration: number, data?: unknown) =>
          this.info(
            `[${serviceName}] Performance: ${operationName} completed in ${duration}ms`,
            {context: serviceName, operation: operationName, duration},
            data,
          ),
      };

      this.serviceLoggers.set(serviceName, serviceLogger);
    }

    return this.serviceLoggers.get(serviceName)!;
  }

  /**
   * Initialize console statement replacement for development
   */
  private initializeConsoleReplacement(): void {
    // Only replace in development mode
    if (!__DEV__) return;

    // Replace console.log
    console.log = (...args: unknown[]) => {
      const message = args.map((arg) => this.stringifyConsoleArg(arg)).join(' ');

      // Use original console to avoid circular dependency
      this.originalConsole.log(`[Console] ${message}`);
    };

    // Replace console.error
    console.error = (...args: unknown[]) => {
      // Preserve native error payload/shape so RN/Metro can surface real exceptions.
      // Transforming error arguments here can collapse useful diagnostics into "null".
      this.originalConsole.error(...args);
    };

    // Replace console.warn
    console.warn = (...args: unknown[]) => {
      const message = args.map((arg) => this.stringifyConsoleArg(arg)).join(' ');

      // Use original console to avoid circular dependency
      this.originalConsole.warn(`[Console] ${message}`);
    };

    // Replace console.info
    console.info = (...args: unknown[]) => {
      const message = args.map((arg) => this.stringifyConsoleArg(arg)).join(' ');

      // Use original console to avoid circular dependency
      this.originalConsole.info(`[Console] ${message}`);
    };

    this.info('Console statement replacement initialized', {context: 'LoggerService'});
  }

  /**
   * Restore original console methods (for testing or cleanup)
   */
  restoreConsole(): void {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;

    this.info('Console methods restored', {context: 'LoggerService'});
  }

  /**
   * Complete external service integration (Firebase Crashlytics)
   */
  initializeExternalService(): Promise<void> {
    try {
      // Enable external service integration
      this.updateConfig({enableExternalService: true});

      this.info('External service integration initialized', {
        context: 'LoggerService',
        service: 'Supabase/Expo',
      });
      return Promise.resolve();
    } catch (error) {
      this.error(
        'Failed to initialize external service integration',
        {context: 'LoggerService'},
        error,
      );
      return Promise.resolve();
    }
  }

  /**
   * Get logger statistics
   */
  getLoggerStats(): {
    contextLoggers: number;
    serviceLoggers: number;
    recentLogsCount: number;
    consoleReplaced: boolean;
  } {
    return {
      contextLoggers: this.contextLoggers.size,
      serviceLoggers: this.serviceLoggers.size,
      recentLogsCount: this.getRecentLogs().length,
      consoleReplaced: __DEV__ && console.log !== this.originalConsole.log,
    };
  }

  /**
   * Clear all cached loggers
   */
  clearLoggerCache(): void {
    this.contextLoggers.clear();
    this.serviceLoggers.clear();
    this.info('Logger cache cleared', {context: 'LoggerService'});
  }

  /**
   * Map Database error codes to actionable, user-friendly hints.
   * Keeps messages consistent across services and contexts.
   */
  getDatabaseErrorHint(code?: string): string {
    switch (code) {
      case 'permission-denied':
        return 'Database rules blocked the write. Ensure RLS policies allow user access.';
      case 'unauthenticated':
        return 'User is not authenticated. Sign in with a non-anonymous account before syncing.';
      case 'unavailable':
        return 'Network or Database service unavailable. Retry when connection stabilizes.';
      case 'deadline-exceeded':
        return 'Operation timed out. Consider retrying with backoff.';
      case 'failed-precondition':
        return 'Precondition failed. Validate payload types and required fields.';
      case 'invalid-argument':
        return 'Invalid argument in payload. Check field types and remove undefined values.';
      case 'resource-exhausted':
        return 'Quota or limits exceeded. Reduce write volume or check Supabase quotas.';
      case 'aborted':
        return 'Operation aborted due to transaction conflict. Retry the write.';
      case 'already-exists':
        return 'Document already exists. Use update for existing IDs or change ID.';
      case 'not-found':
        return 'Target document not found. Create it first or verify the ID.';
      case 'out-of-range':
        return 'Value out of allowed range. Verify numeric/date fields.';
      case 'internal':
        return 'Internal Database error. Try again; if persistent, check Supabase status.';
      case 'data-loss':
        return 'Data loss detected; avoid retries without inspection.';
      case 'unknown':
      default:
        return 'Unknown Database error. Check logs for code, payload, and auth state.';
    }
  }

  /**
   * Build structured telemetry tags for Database errors to include in logs.
   */
  buildDatabaseTelemetryTags(
    source: string,
    operation: string,
    code?: string,
  ): Record<string, string> {
    const normalizedCode = code || 'unknown';
    const retryableCodes = new Set(['unavailable', 'deadline-exceeded', 'aborted']);

    const severity =
      normalizedCode === 'permission-denied' || normalizedCode === 'unauthenticated'
        ? 'warning'
        : 'error';

    return {
      service: 'Supabase',
      source,
      operation,
      code: normalizedCode,
      severity,
      retryable: String(retryableCodes.has(normalizedCode)),
    };
  }
}

export const logger = new AppLoggerService();
export default logger;

// Export types for use in other files
export type {ContextLogger, ServiceLogger};
