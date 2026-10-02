/**
 * System Status Types
 *
 * Types for service availability, forced app upgrades, network state,
 * and system-level error handling.
 */

export type ServiceStatusKind = 'operational' | 'maintenance' | 'degraded' | 'outage';

export interface ServiceAvailabilityState {
  isAvailable: boolean;
  status: ServiceStatusKind;
  title?: string;
  message?: string;
  estimatedEndTime?: string;
  supportUrl?: string;
}

export interface AppUpgradeState {
  isUpgradeRequired: boolean;
  isUpgradeAvailable: boolean;
  currentVersion: string;
  minRequiredVersion: string;
  latestVersion: string;
  releaseNotes?: string[];
  storeUrl: string;
  hasPendingOtaUpdate: boolean;
}

export interface NetworkStatusState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  hasLocalCache: boolean;
}

export interface SystemStatusContextValue {
  service: ServiceAvailabilityState;
  upgrade: AppUpgradeState;
  network: NetworkStatusState;
  isChecking: boolean;
  checkStatus: () => Promise<void>;
  applyOtaUpdate: () => Promise<boolean>;
  setOfflineBypass: (bypassed: boolean) => void;
  isOfflineBypassed: boolean;
  // Dev / Testing triggers
  overrideStatus?: (overrides: {
    serviceStatus?: ServiceStatusKind;
    forceUpgrade?: boolean;
    networkOffline?: boolean;
  }) => void;
  clearOverrides?: () => void;
}
