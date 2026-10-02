/**
 * System Status Service
 *
 * Provides status resolution for service availability, forced updates,
 * store redirect URLs, and OTA application.
 */

import {Platform, Linking} from 'react-native';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import {supabase} from '@/lib/supabase';
import {logger as appLogger} from '@/services/LoggerService';
import type {AppUpgradeState, ServiceAvailabilityState} from './types';

const logger = appLogger.serviceLogger('SystemStatusService');

// Default fallback URLs
const IOS_APP_STORE_URL = 'https://apps.apple.com/app/id6475658999';
const ANDROID_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=io.buddy.app';

/**
 * Compare two semver strings (e.g., '1.0.0' vs '1.2.0')
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(p1.length, p2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export function getCurrentAppVersion(): string {
  return Application.nativeApplicationVersion || '1.0.0';
}

export function getStoreRedirectUrl(): string {
  return Platform.OS === 'ios' ? IOS_APP_STORE_URL : ANDROID_PLAY_STORE_URL;
}

export async function openAppStore(): Promise<boolean> {
  const url = getStoreRedirectUrl();
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
  } catch (error) {
    logger.error('Failed to open app store URL', {url, error});
  }
  return false;
}

export async function applyPendingOtaUpdate(): Promise<boolean> {
  try {
    if (!Updates.isEnabled) {
      logger.warn('Updates are not enabled in this environment');
      return false;
    }
    const updateCheck = await Updates.checkForUpdateAsync();
    if (updateCheck.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      return true;
    }
  } catch (error) {
    logger.error('Failed to apply OTA update', error);
  }
  return false;
}

export async function checkOtaUpdateAvailable(): Promise<boolean> {
  try {
    if (!Updates.isEnabled) return false;
    const check = await Updates.checkForUpdateAsync();
    return check.isAvailable;
  } catch {
    return false;
  }
}

export async function checkBackendServiceAvailability(): Promise<ServiceAvailabilityState> {
  try {
    // Check feature_controls or simple heartbeat from supabase
    const {data, error} = await supabase
      .from('feature_controls')
      .select('status, message')
      .eq('feature_key', 'auth')
      .limit(1)
      .maybeSingle();

    if (error) {
      // 503 Service Unavailable or connection drop
      if (
        error.message?.includes('503') ||
        error.message?.includes('maintenance') ||
        error.message?.includes('Network request failed')
      ) {
        return {
          isAvailable: false,
          status: 'maintenance',
          title: 'Scheduled System Maintenance',
          message:
            'Buddy is currently performing scheduled maintenance to improve reliability. Your financial data is securely preserved and will sync when service resumes.',
        };
      }
    }

    if (data?.status === 'maintenance') {
      const serverMessage = typeof data.message === 'string' ? data.message : undefined;
      return {
        isAvailable: false,
        status: 'maintenance',
        title: 'System Under Maintenance',
        message:
          serverMessage ||
          'Our database is currently undergoing upgrades. We will be back online shortly.',
      };
    }

    return {
      isAvailable: true,
      status: 'operational',
    };
  } catch (error) {
    logger.warn('Backend health check check encountered error', error);
    return {
      isAvailable: true,
      status: 'operational',
    };
  }
}

export async function resolveUpgradeState(
  minVersion = '1.0.0',
  latestVersion = '1.0.0',
  releaseNotes?: string[],
): Promise<AppUpgradeState> {
  const currentVersion = getCurrentAppVersion();
  const isUpgradeRequired = compareSemver(currentVersion, minVersion) < 0;
  const isUpgradeAvailable = compareSemver(currentVersion, latestVersion) < 0;
  const hasPendingOtaUpdate = await checkOtaUpdateAvailable();

  return {
    isUpgradeRequired,
    isUpgradeAvailable,
    currentVersion,
    minRequiredVersion: minVersion,
    latestVersion,
    releaseNotes: releaseNotes ?? [
      'Enhanced security and cloud synchronization',
      'Smoother Fluid Surface interface and performance improvements',
      'Critical bug fixes and stability updates',
    ],
    storeUrl: getStoreRedirectUrl(),
    hasPendingOtaUpdate,
  };
}
