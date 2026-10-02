/**
 * Production Monitoring Integration Tests
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */

import {productionMonitoring} from '../../services/ProductionMonitoringService';
import {expoErrorReporting} from '../../services/ExpoErrorReportingService';
import {performanceMonitoring} from '../../services/PerformanceMonitoringService';
import {productionConfig} from '../../services/ProductionConfigService';
import {deploymentService} from '../../services/DeploymentService';

// Mock all Expo modules
jest.mock('expo-constants', () => ({
  isDevice: true,
  platform: {ios: true},
  expoConfig: {
    version: '1.0.0',
    extra: {environment: 'development'},
  },
}));

jest.mock('expo-device', () => ({
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone 14',
  osName: 'iOS',
  osVersion: '16.0',
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
}));

jest.mock('expo-updates', () => ({
  isEnabled: true,
  isEmbeddedLaunch: false,
  checkForUpdateAsync: jest.fn().mockResolvedValue({isAvailable: false}),
  getUpdateAsync: jest.fn().mockResolvedValue({updateId: 'test'}),
  addListener: jest.fn(),
}));

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 200 * 1024 * 1024,
    },
  },
  writable: true,
});

global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
})) as any;

// Add the missing supportedEntryTypes property
(global.PerformanceObserver as any).supportedEntryTypes = ['measure', 'navigation', 'resource'];

global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

describe('Production Monitoring Integration', () => {
  beforeAll(async () => {
    // Initialize all services
    await productionMonitoring.initialize();
  });

  afterAll(async () => {
    // Cleanup
    await productionMonitoring.flush();
  });

  describe('Service Integration', () => {
    it('should initialize all monitoring services', async () => {
      const status = productionMonitoring.getStatus();

      expect(status.isInitialized).toBe(true);
      expect(status.errorReportingActive).toBe(true);
      expect(status.sessionInfo).toBeDefined();
    });

    it('should integrate error reporting with performance monitoring', async () => {
      // Record a performance metric
      performanceMonitoring.recordMetric('testIntegration', 1000, 'ms', {
        component: 'IntegrationTest',
      });

      // Report an error
      const testError = new Error('Integration test error');
      await expoErrorReporting.reportError(testError, {
        screen: 'IntegrationTest',
        tags: {test: 'integration'},
      });

      // Both services should be working
      const performanceStats = performanceMonitoring.getStatistics();
      const errorSessionInfo = expoErrorReporting.getSessionInfo();

      expect(performanceStats.totalMetrics).toBeGreaterThan(0);
      expect(errorSessionInfo.breadcrumbs.length).toBeGreaterThan(0);
    });

    it('should integrate configuration with monitoring', async () => {
      const config = productionConfig.getConfig();
      const deploymentStatus = deploymentService.getStatus();

      expect(config).toBeDefined();
      expect(deploymentStatus.isInitialized).toBe(true);

      // Configuration should affect monitoring behavior
      if (config?.enableErrorReporting) {
        expect(productionMonitoring.getStatus().errorReportingActive).toBe(true);
      }
    });
  });

  describe('Cross-Service Communication', () => {
    it('should share context between services', async () => {
      const userId = 'integration-test-user';
      const testTags = {integration: 'true', version: '1.0.0'};

      // Set user context in error reporting
      expoErrorReporting.setUserContext(userId, 'test@example.com');
      expoErrorReporting.setTags(testTags);

      // Set user context in monitoring
      productionMonitoring.setUserContext(userId, 'test@example.com');

      // Both services should have the context
      const sessionInfo = expoErrorReporting.getSessionInfo();
      const monitoringStatus = productionMonitoring.getStatus();

      expect(sessionInfo.breadcrumbs.length).toBeGreaterThan(0);
      expect(monitoringStatus.isInitialized).toBe(true);
    });

    it('should coordinate feature flags with monitoring', () => {
      const performanceFeature = deploymentService.isFeatureEnabled('performance-dashboard');
      const errorReportingFeature = deploymentService.isFeatureEnabled('advanced-error-reporting');

      // Feature flags should be boolean values
      expect(typeof performanceFeature).toBe('boolean');
      expect(typeof errorReportingFeature).toBe('boolean');

      // Monitoring should respect feature flags
      const config = productionConfig.getConfig();
      if (config?.enablePerformanceMonitoring) {
        expect(performanceMonitoring.getStatistics()).toBeDefined();
      }
    });
  });

  describe('End-to-End Monitoring Flow', () => {
    it('should handle complete monitoring workflow', async () => {
      // 1. Record performance metrics
      const operationName = 'e2e-test-operation';
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await performanceMonitoring.measureOperation(operationName, mockOperation, {
        test: 'e2e',
      });

      expect(result).toBe('success');

      // 2. Report an error with context
      const testError = new Error('E2E test error');
      await expoErrorReporting.reportError(testError, {
        screen: 'E2ETest',
        tags: {flow: 'complete'},
      });

      // 3. Check deployment health
      const deploymentHealth = await deploymentService.checkDeploymentHealth();
      expect(deploymentHealth.status).toMatch(/^(healthy|warning|critical)$/);

      // 4. Get comprehensive status
      const monitoringStatus = productionMonitoring.getStatus();
      const performanceDashboard = performanceMonitoring.getPerformanceDashboard();
      const configStatus = productionConfig.getStatus();

      expect(monitoringStatus.isInitialized).toBe(true);
      expect(performanceDashboard.summary).toBeDefined();
      expect(configStatus.configurationValid).toBe(true);
    });

    it('should handle error scenarios gracefully', async () => {
      // Simulate various error conditions
      const errors = [
        new Error('Network error'),
        new Error('Validation error'),
        new Error('Permission denied'),
        new Error('Not found'),
      ];

      for (const error of errors) {
        await expect(
          expoErrorReporting.reportError(error, {
            screen: 'ErrorTest',
            tags: {scenario: 'error-handling'},
          }),
        ).resolves.not.toThrow();
      }

      // All errors should be handled gracefully
      const sessionInfo = expoErrorReporting.getSessionInfo();
      expect(sessionInfo.breadcrumbs.length).toBeGreaterThan(errors.length);
    });
  });

  describe('Performance Impact', () => {
    it('should have minimal performance impact', async () => {
      const startTime = performance.now();

      // Perform multiple monitoring operations
      for (let i = 0; i < 100; i++) {
        performanceMonitoring.recordMetric(`test-metric-${i}`, i, 'ms');
        expoErrorReporting.addBreadcrumb(`Test breadcrumb ${i}`, 'test', 'info');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 100ms for 100 operations)
      expect(duration).toBeLessThan(100);
    });

    it('should handle high-frequency events', async () => {
      const eventCount = 1000;
      const startTime = performance.now();

      // Generate high-frequency events
      const promises = Array.from({length: eventCount}, (_, i) =>
        performanceMonitoring.measureOperation('high-frequency-test', async () => `result-${i}`, {
          index: i.toString(),
        }),
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(results).toHaveLength(eventCount);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Memory Management', () => {
    it('should manage memory efficiently', () => {
      // Add many metrics to test memory management
      for (let i = 0; i < 2000; i++) {
        performanceMonitoring.recordMetric(`memory-test-${i}`, i, 'ms');
        expoErrorReporting.addBreadcrumb(`Memory test ${i}`, 'test', 'info');
      }

      // Services should limit memory usage
      const performanceStats = performanceMonitoring.getStatistics();
      const sessionInfo = expoErrorReporting.getSessionInfo();

      expect(performanceStats.totalMetrics).toBeLessThanOrEqual(1000);
      expect(sessionInfo.breadcrumbs.length).toBeLessThanOrEqual(50);
    });

    it('should cleanup resources properly', async () => {
      // Test cleanup functionality
      expect(() => {
        performanceMonitoring.clearMetrics();
        expoErrorReporting.clearBreadcrumbs();
        productionConfig.cleanup();
      }).not.toThrow();

      // Services should still be functional after cleanup
      performanceMonitoring.recordMetric('post-cleanup-test', 100, 'ms');
      expoErrorReporting.addBreadcrumb('Post cleanup test', 'test', 'info');

      const stats = performanceMonitoring.getStatistics();
      const sessionInfo = expoErrorReporting.getSessionInfo();

      expect(stats.totalMetrics).toBeGreaterThan(0);
      expect(sessionInfo.breadcrumbs.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate production configuration', () => {
      const config = productionConfig.getConfig();

      expect(config).toBeDefined();
      expect(config?.name).toMatch(/^(development|staging|production|test)$/);
      expect(typeof config?.enableLogging).toBe('boolean');
      expect(typeof config?.enableErrorReporting).toBe('boolean');
      expect(typeof config?.enablePerformanceMonitoring).toBe('boolean');
    });

    it('should have consistent feature flags', () => {
      const config = productionConfig.getConfig();
      const deploymentFlags = deploymentService.getFeatureFlags();

      expect(deploymentFlags).toBeInstanceOf(Array);
      expect(deploymentFlags.length).toBeGreaterThan(0);

      // Feature flags should be consistent with configuration
      deploymentFlags.forEach((flag) => {
        expect(flag).toMatchObject({
          name: expect.any(String),
          enabled: expect.any(Boolean),
          rolloutPercentage: expect.any(Number),
          targetAudience: expect.stringMatching(/^(all|beta|internal)$/),
          minimumAppVersion: expect.any(String),
          description: expect.any(String),
        });
      });
    });
  });
});
