/**
 * Production Configuration Service
 *
 * Manages environment-based configuration, OTA update compatibility,
 * and production optimization strategies for Expo applications.
 */

import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import {addUpdatesStateChangeListener} from 'expo-updates';
import * as Device from 'expo-device';
import {logger as appLogger} from './LoggerService';
import {expoErrorReporting} from './ExpoErrorReportingService';
import {getDeviceInformation} from './productionConfig/deviceInformation';
import {
  environmentConfigs,
  getDeploymentStrategyForEnvironment,
} from './productionConfig/environmentConfigs';
import {determineEnvironment} from './productionConfig/environmentResolver';
import type {DeploymentStrategy, EnvironmentConfig, OTAUpdateInfo} from './productionConfig/types';

class ProductionConfigService {
  private logger = appLogger.serviceLogger('ProductionConfig');
  private currentConfig: EnvironmentConfig | null = null;
  private isInitialized = false;
  private updateCheckTimer?: ReturnType<typeof setInterval>;

  /**
   * Initialize production configuration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('Initializing production configuration');

      // Determine current environment
      const environment = determineEnvironment();
      this.currentConfig = environmentConfigs[environment];

      this.logger.info('Environment determined', {
        environment,
        isDevice: Constants.isDevice === true,
        isDevelopment: __DEV__,
      });

      // Initialize OTA updates if enabled
      if (this.currentConfig.enableOTAUpdates) {
        await this.initializeOTAUpdates();
      }

      // Set up configuration monitoring
      this.setupConfigurationMonitoring();

      // Apply bundle optimizations
      this.applyBundleOptimizations();

      // Set up security configurations
      this.applySecurityConfigurations();

      // Log device information for debugging
      this.logDeviceInformation();

      this.isInitialized = true;
      this.logger.info('Production configuration initialized', {
        environment: this.currentConfig.name,
        otaEnabled: this.currentConfig.enableOTAUpdates,
        deviceType: Device.deviceType,
        isDevice: Device.isDevice,
      });
    } catch (error) {
      this.logger.error('Failed to initialize production configuration', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): EnvironmentConfig | null {
    return this.currentConfig;
  }

  /**
   * Get configuration value by key
   */
  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] | null {
    return this.currentConfig ? this.currentConfig[key] : null;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    if (!this.currentConfig) return false;

    switch (feature) {
      case 'logging':
        return this.currentConfig.enableLogging;
      case 'errorReporting':
        return this.currentConfig.enableErrorReporting;
      case 'performanceMonitoring':
        return this.currentConfig.enablePerformanceMonitoring;
      case 'analytics':
        return this.currentConfig.enableAnalytics;
      case 'otaUpdates':
        return this.currentConfig.enableOTAUpdates;
      case 'crashReporting':
        return this.currentConfig.enableCrashReporting;
      case 'featureFlags':
        return this.currentConfig.enableFeatureFlags;
      default:
        return false;
    }
  }

  /**
   * Get OTA update information
   */
  async getOTAUpdateInfo(): Promise<OTAUpdateInfo> {
    try {
      if (!Updates.isEnabled) {
        return {
          isAvailable: false,
          isEmbeddedLaunch: true,
        };
      }

      const updateCheck = await Updates.checkForUpdateAsync();

      return {
        isAvailable: updateCheck.isAvailable,
        isEmbeddedLaunch: Updates.isEmbeddedLaunch,
        manifest: updateCheck.manifest,
        updateId: Updates.updateId ?? undefined,
        createdAt: Updates.createdAt ?? undefined,
        runtimeVersion: Updates.runtimeVersion ?? undefined,
      };
    } catch (error) {
      this.logger.error('Failed to get OTA update info', error);
      return {
        isAvailable: false,
        isEmbeddedLaunch: true,
      };
    }
  }

  /**
   * Apply OTA update if available
   */
  async applyOTAUpdate(): Promise<boolean> {
    try {
      if (!this.currentConfig?.enableOTAUpdates) {
        this.logger.warn('OTA updates are disabled');
        return false;
      }

      if (!Updates.isEnabled) {
        this.logger.warn('OTA updates are not enabled');
        return false;
      }

      const updateCheck = await Updates.checkForUpdateAsync();

      if (updateCheck.isAvailable) {
        this.logger.info('Applying OTA update...');

        expoErrorReporting.addBreadcrumb('Applying OTA update', 'update', 'info');

        await Updates.fetchUpdateAsync();

        // Add breadcrumb for successful fetch
        expoErrorReporting.addBreadcrumb('OTA update fetched successfully', 'update', 'info');

        // Reload the app to apply the update
        await Updates.reloadAsync();

        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Failed to apply OTA update', error);

      void expoErrorReporting.reportError(error as Error, {
        tags: {component: 'OTAUpdate'},
        level: 'error',
      });

      return false;
    }
  }

  /**
   * Get deployment strategy
   */
  getDeploymentStrategy(): DeploymentStrategy {
    const environment = this.currentConfig?.name || 'development';
    return getDeploymentStrategyForEnvironment(environment);
  }

  /**
   * Initialize OTA updates
   */
  private async initializeOTAUpdates(): Promise<void> {
    try {
      if (!Updates.isEnabled) {
        this.logger.info('OTA updates are not enabled');
        return;
      }

      this.logger.info('Initializing OTA updates...');

      // Set up update event listeners
      this.setupUpdateEventListeners();

      // Check for updates periodically
      await this.checkForUpdates();

      // Set up periodic update checks
      this.updateCheckTimer = setInterval(() => {
        void this.checkForUpdates();
      }, this.currentConfig?.updateCheckInterval || 300000);

      this.logger.info('OTA updates initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OTA updates', error);
    }
  }

  /**
   * Set up update event listeners
   */
  private setupUpdateEventListeners(): void {
    try {
      // Listen for update state change events
      const subscription = addUpdatesStateChangeListener(({context}) => {
        if (context.checkError || context.downloadError) {
          const message =
            context.checkError?.message || context.downloadError?.message || 'Unknown OTA error';
          this.logger.error('OTA update error', message);
          void expoErrorReporting.reportError(new Error(message), {
            tags: {component: 'OTAUpdate'},
            level: 'error',
          });
          return;
        }

        if (context.isUpdateAvailable) {
          this.logger.info('OTA update available');
          expoErrorReporting.addBreadcrumb('OTA update available', 'update', 'info');
        } else if (context.lastCheckForUpdateTime) {
          this.logger.debug('No OTA update available');
        }
      });

      this.logger.debug('Update event listeners set up successfully');

      // Store subscription for cleanup if needed
      // Note: In a real implementation, you might want to store this subscription
      // and clean it up when the service is destroyed
    } catch (error) {
      this.logger.error('Failed to set up update event listeners', error);
    }
  }

  /**
   * Check for updates periodically
   */
  private async checkForUpdates(): Promise<void> {
    try {
      const updateInfo = await this.getOTAUpdateInfo();

      if (updateInfo.isAvailable) {
        this.logger.info('Periodic update check found new update');

        expoErrorReporting.addBreadcrumb(
          'Periodic update check found new update',
          'update',
          'info',
        );

        // Optionally auto-apply updates in staging/development
        if (this.currentConfig?.name !== 'production') {
          await this.applyOTAUpdate();
        }
      }
    } catch (error) {
      this.logger.error('Periodic update check failed', error);
    }
  }

  /**
   * Set up configuration monitoring
   */
  private setupConfigurationMonitoring(): void {
    // Monitor configuration changes
    expoErrorReporting.addBreadcrumb('Configuration monitoring started', 'config', 'info', {
      environment: this.currentConfig?.name,
      features: {
        logging: this.currentConfig?.enableLogging,
        errorReporting: this.currentConfig?.enableErrorReporting,
        performanceMonitoring: this.currentConfig?.enablePerformanceMonitoring,
        otaUpdates: this.currentConfig?.enableOTAUpdates,
      },
    });
  }

  /**
   * Apply bundle optimizations
   */
  private applyBundleOptimizations(): void {
    if (!this.currentConfig?.bundleOptimization) return;

    const optimizations = this.currentConfig.bundleOptimization;

    this.logger.info('Applying bundle optimizations', optimizations);

    // These optimizations would typically be applied at build time
    // Here we log them for monitoring purposes
    expoErrorReporting.addBreadcrumb(
      'Bundle optimizations applied',
      'optimization',
      'info',
      optimizations,
    );
  }

  /**
   * Apply security configurations
   */
  private applySecurityConfigurations(): void {
    if (!this.currentConfig?.security) return;

    const security = this.currentConfig.security;

    this.logger.info('Applying security configurations', security);

    // These would typically involve configuring network security
    expoErrorReporting.addBreadcrumb(
      'Security configurations applied',
      'security',
      'info',
      security,
    );
  }

  /**
   * Get configuration status
   */
  getStatus(): {
    isInitialized: boolean;
    environment: string;
    otaEnabled: boolean;
    lastUpdateCheck?: Date;
    configurationValid: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      environment: this.currentConfig?.name || 'unknown',
      otaEnabled: this.currentConfig?.enableOTAUpdates || false,
      configurationValid: this.currentConfig !== null,
    };
  }

  /**
   * Log device information for debugging and analytics
   */
  private logDeviceInformation(): void {
    try {
      const deviceInfo = getDeviceInformation();

      this.logger.info('Device information collected', deviceInfo);

      // Add device info to error reporting context
      expoErrorReporting.setContext('device', deviceInfo);
    } catch (error) {
      this.logger.error('Failed to collect device information', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
      this.updateCheckTimer = undefined;
    }

    this.logger.info('Production configuration service cleaned up');
  }
}

// Export singleton instance
export const productionConfig = new ProductionConfigService();
export default productionConfig;

// Export types
export type {EnvironmentConfig, OTAUpdateInfo, DeploymentStrategy};
