import type {DeploymentStrategy, EnvironmentConfig} from './types';

export const environmentConfigs: Record<string, EnvironmentConfig> = {
  development: {
    name: 'development',
    enableLogging: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableAnalytics: false,
    logLevel: 'debug',
    maxLogEntries: 1000,
    enableOTAUpdates: false,
    updateCheckInterval: 0,
    enableCrashReporting: false,
    enableFeatureFlags: true,
    bundleOptimization: {
      enableCodeSplitting: false,
      enableTreeShaking: false,
      enableMinification: false,
      enableCompression: false,
    },
    performance: {
      enableMetrics: true,
      metricsInterval: 10000,
      enableMemoryMonitoring: true,
      enableFrameRateMonitoring: false,
    },
    security: {
      enableSSLPinning: false,
      enableCertificateValidation: false,
      enableRequestEncryption: false,
    },
  },
  staging: {
    name: 'staging',
    enableLogging: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableAnalytics: true,
    logLevel: 'info',
    maxLogEntries: 500,
    enableOTAUpdates: true,
    updateCheckInterval: 300000,
    enableCrashReporting: true,
    enableFeatureFlags: true,
    bundleOptimization: {
      enableCodeSplitting: true,
      enableTreeShaking: true,
      enableMinification: true,
      enableCompression: true,
    },
    performance: {
      enableMetrics: true,
      metricsInterval: 30000,
      enableMemoryMonitoring: true,
      enableFrameRateMonitoring: false,
    },
    security: {
      enableSSLPinning: true,
      enableCertificateValidation: true,
      enableRequestEncryption: true,
    },
  },
  production: {
    name: 'production',
    enableLogging: false,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableAnalytics: true,
    logLevel: 'error',
    maxLogEntries: 100,
    enableOTAUpdates: true,
    updateCheckInterval: 3600000,
    enableCrashReporting: true,
    enableFeatureFlags: false,
    bundleOptimization: {
      enableCodeSplitting: true,
      enableTreeShaking: true,
      enableMinification: true,
      enableCompression: true,
    },
    performance: {
      enableMetrics: true,
      metricsInterval: 60000,
      enableMemoryMonitoring: false,
      enableFrameRateMonitoring: false,
    },
    security: {
      enableSSLPinning: true,
      enableCertificateValidation: true,
      enableRequestEncryption: true,
    },
  },
};

const deploymentStrategies: Record<string, DeploymentStrategy> = {
  development: {
    name: 'Development',
    description: 'Full feature access for development',
    rolloutPercentage: 100,
    enabledFeatures: ['all'],
    targetAudience: 'internal',
    minimumAppVersion: '1.0.0',
  },
  staging: {
    name: 'Staging',
    description: 'Beta testing with selected features',
    rolloutPercentage: 50,
    enabledFeatures: ['core', 'beta'],
    targetAudience: 'beta',
    minimumAppVersion: '1.0.0',
  },
  production: {
    name: 'Production',
    description: 'Stable release for all users',
    rolloutPercentage: 100,
    enabledFeatures: ['core'],
    targetAudience: 'all',
    minimumAppVersion: '1.0.0',
  },
};

export const getDeploymentStrategyForEnvironment = (environment: string): DeploymentStrategy =>
  deploymentStrategies[environment] || deploymentStrategies.development;
