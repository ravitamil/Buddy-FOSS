import type {PerformanceMemoryInfo} from './types';

export const isPerformanceMemoryInfo = (value: unknown): value is PerformanceMemoryInfo =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as PerformanceMemoryInfo).usedJSHeapSize === 'number' &&
  typeof (value as PerformanceMemoryInfo).totalJSHeapSize === 'number' &&
  typeof (value as PerformanceMemoryInfo).jsHeapSizeLimit === 'number';
