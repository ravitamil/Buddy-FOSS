/**
 * Performance Monitoring Hook
 *
 * Provides easy-to-use performance monitoring capabilities for React components.
 */

import {useEffect, useRef, useCallback} from 'react';
import {performanceMonitoring} from '../services/PerformanceMonitoringService';

interface UsePerformanceMonitoringOptions {
  componentName?: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
  trackUpdates?: boolean;
}

interface PerformanceHookReturn {
  measureOperation: <T>(
    operationName: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>,
  ) => Promise<T>;
  recordMetric: (name: string, value: number, unit: string, tags?: Record<string, string>) => void;
  startTimer: (name: string) => () => void;
}

/**
 * Hook for monitoring component and operation performance
 */
export function usePerformanceMonitoring(
  options: UsePerformanceMonitoringOptions = {},
): PerformanceHookReturn {
  const {
    componentName = 'UnknownComponent',
    trackRenders = true,
    trackMounts = true,
    trackUpdates = false,
  } = options;

  const renderStartTime = useRef<number>(performance.now());
  const mountTime = useRef<number | null>(null);
  const renderCount = useRef<number>(0);
  const propsRef = useRef<Record<string, unknown> | null>(null);

  // Track component mount
  useEffect(() => {
    if (trackMounts) {
      const mountDuration = performance.now() - renderStartTime.current;
      mountTime.current = mountDuration;

      performanceMonitoring.recordMetric('componentMount', mountDuration, 'ms', {
        component: componentName,
      });
    }

    // Cleanup on unmount
    return () => {
      if (trackMounts && mountTime.current !== null) {
        performanceMonitoring.recordMetric(
          'componentUnmount',
          performance.now() - (Date.now() - mountTime.current),
          'ms',
          {component: componentName},
        );
      }
    };
  }, [componentName, trackMounts]);

  // Track renders
  useEffect(() => {
    if (trackRenders) {
      const renderDuration = performance.now() - renderStartTime.current;
      renderCount.current += 1;

      performanceMonitoring.recordRenderPerformance(
        componentName,
        renderDuration,
        propsRef.current ? Object.keys(propsRef.current).length : 0,
        0, // Children count would need to be passed in
      );
    }

    // Reset render start time for next render
    renderStartTime.current = performance.now();
  });

  // Track updates
  useEffect(() => {
    if (trackUpdates && renderCount.current > 1) {
      performanceMonitoring.recordMetric(
        'componentUpdate',
        performance.now() - renderStartTime.current,
        'ms',
        {
          component: componentName,
          updateCount: renderCount.current.toString(),
        },
      );
    }
  });

  // Measure operation performance
  const measureOperation = useCallback(
    async <T>(
      operationName: string,
      operation: () => Promise<T>,
      tags?: Record<string, string>,
    ): Promise<T> => {
      return performanceMonitoring.measureOperation(operationName, operation, {
        component: componentName,
        ...tags,
      });
    },
    [componentName],
  );

  // Record custom metric
  const recordMetric = useCallback(
    (name: string, value: number, unit: string, tags?: Record<string, string>): void => {
      performanceMonitoring.recordMetric(name, value, unit, {component: componentName, ...tags});
    },
    [componentName],
  );

  // Start a timer for measuring operations
  const startTimer = useCallback(
    (name: string): (() => void) => {
      const startTime = performance.now();

      return () => {
        const duration = performance.now() - startTime;
        recordMetric(name, duration, 'ms');
      };
    },
    [recordMetric],
  );

  return {
    measureOperation,
    recordMetric,
    startTimer,
  };
}

/**
 * Hook for monitoring screen performance
 */
export function useScreenPerformance(screenName: string) {
  const screenStartTime = useRef<number>(performance.now());
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstRender.current) {
      const loadTime = performance.now() - screenStartTime.current;

      performanceMonitoring.recordMetric('screenLoad', loadTime, 'ms', {screen: screenName});

      isFirstRender.current = false;
    }
  }, [screenName]);

  // Track screen transitions
  useEffect(() => {
    const transitionStart = performance.now();

    return () => {
      const transitionTime = performance.now() - transitionStart;
      performanceMonitoring.recordMetric('screenTransition', transitionTime, 'ms', {
        screen: screenName,
      });
    };
  }, [screenName]);

  const recordScreenEvent = useCallback(
    (eventName: string, duration?: number, tags?: Record<string, string>) => {
      performanceMonitoring.recordMetric(eventName, duration || 0, 'ms', {
        screen: screenName,
        ...tags,
      });
    },
    [screenName],
  );

  return {recordScreenEvent};
}

/**
 * Hook for monitoring list performance
 */
export function useListPerformance(listName: string) {
  const renderStartTime = useRef<number>(0);
  const itemCount = useRef<number>(0);

  const startListRender = useCallback((count: number) => {
    renderStartTime.current = performance.now();
    itemCount.current = count;
  }, []);

  const endListRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;

      performanceMonitoring.recordMetric('listRender', renderTime, 'ms', {
        list: listName,
        itemCount: itemCount.current.toString(),
      });

      renderStartTime.current = 0;
    }
  }, [listName]);

  const recordListMetric = useCallback(
    (metricName: string, value: number, unit: string = 'ms') => {
      performanceMonitoring.recordMetric(metricName, value, unit, {list: listName});
    },
    [listName],
  );

  return {
    startListRender,
    endListRender,
    recordListMetric,
  };
}

/**
 * Hook for monitoring API performance
 */
export function useApiPerformance() {
  const measureApiCall = useCallback(
    async <T>(
      endpoint: string,
      apiCall: () => Promise<T>,
      tags?: Record<string, string>,
    ): Promise<T> => {
      return performanceMonitoring.measureOperation('apiCall', apiCall, {endpoint, ...tags});
    },
    [],
  );

  const recordApiMetric = useCallback(
    (endpoint: string, responseTime: number, status: 'success' | 'error', statusCode?: number) => {
      performanceMonitoring.recordMetric('apiResponse', responseTime, 'ms', {
        endpoint,
        status,
        statusCode: statusCode?.toString() || 'unknown',
      });
    },
    [],
  );

  return {
    measureApiCall,
    recordApiMetric,
  };
}

export default usePerformanceMonitoring;
