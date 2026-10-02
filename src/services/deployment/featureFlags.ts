import {ENV} from '../../config/environment.config';
import {FeatureFlag} from './types';

export function createDefaultFeatureFlags(): FeatureFlag[] {
  return [
    {
      name: 'enhanced-analytics',
      enabled: ENV.enableAnalytics,
      rolloutPercentage: ENV.isProduction() ? 50 : 100,
      targetAudience: 'all',
      minimumAppVersion: '1.0.0',
      description: 'Enhanced analytics and tracking',
    },
    {
      name: 'performance-dashboard',
      enabled: ENV.enableDebugMode,
      rolloutPercentage: 100,
      targetAudience: ENV.isProduction() ? 'internal' : 'all',
      minimumAppVersion: '1.0.0',
      description: 'Performance monitoring dashboard',
    },
    {
      name: 'advanced-error-reporting',
      enabled: ENV.enableErrorReporting,
      rolloutPercentage: 100,
      targetAudience: 'all',
      minimumAppVersion: '1.0.0',
      description: 'Advanced error reporting and crash analytics',
    },
    {
      name: 'ota-updates',
      enabled: ENV.enableOTAUpdates,
      rolloutPercentage: ENV.isProduction() ? 80 : 100,
      targetAudience: 'all',
      minimumAppVersion: '1.0.0',
      description: 'Over-the-air updates',
    },
  ];
}

export function meetsMinimumVersion(currentVersion: string, minimumVersion: string): boolean {
  const current = currentVersion.split('.').map(Number);
  const minimum = minimumVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(current.length, minimum.length); i++) {
    const currentPart = current[i] || 0;
    const minimumPart = minimum[i] || 0;

    if (currentPart > minimumPart) return true;
    if (currentPart < minimumPart) return false;
  }

  return true;
}

export function isInTargetAudience(targetAudience: string): boolean {
  switch (targetAudience) {
    case 'all':
      return true;
    case 'beta':
      return ENV.isStaging() || ENV.isDevelopment();
    case 'internal':
      return ENV.isDevelopment();
    default:
      return false;
  }
}

export function getUserHash(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 100;
}
