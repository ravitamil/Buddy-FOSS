/**
 * Deployment Service
 *
 * Manages deployment strategies, feature rollouts, and production optimizations.
 */

import * as Application from 'expo-application';
import {ENV} from '../config/environment.config';
import {expoErrorReporting} from './ExpoErrorReportingService';
import {logger as appLogger} from './LoggerService';
import {
  calculateCrashRate,
  calculateErrorRate,
  calculatePerformanceScore,
  createDeploymentHealth,
  createFailedDeploymentHealth,
} from './deployment/deploymentHealth';
import {createDeploymentMetrics} from './deployment/deploymentMetrics';
import {
  createDefaultFeatureFlags,
  getUserHash,
  isInTargetAudience,
  meetsMinimumVersion,
} from './deployment/featureFlags';
import {getRolloutStrategyForEnvironment} from './deployment/rolloutStrategies';
import {
  DeploymentHealth,
  DeploymentMetrics,
  DeploymentStatus,
  FeatureFlag,
  RolloutStrategy,
} from './deployment/types';

class DeploymentService {
  private logger = appLogger.serviceLogger('Deployment');
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private deploymentMetrics: DeploymentMetrics | null = null;
  private isInitialized = false;

  initialize(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    try {
      this.logger.info('Initializing deployment service');
      this.loadFeatureFlags();
      this.initializeDeploymentMetrics();
      this.setupDeploymentMonitoring();

      this.isInitialized = true;
      this.logger.info('Deployment service initialized', {
        environment: ENV.name,
        featureFlagsCount: this.featureFlags.size,
      });

      return Promise.resolve();
    } catch (error) {
      this.logger.error('Failed to initialize deployment service', error);
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  isFeatureEnabled(featureName: string, userId?: string): boolean {
    const flag = this.featureFlags.get(featureName);

    if (!flag) {
      this.logger.debug(`Feature flag not found: ${featureName}`);
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    const currentVersion = Application.nativeApplicationVersion || '1.0.0';
    if (!meetsMinimumVersion(currentVersion, flag.minimumAppVersion)) {
      this.logger.debug(`App version too low for feature: ${featureName}`);
      return false;
    }

    if (flag.expiresAt && flag.expiresAt < new Date()) {
      this.logger.debug(`Feature flag expired: ${featureName}`);
      return false;
    }

    if (!isInTargetAudience(flag.targetAudience)) {
      return false;
    }

    if (flag.rolloutPercentage < 100) {
      const userHash = getUserHash(userId || 'anonymous');
      const isInRollout = userHash < flag.rolloutPercentage;

      if (!isInRollout) {
        this.logger.debug(`User not in rollout for feature: ${featureName}`, {
          rolloutPercentage: flag.rolloutPercentage,
          userHash,
        });
        return false;
      }
    }

    return true;
  }

  getFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  getEnabledFeatures(userId?: string): string[] {
    return Array.from(this.featureFlags.keys()).filter((featureName) =>
      this.isFeatureEnabled(featureName, userId),
    );
  }

  getDeploymentMetrics(): DeploymentMetrics | null {
    return this.deploymentMetrics;
  }

  getRolloutStrategy(): RolloutStrategy {
    return getRolloutStrategyForEnvironment();
  }

  reportDeploymentEvent(
    event: 'started' | 'completed' | 'failed' | 'rolled-back',
    details?: Record<string, unknown>,
  ): void {
    this.logger.info(`Deployment event: ${event}`, details);

    expoErrorReporting.addBreadcrumb(
      `Deployment ${event}`,
      'deployment',
      event === 'failed' ? 'error' : 'info',
      {
        event,
        environment: ENV.name,
        version: this.deploymentMetrics?.version,
        ...details,
      },
    );
  }

  checkDeploymentHealth(): Promise<DeploymentHealth> {
    try {
      return Promise.resolve(
        createDeploymentHealth(
          calculateErrorRate(),
          calculateCrashRate(),
          calculatePerformanceScore(),
        ),
      );
    } catch (error) {
      this.logger.error('Failed to check deployment health', error);
      return Promise.resolve(createFailedDeploymentHealth());
    }
  }

  getStatus(): DeploymentStatus {
    return {
      isInitialized: this.isInitialized,
      environment: ENV.name,
      featureFlagsCount: this.featureFlags.size,
      deploymentId: this.deploymentMetrics?.deploymentId,
      version: this.deploymentMetrics?.version,
    };
  }

  private loadFeatureFlags(): void {
    try {
      createDefaultFeatureFlags().forEach((flag) => {
        this.featureFlags.set(flag.name, flag);
      });

      this.logger.info('Feature flags loaded', {
        count: this.featureFlags.size,
        flags: Array.from(this.featureFlags.keys()),
      });
    } catch (error) {
      this.logger.error('Failed to load feature flags', error);
    }
  }

  private initializeDeploymentMetrics(): void {
    try {
      this.deploymentMetrics = createDeploymentMetrics();
      this.logger.info('Deployment metrics initialized', this.deploymentMetrics);
    } catch (error) {
      this.logger.error('Failed to initialize deployment metrics', error);
    }
  }

  private setupDeploymentMonitoring(): void {
    setInterval(() => {
      void (async () => {
        try {
          const health = await this.checkDeploymentHealth();

          if (health.status !== 'healthy') {
            this.logger.warn('Deployment health check failed', {
              status: health.status,
              issues: health.issues,
              metrics: health.metrics,
            });

            expoErrorReporting.addBreadcrumb(
              `Deployment health: ${health.status}`,
              'deployment',
              health.status === 'critical' ? 'error' : 'warning',
              {health},
            );
          }
        } catch (error) {
          this.logger.error('Deployment health check error', error);
        }
      })();
    }, 300000);
  }
}

export const deploymentService = new DeploymentService();
export default deploymentService;

export type {DeploymentMetrics, FeatureFlag, RolloutStrategy};
