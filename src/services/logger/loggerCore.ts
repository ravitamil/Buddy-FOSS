/**
 * Centralized Logger Service
 *
 * Provides environment-aware, structured logging with severity levels
 * and external service integration capabilities.
 */

import {originalConsole} from './loggerConsole';
import {
  clearLogFile,
  consoleLog,
  readLogFile,
  sendToExternalService,
  writeLogToFile,
} from './loggerOutput';
import {sanitizeContext, sanitizeData} from './loggerSanitization';
import {LOG_LEVELS, LogLevel, type LogEntry, type LoggerConfig} from './loggerTypes';

export {LogLevel};
export type {LogEntry};

class LoggerService {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private readonly MAX_QUEUE_SIZE = 100;

  constructor() {
    const isDevelopment = __DEV__;

    this.config = {
      enableConsole: true,
      enableFileLogging: !isDevelopment,
      enableExternalService: false,
      minLevel: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
      sanitizePII: true,
    };
  }

  debug(message: string, context?: LogEntry['context'], data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: LogEntry['context'], data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: LogEntry['context'], data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: LogEntry['context'], error?: unknown, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data, getStackTrace(error));
  }

  critical(message: string, context?: LogEntry['context'], error?: unknown, data?: unknown): void {
    this.log(LogLevel.CRITICAL, message, context, data, getStackTrace(error));
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogEntry['context'],
    data?: unknown,
    stackTrace?: string,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.config.sanitizePII ? sanitizeContext(context) : context,
      data: this.config.sanitizePII ? sanitizeData(data) : data,
      stackTrace,
    };

    this.enqueueLog(logEntry);

    if (this.config.enableConsole) {
      consoleLog(logEntry);
    }

    if (this.config.enableFileLogging) {
      writeLogToFile(logEntry).catch((error) => {
        originalConsole.error('[Logger] Failed to write to file:', error);
      });
    }

    if (
      this.config.enableExternalService &&
      (level === LogLevel.ERROR || level === LogLevel.CRITICAL)
    ) {
      sendToExternalService(logEntry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const currentLevelIndex = LOG_LEVELS.indexOf(this.config.minLevel);
    const logLevelIndex = LOG_LEVELS.indexOf(level);

    return logLevelIndex >= currentLevelIndex;
  }

  private enqueueLog(logEntry: LogEntry): void {
    this.logQueue.push(logEntry);

    if (this.logQueue.length > this.MAX_QUEUE_SIZE) {
      this.logQueue.shift();
    }
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logQueue.slice(-count);
  }

  clearLogs(): void {
    this.logQueue = [];
  }

  async getLogFile(): Promise<string | null> {
    return readLogFile();
  }

  async clearLogFile(): Promise<void> {
    await clearLogFile();
  }

  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = {...this.config, ...config};
  }
}

function getStackTrace(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

export const logger = new LoggerService();
export default logger;
