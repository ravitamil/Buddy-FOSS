/**
 * Expo-compatible error reporting facade.
 *
 * Keeps crash/error telemetry local to the app runtime until an external
 * reporting backend is wired in.
 */

import Constants from 'expo-constants';

import {logger as appLogger} from './LoggerService';

export type BreadcrumbLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

interface Breadcrumb {
  message: string;
  category?: string;
  level: BreadcrumbLevel;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface ErrorReportContext {
  tags?: Record<string, string>;
  level?: BreadcrumbLevel;
  [key: string]: unknown;
}

export interface ErrorReportingSession {
  initialized: boolean;
  sessionId: string;
  startedAt: number;
  appVersion?: string | null;
  buildNumber?: string | null;
  breadcrumbs: Breadcrumb[];
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
  tags: Record<string, string>;
  contexts: Record<string, unknown>;
}

class ExpoErrorReportingService {
  private readonly logger = appLogger.serviceLogger('ExpoErrorReporting');
  private readonly maxBreadcrumbs = 50;
  private initialized = false;
  private readonly startedAt = Date.now();
  private readonly sessionId = `session-${this.startedAt}-${Math.random().toString(36).slice(2, 10)}`;
  private breadcrumbs: Breadcrumb[] = [];
  private user: ErrorReportingSession['user'];
  private tags: Record<string, string> = {};
  private contexts: Record<string, unknown> = {};

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Promise.resolve();
    this.initialized = true;
    this.addBreadcrumb('Error reporting initialized', 'error-reporting', 'info');
  }

  async reportError(error: Error, context: ErrorReportContext = {}): Promise<void> {
    await Promise.resolve();
    this.logger.error('Captured error report', {
      message: error.message,
      stack: error.stack,
      context,
      breadcrumbs: this.breadcrumbs.slice(-10),
      tags: this.tags,
    });
  }

  async reportCrash(error: Error, context: ErrorReportContext = {}): Promise<void> {
    await Promise.resolve();
    this.logger.critical('Captured crash report', error, {
      context,
      breadcrumbs: this.breadcrumbs.slice(-10),
      tags: this.tags,
    });
  }

  addBreadcrumb(
    message: string,
    category?: string,
    level: BreadcrumbLevel = 'info',
    data?: Record<string, unknown>,
  ): void {
    this.breadcrumbs.push({
      message,
      category,
      level,
      data,
      timestamp: Date.now(),
    });

    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  setUserContext(userId: string, email?: string, username?: string): void {
    this.user = {id: userId, email, username};
  }

  setTags(tags: Record<string, string>): void {
    this.tags = {...this.tags, ...tags};
  }

  setContext(key: string, value: unknown): void {
    this.contexts[key] = value;
  }

  getSessionInfo(): ErrorReportingSession {
    return {
      initialized: this.initialized,
      sessionId: this.sessionId,
      startedAt: this.startedAt,
      appVersion: Constants.expoConfig?.version ?? null,
      buildNumber:
        Constants.expoConfig?.ios?.buildNumber ??
        Constants.expoConfig?.android?.versionCode?.toString() ??
        null,
      breadcrumbs: [...this.breadcrumbs],
      user: this.user,
      tags: {...this.tags},
      contexts: {...this.contexts},
    };
  }
}

export const expoErrorReporting = new ExpoErrorReportingService();
export default expoErrorReporting;
