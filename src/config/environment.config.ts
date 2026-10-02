/**
 * Environment Configuration
 *
 * Centralized environment-based configuration management.
 */

import Constants from 'expo-constants';

export interface AppEnvironment {
  name: 'development' | 'staging' | 'production';
  displayName: string;
  enableDebugMode: boolean;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableErrorReporting: boolean;
  enableAnalytics: boolean;
  enablePerformanceMonitoring: boolean;
  enableFeatureFlags: boolean;
  enableOTAUpdates: boolean;
  updateCheckInterval: number;
  maxRetries: number;
  requestTimeout: number;
  enableSSL: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
}

// Environment configurations
const environments: Record<string, AppEnvironment> = {
  development: {
    name: 'development',
    displayName: 'Development',
    enableDebugMode: true,
    enableLogging: true,
    logLevel: 'debug',
    enableErrorReporting: true,
    enableAnalytics: false,
    enablePerformanceMonitoring: true,
    enableFeatureFlags: true,
    enableOTAUpdates: false,
    updateCheckInterval: 0,
    maxRetries: 3,
    requestTimeout: 10000,
    enableSSL: false,
    enableCaching: false,
    cacheTimeout: 300000, // 5 minutes
  },
  staging: {
    name: 'staging',
    displayName: 'Staging',
    enableDebugMode: false,
    enableLogging: true,
    logLevel: 'info',
    enableErrorReporting: true,
    enableAnalytics: true,
    enablePerformanceMonitoring: true,
    enableFeatureFlags: true,
    enableOTAUpdates: true,
    updateCheckInterval: 300000, // 5 minutes
    maxRetries: 3,
    requestTimeout: 15000,
    enableSSL: true,
    enableCaching: true,
    cacheTimeout: 600000, // 10 minutes
  },
  production: {
    name: 'production',
    displayName: 'Production',
    enableDebugMode: false,
    enableLogging: false,
    logLevel: 'error',
    enableErrorReporting: true,
    enableAnalytics: true,
    enablePerformanceMonitoring: true,
    enableFeatureFlags: false,
    enableOTAUpdates: true,
    updateCheckInterval: 3600000, // 1 hour
    maxRetries: 5,
    requestTimeout: 20000,
    enableSSL: true,
    enableCaching: true,
    cacheTimeout: 1800000, // 30 minutes
  },
};

function getExpoExtraValue(key: string): unknown {
  const extra: unknown = Constants.expoConfig?.extra;
  if (typeof extra !== 'object' || extra === null) {
    return undefined;
  }

  return (extra as Record<string, unknown>)[key];
}

/**
 * Determine current environment
 */
function determineEnvironment(): string {
  // Check for explicit environment in Expo config
  const explicitEnv = getExpoExtraValue('environment');
  if (typeof explicitEnv === 'string' && environments[explicitEnv]) {
    return explicitEnv;
  }

  // Check for staging flag
  if (getExpoExtraValue('staging') === true) {
    return 'staging';
  }

  // Determine based on development mode
  if (__DEV__) {
    return 'development';
  }

  // Default to production for release builds
  return 'production';
}

// Get current environment configuration
const currentEnvironmentName = determineEnvironment();
export const currentEnvironment = environments[currentEnvironmentName];

// Export environment utilities
export const ENV = {
  ...currentEnvironment,

  // Utility methods
  isDevelopment: () => currentEnvironment.name === 'development',
  isStaging: () => currentEnvironment.name === 'staging',
  isProduction: () => currentEnvironment.name === 'production',

  // Feature flags
  isFeatureEnabled: (feature: string): boolean => {
    switch (feature) {
      case 'debugMode':
        return currentEnvironment.enableDebugMode;
      case 'logging':
        return currentEnvironment.enableLogging;
      case 'errorReporting':
        return currentEnvironment.enableErrorReporting;
      case 'analytics':
        return currentEnvironment.enableAnalytics;
      case 'performanceMonitoring':
        return currentEnvironment.enablePerformanceMonitoring;
      case 'featureFlags':
        return currentEnvironment.enableFeatureFlags;
      case 'otaUpdates':
        return currentEnvironment.enableOTAUpdates;
      case 'ssl':
        return currentEnvironment.enableSSL;
      case 'caching':
        return currentEnvironment.enableCaching;
      default:
        return false;
    }
  },

  getRequestConfig: () => ({
    timeout: currentEnvironment.requestTimeout,
    maxRetries: currentEnvironment.maxRetries,
    enableSSL: currentEnvironment.enableSSL,
  }),

  getCacheConfig: () => ({
    enabled: currentEnvironment.enableCaching,
    timeout: currentEnvironment.cacheTimeout,
  }),

  getLoggingConfig: () => ({
    enabled: currentEnvironment.enableLogging,
    level: currentEnvironment.logLevel,
  }),

  getUpdateConfig: () => ({
    enabled: currentEnvironment.enableOTAUpdates,
    checkInterval: currentEnvironment.updateCheckInterval,
  }),
};

// Export all environments for testing/debugging
export const allEnvironments = environments;

// Export current environment name
export const environmentName = currentEnvironmentName;

export default ENV;
