import React from 'react';

/**
 * Creates a memoized context value with proper dependency tracking.
 *
 * This function calls React.useMemo internally. Use it only at the top level of
 * React components or custom hooks.
 */
export const createMemoizedContextValue = <T>(
  factory: () => T,
  dependencies: React.DependencyList,
): T => {
  return React.useMemo(factory, dependencies);
};

/**
 * Creates a stable callback with proper dependency tracking.
 */
export const createStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList,
): T => {
  return React.useCallback(callback, dependencies);
};

/**
 * Creates a deep comparison memoized value.
 */
export const createDeepMemoizedValue = <T>(
  factory: () => T,
  dependencies: React.DependencyList,
): T => {
  const previousDeps = React.useRef<React.DependencyList | undefined>(undefined);
  const previousValue = React.useRef<T | undefined>(undefined);

  const depsChanged =
    !previousDeps.current ||
    dependencies.length !== previousDeps.current.length ||
    dependencies.some((dep, index) => {
      const prevDep = previousDeps.current?.[index];
      return !Object.is(dep, prevDep);
    });

  if (depsChanged) {
    previousValue.current = factory();
    previousDeps.current = dependencies;
  }

  return previousValue.current as T;
};
