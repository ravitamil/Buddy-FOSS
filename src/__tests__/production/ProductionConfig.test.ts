/**
 * Production Configuration Service Tests
 */

import {productionConfig} from '../../services/ProductionConfigService';
import type {EnvironmentConfig} from '../../services/ProductionConfigService';
import * as Updates from 'expo-updates';

const anyString: unknown = expect.any(String);
const anyBoolean: unknown = expect.any(Boolean);
const anyNumber: unknown = expect.any(Number);
const anyArray: unknown = expect.any(Array);
const logLevelMatcher: unknown = expect.stringMatching(/^(debug|info|warn|error)$/);
const targetAudienceMatcher: unknown = expect.stringMatching(/^(all|beta|internal)$/);

type ExpoUpdatesMock = typeof Updates & {
  checkForUpdateAsync: jest.MockedFunction<typeof Updates.checkForUpdateAsync>;
};

const mockedUpdates = Updates as ExpoUpdatesMock;
const getConfigValue = productionConfig.get.bind(productionConfig) as (
  key: string,
) => EnvironmentConfig[keyof EnvironmentConfig] | null;

type ProductionConfigInstance = typeof productionConfig;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isProductionConfigInstance = (value: unknown): value is ProductionConfigInstance =>
  isRecord(value) &&
  typeof value.initialize === 'function' &&
  typeof value.cleanup === 'function' &&
  typeof value.getConfig === 'function' &&
  typeof value.isFeatureEnabled === 'function';

const getIsolatedProductionConfig = (): ProductionConfigInstance => {
  let isolatedService: ProductionConfigInstance | undefined;

  jest.isolateModules(() => {
    const moduleValue: unknown = jest.requireActual('../../services/ProductionConfigService');

    if (isRecord(moduleValue) && isProductionConfigInstance(moduleValue.default)) {
      isolatedService = moduleValue.default;
    }
  });

  if (!isolatedService) {
    throw new Error('ProductionConfigService module did not load');
  }

  return isolatedService;
};

// Mock Expo modules
jest.mock('expo-constants', () => ({
  isDevice: true,
  expoConfig: {
    version: '1.0.0',
    extra: {
      environment: 'development',
    },
  },
}));

jest.mock('expo-updates', () => ({
  isEnabled: true,
  isEmbeddedLaunch: false,
  updateId: 'test-update-id',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  runtimeVersion: '1.0.0',
  checkForUpdateAsync: jest.fn().mockResolvedValue({
    isAvailable: false,
    manifest: null,
  }),
  getUpdateAsync: jest.fn().mockResolvedValue({
    updateId: 'test-update-id',
    createdAt: new Date().toISOString(),
    runtimeVersion: '1.0.0',
  }),
  fetchUpdateAsync: jest.fn().mockResolvedValue({
    isNew: true,
  }),
  reloadAsync: jest.fn().mockResolvedValue(undefined),
  addListener: jest.fn(),
}));

jest.mock('expo-device', () => ({
  brand: 'TestBrand',
  manufacturer: 'TestManufacturer',
  modelName: 'TestModel',
  modelId: 'test-model-id',
  designName: 'test-design',
  productName: 'test-product',
  deviceType: 1,
  deviceYearClass: 2026,
  totalMemory: 4096,
  supportedCpuArchitectures: ['arm64'],
  osName: 'Android',
  osVersion: '16',
  osBuildId: 'test-build',
  osInternalBuildId: 'test-internal-build',
  osBuildFingerprint: 'test-fingerprint',
  platformApiLevel: 36,
  isDevice: true,
}));

describe('ProductionConfigService', () => {
  beforeEach(async () => {
    // Initialize the service before each test
    await productionConfig.initialize();
  });

  afterEach(() => {
    // Cleanup after each test
    productionConfig.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      const status = productionConfig.getStatus();

      expect(status.isInitialized).toBe(true);
      expect(status.environment).toBeDefined();
      expect(status.configurationValid).toBe(true);
    });

    it('should not initialize twice', async () => {
      // Service is already initialized in beforeEach
      await productionConfig.initialize();

      const status = productionConfig.getStatus();
      expect(status.isInitialized).toBe(true);
    });

    it('should determine environment correctly', () => {
      const config = productionConfig.getConfig();

      expect(config).toBeDefined();
      expect(config?.name).toBeDefined();
      expect(['development', 'staging', 'production', 'test']).toContain(config?.name);
    });
  });

  describe('Configuration Access', () => {
    it('should provide configuration values', () => {
      const config = productionConfig.getConfig();

      expect(config).toMatchObject({
        name: anyString,
        enableLogging: anyBoolean,
        enableErrorReporting: anyBoolean,
        enablePerformanceMonitoring: anyBoolean,
        logLevel: logLevelMatcher,
        enableOTAUpdates: anyBoolean,
      });
    });

    it('should get specific configuration values', () => {
      const maxLogEntries = productionConfig.get('maxLogEntries');
      const enableLogging = productionConfig.get('enableLogging');
      const logLevel = productionConfig.get('logLevel');

      expect(typeof maxLogEntries).toBe('number');
      expect(typeof enableLogging).toBe('boolean');
      expect(['debug', 'info', 'warn', 'error']).toContain(logLevel);
    });

    it('should return no value for invalid keys', () => {
      const invalidValue = getConfigValue('invalidKey');
      expect(invalidValue).toBeUndefined();
    });
  });

  describe('Feature Flags', () => {
    it('should check if features are enabled', () => {
      const loggingEnabled = productionConfig.isFeatureEnabled('logging');
      const errorReportingEnabled = productionConfig.isFeatureEnabled('errorReporting');
      const performanceMonitoringEnabled =
        productionConfig.isFeatureEnabled('performanceMonitoring');

      expect(typeof loggingEnabled).toBe('boolean');
      expect(typeof errorReportingEnabled).toBe('boolean');
      expect(typeof performanceMonitoringEnabled).toBe('boolean');
    });

    it('should return false for unknown features', () => {
      const unknownFeature = productionConfig.isFeatureEnabled('unknownFeature');
      expect(unknownFeature).toBe(false);
    });
  });

  describe('OTA Updates', () => {
    it('should get OTA update information', async () => {
      const updateInfo = await productionConfig.getOTAUpdateInfo();

      expect(updateInfo).toMatchObject({
        isAvailable: anyBoolean,
        isEmbeddedLaunch: anyBoolean,
      });

      if (updateInfo.isAvailable) {
        expect(updateInfo.updateId).toBeDefined();
        expect(updateInfo.createdAt).toBeInstanceOf(Date);
      }
    });

    it('should handle OTA update application', async () => {
      const result = await productionConfig.applyOTAUpdate();

      // Result depends on whether updates are available and enabled
      expect(typeof result).toBe('boolean');
    });

    it('should handle OTA update errors gracefully', async () => {
      // Mock an error in the update process
      mockedUpdates.checkForUpdateAsync.mockRejectedValueOnce(new Error('Update check failed'));

      const updateInfo = await productionConfig.getOTAUpdateInfo();

      expect(updateInfo).toMatchObject({
        isAvailable: false,
        isEmbeddedLaunch: true,
      });
    });
  });

  describe('Deployment Strategy', () => {
    it('should provide deployment strategy', () => {
      const strategy = productionConfig.getDeploymentStrategy();

      expect(strategy).toMatchObject({
        name: anyString,
        description: anyString,
        rolloutPercentage: anyNumber,
        enabledFeatures: anyArray,
        targetAudience: targetAudienceMatcher,
        minimumAppVersion: anyString,
      });

      expect(strategy.rolloutPercentage).toBeGreaterThanOrEqual(0);
      expect(strategy.rolloutPercentage).toBeLessThanOrEqual(100);
    });

    it('should have appropriate strategy for environment', () => {
      const config = productionConfig.getConfig();
      const strategy = productionConfig.getDeploymentStrategy();

      if (config?.name === 'development') {
        expect(strategy.rolloutPercentage).toBe(100);
        expect(strategy.targetAudience).toBe('internal');
      } else if (config?.name === 'production') {
        expect(strategy.targetAudience).toBe('all');
      }
    });
  });

  describe('Status Monitoring', () => {
    it('should provide status information', () => {
      const status = productionConfig.getStatus();

      expect(status).toMatchObject({
        isInitialized: anyBoolean,
        environment: anyString,
        otaEnabled: anyBoolean,
        configurationValid: anyBoolean,
      });
    });

    it('should track initialization state', () => {
      const status = productionConfig.getStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Create a new instance to test initialization errors
      const newService = productionConfig; // Use singleton instance

      // Mock a failure in OTA initialization
      mockedUpdates.checkForUpdateAsync.mockRejectedValueOnce(new Error('OTA init failed'));

      // Should not throw even if OTA initialization fails
      await expect(newService.initialize()).resolves.not.toThrow();
    });

    it('should handle missing configuration gracefully', () => {
      // Test with uninitialized service
      const newService = getIsolatedProductionConfig();

      const config = newService.getConfig();
      expect(config).toBeNull();

      const feature = newService.isFeatureEnabled('logging');
      expect(feature).toBe(false);
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should have different configurations for different environments', () => {
      const config = productionConfig.getConfig();

      if (config?.name === 'development') {
        expect(config.enableLogging).toBe(true);
        expect(config.logLevel).toBe('debug');
        expect(config.enableOTAUpdates).toBe(false);
      } else if (config?.name === 'production') {
        expect(config.enableLogging).toBe(false);
        expect(config.logLevel).toBe('error');
        expect(config.enableOTAUpdates).toBe(true);
      }
    });

    it('should have appropriate security settings', () => {
      const config = productionConfig.getConfig();

      if (config?.name === 'production') {
        expect(config.security?.enableSSLPinning).toBe(true);
        expect(config.security?.enableCertificateValidation).toBe(true);
      } else if (config?.name === 'development') {
        expect(config.security?.enableSSLPinning).toBe(false);
      }
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', () => {
      expect(() => {
        productionConfig.cleanup();
      }).not.toThrow();
    });
  });
});
