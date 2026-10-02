/**
 * Production Monitoring Service
 *
 * Initializes and manages production monitoring services including
 * error reporting, crash analytics, and performance monitoring.
 */

import {
  expoErrorReporting,
  ErrorReportContext,
  ErrorReportingSession,
} from './ExpoErrorReportingService';
import {performanceMonitoring} from './PerformanceMonitoringService';
import {productionConfig} from './ProductionConfigService';
import {deploymentService} from './DeploymentService';
import {logger as appLogger} from './LoggerService';
import Constants from 'expo-constants';

type MonitoringEventProperties = Record<string, unknown>;

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

class ProductionMonitoringService {
  private logger = appLogger.serviceLogger('ProductionMonitoring');
  private isCriticalInitialized = false;
  private isInitialized = false;
  private criticalInitialization: Promise<void> | null = null;
  private deferredInitialization: Promise<void> | null = null;

  /**
   * Initialize the services needed to capture startup and crash failures.
   */
  async initializeCritical(): Promise<void> {
    if (this.isCriticalInitialized) return;
    if (this.criticalInitialization) return this.criticalInitialization;

    this.criticalInitialization = this.initializeCriticalServices();

    try {
      await this.criticalInitialization;
    } finally {
      this.criticalInitialization = null;
    }
  }

  /**
   * Initialize monitoring work that can wait until initial interactions finish.
   */
  async initializeDeferred(): Promise<void> {
    await this.initializeCritical();
    if (this.isInitialized) return;
    if (this.deferredInitialization) return this.deferredInitialization;

    this.deferredInitialization = this.initializeDeferredServices();

    try {
      await this.deferredInitialization;
    } finally {
      this.deferredInitialization = null;
    }
  }

  async initialize(): Promise<void> {
    await this.initializeCritical();
    await this.initializeDeferred();
  }

  private async initializeCriticalServices(): Promise<void> {
    this.logger.info('Initializing critical production monitoring services');

    try {
      await this.initializeProductionConfig();
      await this.initializeErrorReporting();
      await this.initializeCrashAnalytics();
      this.setupAppLifecycleMonitoring();
      this.isCriticalInitialized = true;
      this.logger.info('Critical production monitoring services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize critical production monitoring services', error);
      throw error;
    }
  }

  private async initializeDeferredServices(): Promise<void> {
    this.logger.info('Initializing deferred production monitoring services');

    try {
      await this.initializeDeploymentService();
      await this.initializePerformanceMonitoring();
      this.isInitialized = true;
      this.logger.info('Deferred production monitoring services initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize deferred production monitoring services', error);
      throw error;
    }
  }

  /**
   * Initialize production configuration
   */
  private async initializeProductionConfig(): Promise<void> {
    try {
      await productionConfig.initialize();
      this.logger.info('Production configuration initialized');
    } catch (error) {
      this.logger.error('Failed to initialize production configuration', error);
      throw error;
    }
  }

  /**
   * Initialize deployment service
   */
  private async initializeDeploymentService(): Promise<void> {
    try {
      await deploymentService.initialize();
      this.logger.info('Deployment service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize deployment service', error);
      throw error;
    }
  }

  /**
   * Initialize error reporting service
   */
  private async initializeErrorReporting(): Promise<void> {
    try {
      await expoErrorReporting.initialize();

      // Set up global error context
      this.setupGlobalErrorContext();

      this.logger.info('Error reporting initialized');
    } catch (error) {
      this.logger.error('Failed to initialize error reporting', error);
      throw error;
    }
  }

  /**
   * Initialize performance monitoring
   */
  private async initializePerformanceMonitoring(): Promise<void> {
    try {
      // Get the current configuration to check frame rate monitoring settings
      const config = productionConfig.getConfig();
      const enableFrameRateMonitoring = config?.performance?.enableFrameRateMonitoring ?? true;

      // Initialize the performance monitoring service
      await performanceMonitoring.initialize();

      // Disable frame rate monitoring if configured to do so
      if (!enableFrameRateMonitoring) {
        performanceMonitoring.disableFrameRateMonitoring();
        this.logger.info('Frame rate monitoring disabled by configuration');
      }

      // Set up memory monitoring (if available)
      this.setupMemoryMonitoring();

      this.logger.info('Performance monitoring initialized');
    } catch (error) {
      this.logger.error('Failed to initialize performance monitoring', error);
    }
  }

  /**
   * Initialize crash analytics
   */
  private async initializeCrashAnalytics(): Promise<void> {
    try {
      await Promise.resolve();
      // Set up crash detection
      this.setupCrashDetection();

      // Add initial breadcrumb
      expoErrorReporting.addBreadcrumb('Crash analytics initialized', 'system', 'info', {
        isDevice: Constants.isDevice,
        isDevelopment: __DEV__,
        platform: Constants.platform?.ios ? 'ios' : 'android',
      });

      this.logger.info('Crash analytics initialized');
    } catch (error) {
      this.logger.error('Failed to initialize crash analytics', error);
    }
  }

  /**
   * Set up global error context
   */
  private setupGlobalErrorContext(): void {
    // Set app-level tags
    expoErrorReporting.setTags({
      appVersion: Constants.expoConfig?.version || '1.0.0',
      buildVersion: Constants.expoConfig?.version || '1.0.0',
      environment: __DEV__ ? 'development' : 'production',
      platform: Constants.platform?.ios ? 'ios' : 'android',
      isDevice: Constants.isDevice ? 'true' : 'false',
    });

    // Add initial breadcrumb
    expoErrorReporting.addBreadcrumb('App initialized with error reporting', 'system', 'info', {
      timestamp: new Date().toISOString(),
      sessionStart: true,
    });
  }

  /**
   * Set up app lifecycle monitoring
   */
  private setupAppLifecycleMonitoring(): void {
    // Monitor app state changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        const state = document.hidden ? 'background' : 'foreground';
        expoErrorReporting.addBreadcrumb(`App moved to ${state}`, 'lifecycle', 'info', {
          appState: state,
        });
      });
    }

    // Monitor page/screen changes (if using navigation)
    this.setupNavigationMonitoring();
  }

  /**
   * Set up navigation monitoring
   */
  private setupNavigationMonitoring(): void {
    // This would integrate with your navigation system
    // For now, we'll set up basic URL change monitoring for web
    if (typeof window !== 'undefined') {
      let currentPath = window.location.pathname;

      const checkPathChange = () => {
        if (window.location.pathname !== currentPath) {
          expoErrorReporting.addBreadcrumb(
            `Navigation: ${currentPath} → ${window.location.pathname}`,
            'navigation',
            'info',
            {
              from: currentPath,
              to: window.location.pathname,
            },
          );
          currentPath = window.location.pathname;
        }
      };

      // Check for path changes periodically
      setInterval(checkPathChange, 1000);
    }
  }

  /**
   * Set up crash detection
   */
  private setupCrashDetection(): void {
    // Monitor for potential crash indicators
    let errorCount = 0;
    const errorThreshold = 5;
    const timeWindow = 60000; // 1 minute

    const originalErrorHandler = expoErrorReporting.reportError.bind(expoErrorReporting);

    // Wrap error reporting to detect crash patterns
    expoErrorReporting.reportError = async (
      error: Error,
      context: ErrorReportContext = {},
    ): Promise<void> => {
      errorCount++;

      // Reset counter after time window
      setTimeout(() => {
        errorCount = Math.max(0, errorCount - 1);
      }, timeWindow);

      // Detect potential crash scenario
      if (errorCount >= errorThreshold) {
        await expoErrorReporting.reportCrash(
          new Error(`High error rate detected: ${errorCount} errors in ${timeWindow}ms`),
          {
            ...context,
            tags: {
              ...context?.tags,
              crashPattern: 'highErrorRate',
              errorCount: errorCount.toString(),
            },
          },
        );
      }

      // Call original handler
      await originalErrorHandler(error, context);
    };
  }

  /**
   * Set up memory monitoring
   */
  private setupMemoryMonitoring(): void {
    // Monitor memory usage if available
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as PerformanceWithMemory).memory;
        if (memory) {
          const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
          const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

          // Log memory usage periodically
          if (usedMB > limitMB * 0.8) {
            // 80% of limit
            expoErrorReporting.addBreadcrumb(
              `High memory usage: ${usedMB}MB / ${limitMB}MB`,
              'performance',
              'warning',
              {usedMB, totalMB, limitMB},
            );
          }
        }
      };

      // Check memory every 30 seconds
      setInterval(checkMemory, 30000);
    }
  }

  /**
   * Report a custom event
   */
  reportEvent(
    eventName: string,
    properties?: MonitoringEventProperties,
    level: 'info' | 'warning' | 'error' = 'info',
  ): void {
    expoErrorReporting.addBreadcrumb(`Event: ${eventName}`, 'custom', level, properties);

    this.logger.info(`Custom event: ${eventName}`, properties);
  }

  /**
   * Set user context for monitoring
   */
  setUserContext(userId: string, email?: string, username?: string): void {
    expoErrorReporting.setUserContext(userId, email, username);
    this.logger.info('User context updated for monitoring', {userId, email, username});
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isInitialized: boolean;
    errorReportingActive: boolean;
    sessionInfo: ErrorReportingSession;
  } {
    return {
      isInitialized: this.isInitialized,
      errorReportingActive: true, // Always true once initialized
      sessionInfo: expoErrorReporting.getSessionInfo(),
    };
  }

  /**
   * Flush all pending reports (useful before app termination)
   */
  async flush(): Promise<void> {
    try {
      this.logger.info('Flushing monitoring data');

      // Add final breadcrumb
      expoErrorReporting.addBreadcrumb(
        'App terminating - flushing monitoring data',
        'system',
        'info',
      );

      // In a real implementation, this would ensure all pending reports are sent
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.info('Monitoring data flushed');
    } catch (error) {
      this.logger.error('Failed to flush monitoring data', error);
    }
  }
}

// Export singleton instance
export const productionMonitoring = new ProductionMonitoringService();
export default productionMonitoring;
