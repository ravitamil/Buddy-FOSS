import {
  countThresholdViolations,
  createPerformanceAlerts,
  getAverageMetric,
  getLatestMetric,
} from './thresholds';
import type {
  PerformanceDashboard,
  PerformanceMetric,
  PerformanceStatistics,
  PerformanceThreshold,
  RenderPerformance,
} from './types';

export const createPerformanceDashboard = (
  metrics: PerformanceMetric[],
  renderMetrics: RenderPerformance[],
  thresholds: Record<string, PerformanceThreshold>,
): PerformanceDashboard => ({
  summary: {
    totalMetrics: metrics.length,
    averageAppStartup: getAverageMetric(metrics, 'appStartup'),
    averageScreenTransition: getAverageMetric(metrics, 'screenTransition'),
    memoryUsage: getLatestMetric(metrics, 'memoryUsage') || 0,
    bundleSize: getLatestMetric(metrics, 'bundleSize') || 0,
  },
  recentMetrics: metrics.slice(-50),
  slowestComponents: [...renderMetrics].sort((a, b) => b.renderTime - a.renderTime).slice(0, 10),
  alerts: createPerformanceAlerts(metrics, thresholds),
});

export const createPerformanceStatistics = (
  metrics: PerformanceMetric[],
  renderMetrics: RenderPerformance[],
  thresholds: Record<string, PerformanceThreshold>,
): PerformanceStatistics => {
  const averageMetrics: Record<string, number> = {};
  Object.keys(thresholds).forEach((metricName) => {
    averageMetrics[metricName] = getAverageMetric(metrics, metricName);
  });

  return {
    totalMetrics: metrics.length,
    renderMetrics: renderMetrics.length,
    averageMetrics,
    thresholdViolations: countThresholdViolations(metrics, thresholds),
  };
};
