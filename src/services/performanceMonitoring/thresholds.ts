import type {PerformanceAlert, PerformanceMetric, PerformanceThreshold} from './types';

export const defaultPerformanceThresholds: Record<string, PerformanceThreshold> = {
  appStartup: {warning: 3000, critical: 5000, unit: 'ms'},
  screenTransition: {warning: 300, critical: 500, unit: 'ms'},
  listRender: {warning: 100, critical: 200, unit: 'ms'},
  apiResponse: {warning: 2000, critical: 5000, unit: 'ms'},
  memoryUsage: {warning: 100, critical: 200, unit: 'MB'},
  bundleSize: {warning: 10, critical: 20, unit: 'MB'},
  frameRate: {warning: 45, critical: 30, unit: 'fps'},
};

export const isMetricCritical = (
  metricName: string,
  value: number,
  threshold: PerformanceThreshold,
): boolean =>
  metricName === 'frameRate' ? value <= threshold.critical : value >= threshold.critical;

export const isMetricWarning = (
  metricName: string,
  value: number,
  threshold: PerformanceThreshold,
): boolean =>
  metricName === 'frameRate' ? value <= threshold.warning : value >= threshold.warning;

export const getThresholdViolation = (
  metric: PerformanceMetric,
  thresholds: Record<string, PerformanceThreshold>,
): {
  level: 'critical' | 'warning';
  threshold: PerformanceThreshold;
  thresholdValue: number;
} | null => {
  const threshold = thresholds[metric.name];
  if (!threshold) return null;

  if (isMetricCritical(metric.name, metric.value, threshold)) {
    return {
      level: 'critical',
      threshold,
      thresholdValue: threshold.critical,
    };
  }

  if (isMetricWarning(metric.name, metric.value, threshold)) {
    return {
      level: 'warning',
      threshold,
      thresholdValue: threshold.warning,
    };
  }

  return null;
};

export const getMetricLevel = (
  metric: PerformanceMetric,
  thresholds: Record<string, PerformanceThreshold>,
): 'info' | 'warning' | 'error' => {
  const threshold = thresholds[metric.name];
  if (!threshold) return 'info';
  if (isMetricCritical(metric.name, metric.value, threshold)) return 'error';
  if (isMetricWarning(metric.name, metric.value, threshold)) return 'warning';
  return 'info';
};

export const isSignificantMetric = (
  metric: PerformanceMetric,
  thresholds: Record<string, PerformanceThreshold>,
): boolean => {
  const threshold = thresholds[metric.name];
  if (!threshold) return false;

  if (metric.name === 'frameRate') {
    return metric.value <= threshold.warning * 1.2;
  }

  return metric.value >= threshold.warning * 0.8;
};

export const getAverageMetric = (metrics: PerformanceMetric[], metricName: string): number => {
  const relevantMetrics = metrics.filter((metric) => metric.name === metricName);
  if (relevantMetrics.length === 0) return 0;

  const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
  return Math.round(sum / relevantMetrics.length);
};

export const getLatestMetric = (
  metrics: PerformanceMetric[],
  metricName: string,
): number | null => {
  const relevantMetrics = metrics.filter((metric) => metric.name === metricName);
  if (relevantMetrics.length === 0) return null;

  return relevantMetrics[relevantMetrics.length - 1].value;
};

export const createPerformanceAlerts = (
  metrics: PerformanceMetric[],
  thresholds: Record<string, PerformanceThreshold>,
): PerformanceAlert[] => {
  const alerts: PerformanceAlert[] = [];
  const recentMetrics = metrics.slice(-100);

  Object.entries(thresholds).forEach(([metricName, threshold]) => {
    const relevantMetrics = recentMetrics.filter((metric) => metric.name === metricName);
    if (relevantMetrics.length === 0) return;

    const latestMetric = relevantMetrics[relevantMetrics.length - 1];

    if (isMetricCritical(metricName, latestMetric.value, threshold)) {
      alerts.push({
        type: 'critical',
        message:
          metricName === 'frameRate'
            ? `${metricName} is critically low: ${latestMetric.value}${threshold.unit}`
            : `${metricName} is critically high: ${latestMetric.value}${threshold.unit}`,
        metric: metricName,
        value: latestMetric.value,
        threshold: threshold.critical,
      });
      return;
    }

    if (isMetricWarning(metricName, latestMetric.value, threshold)) {
      alerts.push({
        type: 'warning',
        message:
          metricName === 'frameRate'
            ? `${metricName} is below warning threshold: ${latestMetric.value}${threshold.unit}`
            : `${metricName} is above warning threshold: ${latestMetric.value}${threshold.unit}`,
        metric: metricName,
        value: latestMetric.value,
        threshold: threshold.warning,
      });
    }
  });

  return alerts;
};

export const countThresholdViolations = (
  metrics: PerformanceMetric[],
  thresholds: Record<string, PerformanceThreshold>,
): number =>
  metrics.filter((metric) => {
    const threshold = thresholds[metric.name];
    return threshold ? isMetricWarning(metric.name, metric.value, threshold) : false;
  }).length;
