export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
  context?: Record<string, unknown>;
}

export interface PerformanceThreshold {
  warning: number;
  critical: number;
  unit: string;
}

export interface BundleAnalysis {
  totalSize: number;
  jsSize: number;
  assetSize: number;
  chunkCount: number;
  timestamp: number;
}

export interface RenderPerformance {
  componentName: string;
  renderTime: number;
  propsCount: number;
  childrenCount: number;
  timestamp: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

export interface PerformanceDashboard {
  summary: {
    totalMetrics: number;
    averageAppStartup: number;
    averageScreenTransition: number;
    memoryUsage: number;
    bundleSize: number;
  };
  recentMetrics: PerformanceMetric[];
  slowestComponents: RenderPerformance[];
  alerts: PerformanceAlert[];
}

export interface PerformanceStatistics {
  totalMetrics: number;
  renderMetrics: number;
  averageMetrics: Record<string, number>;
  thresholdViolations: number;
}

export interface PerformanceMemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
