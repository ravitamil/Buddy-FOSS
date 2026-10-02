import type * as Device from 'expo-device';
import type {Manifest} from 'expo-updates';

export interface EnvironmentConfig {
  name: string;
  enableLogging: boolean;
  enableErrorReporting: boolean;
  enablePerformanceMonitoring: boolean;
  enableAnalytics: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxLogEntries: number;
  enableOTAUpdates: boolean;
  updateCheckInterval: number;
  enableCrashReporting: boolean;
  enableFeatureFlags: boolean;
  bundleOptimization: {
    enableCodeSplitting: boolean;
    enableTreeShaking: boolean;
    enableMinification: boolean;
    enableCompression: boolean;
  };
  performance: {
    enableMetrics: boolean;
    metricsInterval: number;
    enableMemoryMonitoring: boolean;
    enableFrameRateMonitoring: boolean;
  };
  security: {
    enableSSLPinning: boolean;
    enableCertificateValidation: boolean;
    enableRequestEncryption: boolean;
  };
}

export interface OTAUpdateInfo {
  isAvailable: boolean;
  manifest?: Manifest;
  isEmbeddedLaunch: boolean;
  updateId?: string;
  createdAt?: Date;
  runtimeVersion?: string;
}

export interface DeploymentStrategy {
  name: string;
  description: string;
  rolloutPercentage: number;
  enabledFeatures: string[];
  targetAudience: 'all' | 'beta' | 'internal';
  minimumAppVersion: string;
}

export interface DeviceInformation {
  brand: string | null;
  manufacturer: string | null;
  modelName: string | null;
  modelId: unknown;
  designName: string | null;
  productName: string | null;
  deviceType: Device.DeviceType | null;
  deviceYearClass: number | null;
  totalMemory: number | null;
  supportedCpuArchitectures: string[] | null;
  osName: string | null;
  osVersion: string | null;
  osBuildId: string | null;
  osInternalBuildId: string | null;
  osBuildFingerprint: string | null;
  platformApiLevel: number | null;
  isDevice: boolean;
}
