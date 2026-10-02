import React from 'react';
import {logger as appLogger} from '../services/LoggerService';
import {performanceMonitoring} from '../services/PerformanceMonitoringService';

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

/**
 * Performance optimization utilities for React components
 */

/**
 * Custom hook for memoizing expensive calculations with performance tracking
 */
export const usePerformanceMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  operationName: string,
): T => {
  return React.useMemo(() => {
    const startTime = performance.now();
    const result = factory();
    const duration = performance.now() - startTime;

    if (duration > 10) {
      // Only log if calculation takes more than 10ms
      performanceMonitoring.recordMetric(`memo_${operationName}`, duration, 'ms', {
        type: 'memoization',
        operationName,
      });
    }

    return result;
  }, deps);
};

/**
 * Custom hook for memoizing callbacks with performance tracking
 */
export const usePerformanceCallback = <Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
  deps: React.DependencyList,
  operationName: string,
): ((...args: Args) => Return) => {
  return React.useCallback((...args: Args): Return => {
    const startTime = performance.now();
    const result = callback(...args);
    const duration = performance.now() - startTime;

    if (duration > 5) {
      // Only log if callback takes more than 5ms
      performanceMonitoring.recordMetric(`callback_${operationName}`, duration, 'ms', {
        type: 'callback',
        operationName,
      });
    }

    return result;
  }, deps);
};

/**
 * HOC for monitoring component render performance
 */
export const withRenderPerformance = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
) => {
  const WithRenderPerformance: React.FC<P> = React.memo((props) => {
    const renderStartTime = React.useRef<number>(0);

    // Track render start
    renderStartTime.current = performance.now();

    // Track render completion
    React.useLayoutEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitoring.recordRenderPerformance(componentName, renderTime);
    });

    return React.createElement(WrappedComponent, props);
  });

  WithRenderPerformance.displayName = `WithRenderPerformance(${componentName})`;
  return WithRenderPerformance;
};

/**
 * Custom hook for tracking list rendering performance
 */
export const useListPerformance = (listName: string, itemCount: number) => {
  const renderStartTime = React.useRef<number>(0);

  React.useEffect(() => {
    renderStartTime.current = performance.now();
  }, [itemCount]);

  React.useLayoutEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceMonitoring.recordMetric(`list_render_${listName}`, renderTime, 'ms', {
      type: 'list_render',
      listName,
      itemCount: itemCount.toString(),
    });
  }, [listName, itemCount]);
};

/**
 * Bundle size optimization utilities
 */
/**
 * Lazy load components to reduce initial bundle size
 */
export function lazyComponent<P extends object>(
  importFn: () => Promise<{default: React.ComponentType<P>}>,
  fallback?: React.ComponentType,
) {
  const LazyComponent = React.lazy(importFn);

  const WrappedComponent: React.FC<P> = (props) =>
    React.createElement(
      React.Suspense,
      {fallback: fallback ? React.createElement(fallback) : null},
      React.createElement(LazyComponent, props),
    );

  return WrappedComponent;
}

/**
 * Dynamic import with performance tracking
 */
export async function dynamicImport<T>(importFn: () => Promise<T>, moduleName: string): Promise<T> {
  const startTime = performance.now();

  try {
    const module = await importFn();
    const loadTime = performance.now() - startTime;

    performanceMonitoring.recordMetric(`dynamic_import_${moduleName}`, loadTime, 'ms', {
      type: 'dynamic_import',
      moduleName,
    });

    return module;
  } catch (error) {
    const loadTime = performance.now() - startTime;

    performanceMonitoring.recordMetric(`dynamic_import_error_${moduleName}`, loadTime, 'ms', {
      type: 'dynamic_import_error',
      moduleName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Code splitting utility for route-based splitting
 */
export function splitRoute<P extends object>(
  importFn: () => Promise<{default: React.ComponentType<P>}>,
  routeName: string,
) {
  return lazyComponent(async () => {
    const startTime = performance.now();
    const module = await importFn();
    const loadTime = performance.now() - startTime;

    performanceMonitoring.recordMetric(`route_load_${routeName}`, loadTime, 'ms', {
      type: 'route_load',
      routeName,
    });

    return module;
  });
}

/**
 * Memory optimization utilities
 */
export const memoryOptimization = {
  /**
   * Cleanup function for removing event listeners and subscriptions
   */
  useCleanup: (cleanupFn: () => void, deps: React.DependencyList = []) => {
    React.useEffect(() => {
      return cleanupFn;
    }, deps);
  },

  /**
   * Weak reference utility for preventing memory leaks
   */
  useWeakRef: <T extends object>(value: T): React.MutableRefObject<WeakRef<T> | null> => {
    const weakRef = React.useRef<WeakRef<T> | null>(null);

    React.useEffect(() => {
      weakRef.current = new WeakRef(value);

      return () => {
        weakRef.current = null;
      };
    }, [value]);

    return weakRef;
  },

  /**
   * Monitor memory usage
   */
  useMemoryMonitoring: (componentName: string) => {
    React.useEffect(() => {
      const checkMemory = () => {
        if ('memory' in performance) {
          const memInfo = (performance as PerformanceWithMemory).memory;

          if (memInfo) {
            performanceMonitoring.recordMetric(
              'memoryUsage',
              memInfo.usedJSHeapSize / 1024 / 1024, // Convert to MB
              'MB',
              {
                total: (memInfo.totalJSHeapSize / 1024 / 1024).toString(),
              },
            );
          }
        }
      };

      // Check memory usage on mount and unmount
      checkMemory();

      return () => {
        checkMemory();
      };
    }, [componentName]);
  },
};

/**
 * Render optimization utilities
 */
export const renderOptimization = {
  /**
   * Prevent unnecessary re-renders with shallow comparison
   */
  shallowMemo: <P extends object>(Component: React.ComponentType<P>): React.ComponentType<P> => {
    return React.memo(Component, (prevProps, nextProps) => {
      const prevKeys = Object.keys(prevProps);
      const nextKeys = Object.keys(nextProps);

      if (prevKeys.length !== nextKeys.length) {
        return false;
      }

      for (const key of prevKeys) {
        if (prevProps[key as keyof P] !== nextProps[key as keyof P]) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Deep comparison memo for complex props
   */
  deepMemo: <P extends object>(Component: React.ComponentType<P>): React.ComponentType<P> => {
    return React.memo(Component, (prevProps, nextProps) => {
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    });
  },

  /**
   * Custom comparison memo
   */
  customMemo: <P extends object>(
    Component: React.ComponentType<P>,
    areEqual: (prevProps: P, nextProps: P) => boolean,
  ): React.ComponentType<P> => {
    return React.memo(Component, areEqual);
  },
};

/**
 * Performance debugging utilities
 */
export const performanceDebug = {
  /**
   * Log render reasons for debugging
   */
  useWhyDidYouUpdate: (name: string, props: Record<string, unknown>) => {
    const previous = React.useRef<Record<string, unknown>>({});

    React.useEffect(() => {
      if (previous.current) {
        const allKeys = Object.keys({...previous.current, ...props});
        const changedProps: Record<string, {from: unknown; to: unknown}> = {};

        allKeys.forEach((key) => {
          if (previous.current[key] !== props[key]) {
            changedProps[key] = {
              from: previous.current[key],
              to: props[key],
            };
          }
        });

        if (Object.keys(changedProps).length) {
          appLogger.debug('[why-did-you-update]', name, changedProps);
        }
      }

      previous.current = props;
    });
  },

  /**
   * Measure component render time
   */
  useMeasureRender: (componentName: string) => {
    const renderCount = React.useRef(0);
    const startTime = React.useRef<number>(0);

    // Start timing
    startTime.current = performance.now();
    renderCount.current += 1;

    React.useLayoutEffect(() => {
      const renderTime = performance.now() - startTime.current;

      if (renderTime > 16) {
        // Log slow renders (>16ms for 60fps)
        appLogger.debug(
          `🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`,
        );
      }

      performanceMonitoring.recordRenderPerformance(componentName, renderTime);
    });
  },
};
