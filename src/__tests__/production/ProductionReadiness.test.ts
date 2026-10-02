/**
 * Production Readiness Tests
 *
 * Tests core production readiness functionality.
 */

import {ENV, allEnvironments, AppEnvironment} from '../../config/environment.config';

const anyBoolean = expect.any(Boolean) as unknown as boolean;
const anyNumber = expect.any(Number) as unknown as number;
const anyString = expect.any(String) as unknown as string;
const logLevelMatcher = expect.stringMatching(
  /^(debug|info|warn|error)$/,
) as unknown as AppEnvironment['logLevel'];
const environments: AppEnvironment[] = Object.values(allEnvironments);

describe('Production Readiness', () => {
  describe('Environment Configuration', () => {
    it('should have valid environment configuration', () => {
      expect(ENV).toBeDefined();
      expect(ENV.name).toBeDefined();
      expect(typeof ENV.isFeatureEnabled).toBe('function');
      expect(['development', 'staging', 'production']).toContain(ENV.name);
      expect(typeof ENV.enableLogging).toBe('boolean');
      expect(typeof ENV.enableErrorReporting).toBe('boolean');
      expect(typeof ENV.enablePerformanceMonitoring).toBe('boolean');
      expect(['debug', 'info', 'warn', 'error']).toContain(ENV.logLevel);
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid environment configurations', () => {
      expect(allEnvironments).toBeDefined();
      expect(typeof allEnvironments).toBe('object');

      // Should have all required environments
      expect(allEnvironments.development).toBeDefined();
      expect(allEnvironments.staging).toBeDefined();
      expect(allEnvironments.production).toBeDefined();

      // Each environment should have required properties
      environments.forEach((env) => {
        expect(env.name).toBeDefined();
        expect(typeof env.enableLogging).toBe('boolean');
        expect(typeof env.enableErrorReporting).toBe('boolean');
        expect(typeof env.enablePerformanceMonitoring).toBe('boolean');
        expect(['debug', 'info', 'warn', 'error']).toContain(env.logLevel);
      });
    });

    it('should have different configurations for different environments', () => {
      const dev = allEnvironments.development;
      const prod = allEnvironments.production;

      // Development should be more permissive
      expect(dev.enableLogging).toBe(true);
      expect(dev.logLevel).toBe('debug');
      expect(dev.enableDebugMode).toBe(true);

      // Production should be more restrictive
      expect(prod.enableLogging).toBe(false);
      expect(prod.logLevel).toBe('error');
      expect(prod.enableDebugMode).toBe(false);
    });
  });

  describe('Production Optimizations', () => {
    it('should have bundle optimization configurations', () => {
      const prod = allEnvironments.production;

      // Production should have optimizations enabled
      expect(prod.enableCaching).toBe(true);
      expect(prod.enableSSL).toBe(true);
      expect(prod.requestTimeout).toBeGreaterThan(0);
      expect(prod.cacheTimeout).toBeGreaterThan(0);
    });

    it('should have proper security configurations', () => {
      const prod = allEnvironments.production;
      const dev = allEnvironments.development;

      // Production should have security enabled
      expect(prod.enableSSL).toBe(true);

      // Development can have security disabled for easier testing
      expect(dev.enableSSL).toBe(false);
    });
  });

  describe('Feature Flags', () => {
    it('should have feature flag functionality', () => {
      expect(typeof ENV.isFeatureEnabled).toBe('function');

      // Test some basic feature flags
      const loggingEnabled = ENV.isFeatureEnabled('logging');
      const errorReportingEnabled = ENV.isFeatureEnabled('errorReporting');

      expect(typeof loggingEnabled).toBe('boolean');
      expect(typeof errorReportingEnabled).toBe('boolean');
    });

    it('should return false for unknown features', () => {
      const unknownFeature = ENV.isFeatureEnabled('unknownFeature');
      expect(unknownFeature).toBe(false);
    });
  });

  // Removed API Configuration tests as it is replaced by Supabase

  describe('Cache Configuration', () => {
    it('should have proper cache configuration', () => {
      expect(typeof ENV.getCacheConfig).toBe('function');

      const cacheConfig = ENV.getCacheConfig();

      expect(cacheConfig).toMatchObject({
        enabled: anyBoolean,
        timeout: anyNumber,
      });

      expect(cacheConfig.timeout).toBeGreaterThan(0);
    });
  });

  describe('Logging Configuration', () => {
    it('should have proper logging configuration', () => {
      expect(typeof ENV.getLoggingConfig).toBe('function');

      const loggingConfig = ENV.getLoggingConfig();

      expect(loggingConfig).toMatchObject({
        enabled: anyBoolean,
        level: logLevelMatcher,
      });
    });
  });

  describe('Update Configuration', () => {
    it('should have proper update configuration', () => {
      expect(typeof ENV.getUpdateConfig).toBe('function');

      const updateConfig = ENV.getUpdateConfig();

      expect(updateConfig).toMatchObject({
        enabled: anyBoolean,
        checkInterval: anyNumber,
      });

      expect(updateConfig.checkInterval).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Environment Detection', () => {
    it('should have environment detection methods', () => {
      expect(typeof ENV.isDevelopment).toBe('function');
      expect(typeof ENV.isStaging).toBe('function');
      expect(typeof ENV.isProduction).toBe('function');

      const isDev = ENV.isDevelopment();
      const isStaging = ENV.isStaging();
      const isProd = ENV.isProduction();

      expect(typeof isDev).toBe('boolean');
      expect(typeof isStaging).toBe('boolean');
      expect(typeof isProd).toBe('boolean');

      // Only one should be true
      const trueCount = [isDev, isStaging, isProd].filter(Boolean).length;
      expect(trueCount).toBe(1);
    });
  });

  describe('Configuration Consistency', () => {
    it('should have consistent configuration across environments', () => {
      environments.forEach((env) => {
        // All environments should have the same structure
        expect(env).toMatchObject({
          name: anyString,
          displayName: anyString,
          enableDebugMode: anyBoolean,
          enableLogging: anyBoolean,
          logLevel: logLevelMatcher,
          enableErrorReporting: anyBoolean,
          enableAnalytics: anyBoolean,
          enablePerformanceMonitoring: anyBoolean,
          enableFeatureFlags: anyBoolean,
          enableOTAUpdates: anyBoolean,
          updateCheckInterval: anyNumber,
          maxRetries: anyNumber,
          requestTimeout: anyNumber,
          enableSSL: anyBoolean,
          enableCaching: anyBoolean,
          cacheTimeout: anyNumber,
        });

        // Validate numeric values
        expect(env.updateCheckInterval).toBeGreaterThanOrEqual(0);
        expect(env.maxRetries).toBeGreaterThan(0);
        expect(env.requestTimeout).toBeGreaterThan(0);
        expect(env.cacheTimeout).toBeGreaterThan(0);
      });
    });

    it('should have proper environment progression', () => {
      const dev = allEnvironments.development;
      const staging = allEnvironments.staging;
      const prod = allEnvironments.production;

      // Development should be most permissive
      expect(dev.enableDebugMode).toBe(true);
      expect(dev.enableLogging).toBe(true);
      expect(dev.logLevel).toBe('debug');

      // Staging should be intermediate
      expect(staging.enableDebugMode).toBe(false);
      expect(staging.enableLogging).toBe(true);
      expect(staging.logLevel).toBe('info');

      // Production should be most restrictive
      expect(prod.enableDebugMode).toBe(false);
      expect(prod.enableLogging).toBe(false);
      expect(prod.logLevel).toBe('error');

      // Security should increase from dev to prod
      expect(dev.enableSSL).toBe(false);
      expect(staging.enableSSL).toBe(true);
      expect(prod.enableSSL).toBe(true);
    });
  });
});
