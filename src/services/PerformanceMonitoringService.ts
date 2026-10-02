import {logger as appLogger} from './LoggerService';
import {expoErrorReporting} from './ExpoErrorReportingService';
import {
  createPerformanceDashboard,
  createPerformanceStatistics,
} from './performanceMonitoring/dashboard';
import {estimateBundleSize} from './performanceMonitoring/bundleAnalysis';
import {isPerformanceMemoryInfo} from './performanceMonitoring/memoryInfo';
import {
  createMemoryMetric,
  createPerformanceMetric,
  createRenderPerformanceMetric,
  trimRecentMetrics,
} from './performanceMonitoring/metricRecording';
import {
  defaultPerformanceThresholds,
  getMetricLevel,
  getThresholdViolation,
  isSignificantMetric,
} from './performanceMonitoring/thresholds';
import type {
  BundleAnalysis,
  PerformanceDashboard,
  PerformanceMetric,
  PerformanceStatistics,
  PerformanceThreshold,
  RenderPerformance,
} from './performanceMonitoring/types';

class PerformanceMonitoringService {
  private logger = appLogger.serviceLogger('PerformanceMonitoring');
  private metrics: PerformanceMetric[] = [];
  private renderMetrics: RenderPerformance[] = [];
  private maxMetrics = 1000;
  private isInitialized = false;
  private performanceObserver?: PerformanceObserver;
  private frameRateMonitoringEnabled = true;
  private frameRateAnimationId?: number;
  private jsStartBaseline: number = typeof performance !== 'undefined' ? performance.now() : 0;

  private thresholds: Record<string, PerformanceThreshold> = {...defaultPerformanceThresholds};

  initialize(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    try {
      this.logger.info('Initializing performance monitoring');

      this.setupPerformanceObservers();
      this.monitorAppStartup();
      this.setupMemoryMonitoring();
      this.setupFrameRateMonitoring();
      this.analyzeBundleSize();
      this.startPeriodicChecks();

      this.isInitialized = true;
      this.logger.info('Performance monitoring initialized');

      return Promise.resolve();
    } catch (error) {
      this.logger.error('Failed to initialize performance monitoring', error);
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  recordMetric(
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>,
    context?: Record<string, unknown>,
  ): void {
    const metric = createPerformanceMetric({
      name,
      value,
      unit,
      tags,
      context,
    });

    this.metrics.push(metric);
    this.metrics = trimRecentMetrics(this.metrics, this.maxMetrics);
    this.checkThreshold(metric);

    if (isSignificantMetric(metric, this.thresholds)) {
      this.logger.info(`Performance metric: ${name}`, {
        value,
        unit,
        tags,
        context,
      });
      expoErrorReporting.addBreadcrumb(
        `Performance: ${name} = ${value}${unit}`,
        'performance',
        getMetricLevel(metric, this.thresholds),
        {metric: name, value, unit, ...tags},
      );
    }
  }

  recordRenderPerformance(
    componentName: string,
    renderTime: number,
    propsCount: number = 0,
    childrenCount: number = 0,
  ): void {
    const renderMetric = createRenderPerformanceMetric({
      componentName,
      renderTime,
      propsCount,
      childrenCount,
    });

    this.renderMetrics.push(renderMetric);
    this.renderMetrics = trimRecentMetrics(this.renderMetrics, this.maxMetrics);
    this.recordMetric(
      'componentRender',
      renderTime,
      'ms',
      {component: componentName},
      {propsCount, childrenCount},
    );
  }

  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>,
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      this.recordMetric(operationName, duration, 'ms', tags);

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric(
        operationName,
        duration,
        'ms',
        {...tags, status: 'error'},
        {error: error instanceof Error ? error.message : String(error)},
      );

      throw error;
    }
  }

  getPerformanceDashboard(): PerformanceDashboard {
    return createPerformanceDashboard(this.metrics, this.renderMetrics, this.thresholds);
  }

  private setupPerformanceObservers(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();

          entries.forEach((entry) => {
            this.recordMetric(
              entry.name,
              entry.duration,
              'ms',
              {type: entry.entryType},
              {startTime: entry.startTime},
            );
          });
        });

        this.performanceObserver.observe({
          entryTypes: ['navigation', 'measure', 'mark'],
        });
      } catch (error) {
        this.logger.warn('Failed to set up performance observer', error);
      }
    }
  }

  private monitorAppStartup(): void {
    if (typeof performance !== 'undefined') {
      const monitoringReadyTime = performance.now() - this.jsStartBaseline;
      this.recordMetric('performanceMonitoringReady', monitoringReadyTime, 'ms');
    }
  }

  getStartupDuration(): number {
    return typeof performance !== 'undefined' ? performance.now() - this.jsStartBaseline : 0;
  }

  private setupMemoryMonitoring(): void {
    const checkMemory = () => {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memory = (performance as Performance & {memory?: unknown}).memory;
        if (isPerformanceMemoryInfo(memory)) {
          const metric = createMemoryMetric(memory);
          this.recordMetric(metric.name, metric.value, metric.unit, metric.tags);
        }
      }
    };

    setInterval(checkMemory, 30000);
    checkMemory();
  }

  private setupFrameRateMonitoring(): void {
    if (!this.frameRateMonitoringEnabled) {
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrameRate = () => {
      if (!this.frameRateMonitoringEnabled) {
        return;
      }

      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        this.recordMetric('frameRate', fps, 'fps');

        frameCount = 0;
        lastTime = currentTime;
      }

      this.frameRateAnimationId = requestAnimationFrame(measureFrameRate);
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      this.frameRateAnimationId = requestAnimationFrame(measureFrameRate);
    }
  }

  private analyzeBundleSize(): void {
    try {
      const estimatedBundleSize = estimateBundleSize();

      this.recordMetric('bundleSize', estimatedBundleSize, 'MB', {type: 'estimated'});

      this.logger.info('Bundle size analysis completed', {
        estimatedSize: estimatedBundleSize,
      });
    } catch (error) {
      this.logger.error('Failed to analyze bundle size', error);
    }
  }

  private startPeriodicChecks(): void {
    setInterval(
      () => {
        this.performPeriodicCheck();
      },
      5 * 60 * 1000,
    );
  }

  private performPeriodicCheck(): void {
    const dashboard = this.getPerformanceDashboard();

    this.logger.info('Periodic performance check', {
      summary: dashboard.summary,
      alertCount: dashboard.alerts.length,
    });

    dashboard.alerts
      .filter((alert) => alert.type === 'critical')
      .forEach((alert) => {
        expoErrorReporting.addBreadcrumb(
          `Performance Alert: ${alert.message}`,
          'performance',
          'error',
          {
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
          },
        );
      });
  }

  private checkThreshold(metric: PerformanceMetric): void {
    const violation = getThresholdViolation(metric, this.thresholds);
    if (!violation) return;

    if (violation.level === 'critical') {
      this.logger.error(`Critical performance threshold exceeded: ${metric.name}`, {
        value: metric.value,
        threshold: violation.thresholdValue,
        unit: metric.unit,
        ...metric.context,
      });
      return;
    }

    this.logger.warn(`Performance threshold warning: ${metric.name}`, {
      value: metric.value,
      threshold: violation.thresholdValue,
      unit: metric.unit,
      ...metric.context,
    });
  }

  getStatistics(): PerformanceStatistics {
    return createPerformanceStatistics(this.metrics, this.renderMetrics, this.thresholds);
  }

  updateThreshold(metricName: string, threshold: Partial<PerformanceThreshold>): void {
    if (this.thresholds[metricName]) {
      this.thresholds[metricName] = {
        ...this.thresholds[metricName],
        ...threshold,
      };
      this.logger.info(`Updated threshold for ${metricName}`, this.thresholds[metricName]);
    }
  }

  disableFrameRateMonitoring(): void {
    this.frameRateMonitoringEnabled = false;
    if (this.frameRateAnimationId) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.frameRateAnimationId);
      }
      this.frameRateAnimationId = undefined;
    }

    this.logger.info('Frame rate monitoring disabled');
  }

  enableFrameRateMonitoring(): void {
    this.frameRateMonitoringEnabled = true;
    if (!this.frameRateAnimationId) {
      this.setupFrameRateMonitoring();
    }

    this.logger.info('Frame rate monitoring enabled');
  }

  clearMetrics(): void {
    this.metrics = [];
    this.renderMetrics = [];
    this.logger.info('Performance metrics cleared');
  }
}

export const performanceMonitoring = new PerformanceMonitoringService();
export default performanceMonitoring;

export type {PerformanceMetric, PerformanceThreshold, BundleAnalysis, RenderPerformance};
