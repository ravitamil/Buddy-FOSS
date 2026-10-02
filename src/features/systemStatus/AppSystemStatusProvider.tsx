/**
 * System Status Provider
 *
 * Coordinates service availability, forced updates, and network connectivity state.
 */

import React, {createContext, useContext, useEffect, useState, useCallback, useMemo} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {
  checkBackendServiceAvailability,
  resolveUpgradeState,
  applyPendingOtaUpdate,
  getCurrentAppVersion,
  getStoreRedirectUrl,
} from './service';
import type {
  AppUpgradeState,
  NetworkStatusState,
  ServiceAvailabilityState,
  ServiceStatusKind,
  SystemStatusContextValue,
} from './types';

const defaultServiceState: ServiceAvailabilityState = {
  isAvailable: true,
  status: 'operational',
};

const defaultUpgradeState: AppUpgradeState = {
  isUpgradeRequired: false,
  isUpgradeAvailable: false,
  currentVersion: getCurrentAppVersion(),
  minRequiredVersion: '1.0.0',
  latestVersion: '1.0.0',
  storeUrl: getStoreRedirectUrl(),
  hasPendingOtaUpdate: false,
};

const defaultNetworkState: NetworkStatusState = {
  isConnected: true,
  isInternetReachable: true,
  hasLocalCache: true,
};

const SystemStatusContext = createContext<SystemStatusContextValue>({
  service: defaultServiceState,
  upgrade: defaultUpgradeState,
  network: defaultNetworkState,
  isChecking: false,
  checkStatus: async () => {},
  applyOtaUpdate: () => Promise.resolve(false),
  setOfflineBypass: () => {},
  isOfflineBypassed: false,
});

export const AppSystemStatusProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [service, setService] = useState<ServiceAvailabilityState>(defaultServiceState);
  const [upgrade, setUpgrade] = useState<AppUpgradeState>(defaultUpgradeState);
  const [network, setNetwork] = useState<NetworkStatusState>(defaultNetworkState);
  const [isChecking, setIsChecking] = useState(false);
  const [isOfflineBypassed, setOfflineBypass] = useState(false);

  // Overrides for development/preview testing
  const [devOverrides, setDevOverrides] = useState<{
    serviceStatus?: ServiceStatusKind;
    forceUpgrade?: boolean;
    networkOffline?: boolean;
  } | null>(null);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const [serviceResult, upgradeResult] = await Promise.all([
        checkBackendServiceAvailability(),
        resolveUpgradeState(),
      ]);
      setService(serviceResult);
      setUpgrade(upgradeResult);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Listen to network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetwork({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable,
        hasLocalCache: true,
      });
    });

    void checkStatus();

    return () => unsubscribe();
  }, [checkStatus]);

  const applyOta = useCallback(async () => {
    return await applyPendingOtaUpdate();
  }, []);

  const overrideStatus = useCallback(
    (overrides: {
      serviceStatus?: ServiceStatusKind;
      forceUpgrade?: boolean;
      networkOffline?: boolean;
    }) => {
      setDevOverrides(overrides);
    },
    [],
  );

  const clearOverrides = useCallback(() => {
    setDevOverrides(null);
  }, []);

  const effectiveService = useMemo<ServiceAvailabilityState>(() => {
    if (devOverrides?.serviceStatus) {
      return {
        isAvailable: devOverrides.serviceStatus === 'operational',
        status: devOverrides.serviceStatus,
        title:
          devOverrides.serviceStatus === 'maintenance'
            ? 'Scheduled System Maintenance'
            : 'Service Outage',
        message:
          'Buddy is currently performing scheduled infrastructure updates. All your data is safely cached locally and will synchronize once service is restored.',
        estimatedEndTime: '~15 minutes',
      };
    }
    return service;
  }, [devOverrides?.serviceStatus, service]);

  const effectiveUpgrade = useMemo<AppUpgradeState>(() => {
    if (devOverrides?.forceUpgrade !== undefined) {
      return {
        ...upgrade,
        isUpgradeRequired: devOverrides.forceUpgrade,
        minRequiredVersion: '2.0.0',
        latestVersion: '2.0.0',
      };
    }
    return upgrade;
  }, [devOverrides?.forceUpgrade, upgrade]);

  const effectiveNetwork = useMemo<NetworkStatusState>(() => {
    if (devOverrides?.networkOffline !== undefined) {
      return {
        isConnected: !devOverrides.networkOffline,
        isInternetReachable: !devOverrides.networkOffline,
        hasLocalCache: true,
      };
    }
    return network;
  }, [devOverrides?.networkOffline, network]);

  const contextValue = useMemo<SystemStatusContextValue>(
    () => ({
      service: effectiveService,
      upgrade: effectiveUpgrade,
      network: effectiveNetwork,
      isChecking,
      checkStatus,
      applyOtaUpdate: applyOta,
      setOfflineBypass,
      isOfflineBypassed,
      overrideStatus,
      clearOverrides,
    }),
    [
      effectiveService,
      effectiveUpgrade,
      effectiveNetwork,
      isChecking,
      checkStatus,
      applyOta,
      isOfflineBypassed,
      overrideStatus,
      clearOverrides,
    ],
  );

  return (
    <SystemStatusContext.Provider value={contextValue}>{children}</SystemStatusContext.Provider>
  );
};

// eslint-disable-next-line context-patterns/enforce-context-patterns
export const useAppSystemStatus = () => useContext(SystemStatusContext);
