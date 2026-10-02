export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: {
    screen?: string;
    component?: string;
    userId?: string;
    [key: string]: unknown;
  };
  data?: unknown;
  stackTrace?: string;
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableFileLogging: boolean;
  enableExternalService: boolean;
  minLevel: LogLevel;
  sanitizePII: boolean;
}

export const LOG_LEVELS = [
  LogLevel.DEBUG,
  LogLevel.INFO,
  LogLevel.WARN,
  LogLevel.ERROR,
  LogLevel.CRITICAL,
];
