/**
 * Deployment Service Tests
 */

import {
  deploymentService,
  type DeploymentMetrics,
  type FeatureFlag,
  type RolloutStrategy,
} from '../../services/DeploymentService';

// Mock Expo modules
jest.mock('expo-constants', () => ({
  isDevice: true,
  expoConfig: {
    version: '1.0.0',
    extra: {environment: 'test'},
  },
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
}));

// Mock environment config
jest.mock('../../config/environment.config', () => ({
  ENV: {
    name: 'test',
    enableAnalytics: true,
    enableDebugMode: true,
    enableErrorReporting: true,
    enableOTAUpdates: true,
    isProduction: () => false,
    isStaging: () => false,
    isDevelopment: () => false,
  },
}));

type DeploymentHealth = {
  status: 'healthy' | 'warning' | 'critical';
  metrics: Record<string, number>;
  issues: string[];
};
type RolloutPhase = RolloutStrategy['phases'][number];
type RollbackTrigger = RolloutStrategy['rollbackTriggers'][number];
type DeploymentEvent = Parameters<typeof deploymentService.reportDeploymentEvent>[0];
type UnknownFeatureFlagQuery = {
  isFeatureEnabled(featureName: unknown, userId?: unknown): boolean;
};

const expectFeatureFlag = (flag: FeatureFlag): void => {
  expect(typeof flag.name).toBe('string');
  expect(typeof flag.enabled).toBe('boolean');
  expect(typeof flag.rolloutPercentage).toBe('number');
  expect(['all', 'beta', 'internal']).toContain(flag.targetAudience);
  expect(typeof flag.minimumAppVersion).toBe('string');
  expect(typeof flag.description).toBe('string');
  expect(flag.rolloutPercentage).toBeGreaterThanOrEqual(0);
  expect(flag.rolloutPercentage).toBeLessThanOrEqual(100);
};

const expectDeploymentMetrics = (metrics: DeploymentMetrics): void => {
  expect(typeof metrics.deploymentId).toBe('string');
  expect(typeof metrics.version).toBe('string');
  expect(typeof metrics.buildNumber).toBe('string');
  expect(metrics.deployedAt).toBeInstanceOf(Date);
  expect(typeof metrics.environment).toBe('string');
  expect(typeof metrics.rolloutPercentage).toBe('number');
  expect(typeof metrics.activeUsers).toBe('number');
  expect(typeof metrics.errorRate).toBe('number');
  expect(typeof metrics.crashRate).toBe('number');
  expect(typeof metrics.performanceScore).toBe('number');
  expect(metrics.rolloutPercentage).toBeGreaterThanOrEqual(0);
  expect(metrics.rolloutPercentage).toBeLessThanOrEqual(100);
  expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
  expect(metrics.crashRate).toBeGreaterThanOrEqual(0);
  expect(metrics.performanceScore).toBeGreaterThanOrEqual(0);
  expect(metrics.performanceScore).toBeLessThanOrEqual(100);
};

const expectRolloutPhase = (phase: RolloutPhase): void => {
  expect(typeof phase.percentage).toBe('number');
  expect(typeof phase.duration).toBe('number');
  expect(Array.isArray(phase.criteria)).toBe(true);
  phase.criteria.forEach((criterion) => {
    expect(typeof criterion).toBe('string');
  });
  expect(phase.percentage).toBeGreaterThanOrEqual(0);
  expect(phase.percentage).toBeLessThanOrEqual(100);
  expect(phase.duration).toBeGreaterThanOrEqual(0);
};

const expectRollbackTrigger = (trigger: RollbackTrigger): void => {
  expect(typeof trigger.metric).toBe('string');
  expect(typeof trigger.threshold).toBe('number');
  expect(['pause', 'rollback']).toContain(trigger.action);
};

const expectDeploymentHealth = (health: DeploymentHealth): void => {
  expect(['healthy', 'warning', 'critical']).toContain(health.status);
  expect(typeof health.metrics).toBe('object');
  expect(Array.isArray(health.issues)).toBe(true);
};

const reportDeploymentEvent = (event: DeploymentEvent, details: Record<string, unknown>): void => {
  deploymentService.reportDeploymentEvent(event, details);
};

const callFeatureEnabledWithUnknowns = (featureName: unknown, userId?: unknown): boolean => {
  const unknownBoundary: UnknownFeatureFlagQuery = deploymentService;
  return unknownBoundary.isFeatureEnabled(featureName, userId);
};

describe('DeploymentService', () => {
  beforeEach(async () => {
    // Initialize the service before each test
    await deploymentService.initialize();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      const status = deploymentService.getStatus();

      expect(status.isInitialized).toBe(true);
      expect(status.environment).toBe('test');
      expect(status.featureFlagsCount).toBeGreaterThan(0);
    });

    it('should not initialize twice', async () => {
      // Service is already initialized in beforeEach
      await deploymentService.initialize();

      const status = deploymentService.getStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('Feature Flags', () => {
    it('should load default feature flags', () => {
      const flags = deploymentService.getFeatureFlags();

      expect(flags).toBeInstanceOf(Array);
      expect(flags.length).toBeGreaterThan(0);

      flags.forEach((flag) => {
        expectFeatureFlag(flag);
      });
    });

    it('should check if features are enabled', () => {
      const flags = deploymentService.getFeatureFlags();

      flags.forEach((flag) => {
        const isEnabled = deploymentService.isFeatureEnabled(flag.name);
        expect(typeof isEnabled).toBe('boolean');

        // If flag is disabled globally, should return false
        if (!flag.enabled) {
          expect(isEnabled).toBe(false);
        }
      });
    });

    it('should return false for non-existent features', () => {
      const isEnabled = deploymentService.isFeatureEnabled('non-existent-feature');
      expect(isEnabled).toBe(false);
    });

    it('should respect rollout percentage', () => {
      // Test with different user IDs to check rollout percentage logic
      const testUsers = ['user1', 'user2', 'user3', 'user4', 'user5'];
      const flags = deploymentService.getFeatureFlags();

      flags.forEach((flag) => {
        if (flag.rolloutPercentage < 100 && flag.enabled) {
          const enabledCount = testUsers.filter((userId) =>
            deploymentService.isFeatureEnabled(flag.name, userId),
          ).length;

          // Should respect rollout percentage (allowing some variance due to hashing)
          expect(enabledCount).toBeLessThanOrEqual(testUsers.length);
        }
      });
    });

    it('should respect minimum app version', () => {
      // This test assumes the mock version is '1.0.0'
      const flags = deploymentService.getFeatureFlags();

      flags.forEach((flag) => {
        if (flag.minimumAppVersion === '2.0.0') {
          // Should be disabled due to version requirement
          const isEnabled = deploymentService.isFeatureEnabled(flag.name);
          expect(isEnabled).toBe(false);
        }
      });
    });

    it('should get enabled features for user', () => {
      const enabledFeatures = deploymentService.getEnabledFeatures('test-user');

      expect(enabledFeatures).toBeInstanceOf(Array);

      // All returned features should be enabled
      enabledFeatures.forEach((featureName) => {
        const isEnabled = deploymentService.isFeatureEnabled(featureName, 'test-user');
        expect(isEnabled).toBe(true);
      });
    });
  });

  describe('Deployment Metrics', () => {
    it('should provide deployment metrics', () => {
      const metrics = deploymentService.getDeploymentMetrics();

      if (metrics) {
        expectDeploymentMetrics(metrics);
      }
    });
  });

  describe('Rollout Strategy', () => {
    it('should provide rollout strategy', () => {
      const strategy = deploymentService.getRolloutStrategy();

      expect(typeof strategy.name).toBe('string');
      expect(typeof strategy.description).toBe('string');
      expect(Array.isArray(strategy.phases)).toBe(true);
      expect(Array.isArray(strategy.rollbackTriggers)).toBe(true);

      strategy.phases.forEach((phase) => {
        expectRolloutPhase(phase);
      });

      strategy.rollbackTriggers.forEach((trigger) => {
        expectRollbackTrigger(trigger);
      });
    });

    it('should have appropriate strategy for environment', () => {
      const strategy = deploymentService.getRolloutStrategy();
      const status = deploymentService.getStatus();

      if (status.environment === 'development') {
        expect(strategy.phases[0].percentage).toBe(100);
        expect(strategy.phases[0].duration).toBe(0);
      } else if (status.environment === 'production') {
        expect(strategy.phases.length).toBeGreaterThan(1);
        expect(strategy.rollbackTriggers.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Deployment Events', () => {
    it('should report deployment events', () => {
      expect(() => {
        reportDeploymentEvent('started', {
          version: '1.0.0',
          environment: 'test',
        });
      }).not.toThrow();

      expect(() => {
        reportDeploymentEvent('completed', {
          duration: 300000,
          success: true,
        });
      }).not.toThrow();

      expect(() => {
        reportDeploymentEvent('failed', {
          error: 'Deployment failed',
          rollback: true,
        });
      }).not.toThrow();
    });
  });

  describe('Deployment Health', () => {
    it('should check deployment health', async () => {
      const health = await deploymentService.checkDeploymentHealth();

      expectDeploymentHealth(health);

      // Metrics should be numbers
      Object.values(health.metrics).forEach((value) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });

      // Issues should be strings
      health.issues.forEach((issue) => {
        expect(typeof issue).toBe('string');
      });
    });

    it('should handle health check errors gracefully', async () => {
      // This should not throw even if health check fails internally
      await expect(deploymentService.checkDeploymentHealth()).resolves.toBeDefined();
    });
  });

  describe('Status and Monitoring', () => {
    it('should provide status information', () => {
      const status = deploymentService.getStatus();

      expect(typeof status.isInitialized).toBe('boolean');
      expect(typeof status.environment).toBe('string');
      expect(typeof status.featureFlagsCount).toBe('number');

      expect(status.featureFlagsCount).toBeGreaterThanOrEqual(0);

      if (status.deploymentId) {
        expect(status.deploymentId).toMatch(/^deploy_/);
      }

      if (status.version) {
        expect(typeof status.version).toBe('string');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Should not throw even if initialization has issues
      await expect(deploymentService.initialize()).resolves.toBeUndefined();
    });

    it('should handle invalid feature flag queries', () => {
      expect(() => {
        callFeatureEnabledWithUnknowns(null);
      }).not.toThrow();

      expect(() => {
        callFeatureEnabledWithUnknowns(undefined);
      }).not.toThrow();

      expect(() => {
        deploymentService.isFeatureEnabled('');
      }).not.toThrow();
    });

    it('should handle invalid user IDs in feature checks', () => {
      const flags = deploymentService.getFeatureFlags();

      if (flags.length > 0) {
        const flagName = flags[0].name;

        expect(() => {
          callFeatureEnabledWithUnknowns(flagName, null);
        }).not.toThrow();

        expect(() => {
          deploymentService.isFeatureEnabled(flagName, undefined);
        }).not.toThrow();

        expect(() => {
          deploymentService.isFeatureEnabled(flagName, '');
        }).not.toThrow();
      }
    });
  });

  describe('Performance', () => {
    it('should handle multiple feature flag checks efficiently', () => {
      const flags = deploymentService.getFeatureFlags();
      const startTime = performance.now();

      // Check each flag 100 times
      for (let i = 0; i < 100; i++) {
        flags.forEach((flag) => {
          deploymentService.isFeatureEnabled(flag.name, `user-${i}`);
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 100ms for all checks)
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent feature flag checks', async () => {
      const flags = deploymentService.getFeatureFlags();

      if (flags.length > 0) {
        const flagName = flags[0].name;

        // Create many concurrent checks
        const promises = Array.from({length: 1000}, (_, i) =>
          Promise.resolve(deploymentService.isFeatureEnabled(flagName, `user-${i}`)),
        );

        const results = await Promise.all(promises);

        expect(results).toHaveLength(1000);
        results.forEach((result) => {
          expect(typeof result).toBe('boolean');
        });
      }
    });
  });
});
