import React from 'react';
import {usePathname} from 'expo-router';
import {FeatureUnavailable} from './FeatureUnavailable';
import {useFeatureStatusContext} from './FeatureStatusProvider';
import {getRouteControlForPath} from './resolver';

export function FeatureRouteGuard({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const routeControl = getRouteControlForPath(pathname);
  const {config} = useFeatureStatusContext();

  if (!routeControl) return <>{children}</>;

  const feature = config.features[routeControl.feature];
  const routeActions = routeControl.actions
    ? routeControl.actions.map((action) => config.actions[action])
    : routeControl.action
      ? [config.actions[routeControl.action]]
      : [];

  if (!feature.canRead || feature.status === 'hidden' || feature.status === 'maintenance') {
    return (
      <FeatureUnavailable
        status={feature.status}
        title={routeControl.label}
        message={feature.message}
      />
    );
  }

  if (routeActions.length > 0 && routeActions.every((action) => !action.isAllowed)) {
    const blockedAction = routeActions[0];
    return (
      <FeatureUnavailable
        status={blockedAction.status}
        title={routeControl.label}
        message={blockedAction.message}
      />
    );
  }

  return <>{children}</>;
}
