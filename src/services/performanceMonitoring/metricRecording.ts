import type {PerformanceMetric, PerformanceMemoryInfo, RenderPerformance} from './types';

export function createPerformanceMetric(params: {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  context?: Record<string, unknown>;
}): PerformanceMetric {
  return {
    ...params,
    timestamp: Date.now(),
  };
}

export function createRenderPerformanceMetric(params: {
  componentName: string;
  renderTime: number;
  propsCount: number;
  childrenCount: number;
}): RenderPerformance {
  return {
    ...params,
    timestamp: Date.now(),
  };
}

export function trimRecentMetrics<T>(metrics: T[], maxMetrics: number): T[] {
  return metrics.length > maxMetrics ? metrics.slice(-maxMetrics) : metrics;
}

export function createMemoryMetric(memory: PerformanceMemoryInfo): PerformanceMetric {
  const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
  const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
  const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

  return createPerformanceMetric({
    name: 'memoryUsage',
    value: usedMB,
    unit: 'MB',
    tags: {
      type: 'used',
      total: totalMB.toString(),
      limit: limitMB.toString(),
    },
  });
}
