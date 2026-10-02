/**
 * App System Status Guard
 *
 * High-level guard component that monitors required app upgrades and
 * system-level maintenance mode, rendering blocking screens when necessary.
 */

import React from 'react';
import {useAppSystemStatus} from './AppSystemStatusProvider';
import {ForceUpgradeScreen} from '@/screenModules/ForceUpgradeScreen';
import {ServiceUnavailableScreen} from '@/screenModules/ServiceUnavailableScreen';

interface AppSystemStatusGuardProps {
  children: React.ReactNode;
}

export const AppSystemStatusGuard: React.FC<AppSystemStatusGuardProps> = ({children}) => {
  const {upgrade, service, isOfflineBypassed} = useAppSystemStatus();

  // 1. Mandatory App Upgrade is the highest priority blocking state
  if (upgrade.isUpgradeRequired) {
    return (
      <ForceUpgradeScreen
        currentVersion={upgrade.currentVersion}
        minRequiredVersion={upgrade.minRequiredVersion}
        releaseNotes={upgrade.releaseNotes}
      />
    );
  }

  // 2. Scheduled Maintenance or Backend Outage (unless user opted to work offline)
  if (!service.isAvailable && !isOfflineBypassed) {
    return (
      <ServiceUnavailableScreen
        title={service.title}
        message={service.message}
        estimatedEndTime={service.estimatedEndTime}
      />
    );
  }

  return <>{children}</>;
};

export default AppSystemStatusGuard;
