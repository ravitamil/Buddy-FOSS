import {Platform} from 'react-native';
import {featureDefinitions, actionDefinitions, routeDefinitions} from './matrix';
import type {
  FeatureAction,
  FeatureDefinition,
  FeatureControlRow,
  FeatureKey,
  FeaturePlatform,
  FeatureRouteDefinition,
  FeatureStatus,
  ResolvedFeatureAction,
  ResolvedFeatureConfig,
  ResolvedFeatureControl,
} from './types';

const validStatuses: readonly FeatureStatus[] = [
  'enabled',
  'hidden',
  'read_only',
  'maintenance',
  'disabled',
];

const hardBlockedStatuses: readonly FeatureStatus[] = ['hidden', 'maintenance', 'disabled'];

export const getCurrentFeaturePlatform = (): FeaturePlatform => {
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'ios') return 'ios';
  return 'all';
};

export const isFeatureStatus = (value: unknown): value is FeatureStatus =>
  typeof value === 'string' && validStatuses.includes(value as FeatureStatus);

const featureDefinitionByKey = new Map<FeatureKey, FeatureDefinition>(
  featureDefinitions.map((definition) => [definition.feature, definition]),
);

const actionDefinitionByKey = new Map(
  actionDefinitions.map((definition) => [definition.action, definition]),
);

const canUseStatus = (feature: FeatureKey, status: FeatureStatus): boolean => {
  const definition = featureDefinitionByKey.get(feature);
  return Boolean(definition?.allowedStatuses.includes(status));
};

const normalizeStatus = (feature: FeatureKey, status: FeatureStatus): FeatureStatus => {
  if (canUseStatus(feature, status)) return status;

  const definition = featureDefinitionByKey.get(feature);
  if (definition?.readOnlyAsEnabled && status === 'read_only') {
    return 'enabled';
  }

  return definition?.defaultStatus ?? 'enabled';
};

const createResolvedFeature = (
  feature: FeatureKey,
  status: FeatureStatus,
  message?: string,
): ResolvedFeatureControl => {
  const definition = featureDefinitionByKey.get(feature);
  const normalizedStatus =
    definition?.readOnlyAsEnabled && status === 'read_only' ? 'enabled' : status;

  return {
    feature,
    status: normalizedStatus,
    message,
    isVisible: normalizedStatus !== 'hidden' && normalizedStatus !== 'disabled',
    canRead: normalizedStatus === 'enabled' || normalizedStatus === 'read_only',
    canWrite: normalizedStatus === 'enabled',
    canExecute: normalizedStatus === 'enabled',
  };
};

const canRunAction = (
  featureStatus: FeatureStatus,
  actionStatus: FeatureStatus,
  action: FeatureAction,
): boolean => {
  const actionDefinition = actionDefinitionByKey.get(action);
  if (!actionDefinition) return false;
  if (hardBlockedStatuses.includes(featureStatus)) return false;

  switch (actionStatus) {
    case 'enabled':
      return true;
    case 'read_only':
      return actionDefinition.kind === 'read' || actionDefinition.kind === 'navigation';
    default:
      return false;
  }
};

export const resolveFeatureControls = (
  rows: readonly FeatureControlRow[],
  source: ResolvedFeatureConfig['source'] = 'bundled',
): ResolvedFeatureConfig => {
  const featureStatuses = new Map<FeatureKey, {status: FeatureStatus; message?: string}>();
  const actionStatuses = new Map<FeatureAction, {status: FeatureStatus; message?: string}>();

  featureDefinitions.forEach((definition) => {
    featureStatuses.set(definition.feature, {status: definition.defaultStatus});
  });

  rows.forEach((row) => {
    const status = normalizeStatus(row.featureKey, row.status);
    featureStatuses.set(row.featureKey, {status, message: row.message});

    Object.entries(row.actionOverrides).forEach(([actionKey, overrideStatus]) => {
      const action = actionKey as FeatureAction;
      const actionDefinition = actionDefinitionByKey.get(action);
      if (!actionDefinition || actionDefinition.feature !== row.featureKey) return;
      if (!isFeatureStatus(overrideStatus)) return;
      actionStatuses.set(action, {status: normalizeStatus(row.featureKey, overrideStatus)});
    });
  });

  const features = {} as Record<FeatureKey, ResolvedFeatureControl>;
  featureDefinitions.forEach((definition) => {
    const status = featureStatuses.get(definition.feature);
    features[definition.feature] = createResolvedFeature(
      definition.feature,
      status?.status ?? definition.defaultStatus,
      status?.message,
    );
  });

  for (let pass = 0; pass < featureDefinitions.length; pass += 1) {
    let changed = false;

    featureDefinitions.forEach((definition) => {
      const current = features[definition.feature];
      if (hardBlockedStatuses.includes(current.status)) return;

      const dependencies = 'dependencies' in definition ? definition.dependencies : undefined;
      const blockedDependency = dependencies?.find((dependency) => !features[dependency].canRead);
      if (!blockedDependency) return;

      const dependency = features[blockedDependency];
      features[definition.feature] = createResolvedFeature(
        definition.feature,
        'maintenance',
        `${definition.label} is unavailable because ${blockedDependency} is ${dependency.status.replace('_', ' ')}`,
      );
      changed = true;
    });

    if (!changed) break;
  }

  const actions = {} as Record<FeatureAction, ResolvedFeatureAction>;
  actionDefinitions.forEach((definition) => {
    const feature = features[definition.feature];
    const override = actionStatuses.get(definition.action);
    const actionStatus = override?.status ?? feature.status;
    actions[definition.action] = {
      action: definition.action,
      feature: definition.feature,
      kind: definition.kind,
      status: actionStatus,
      message: override?.message ?? feature.message,
      isAllowed: canRunAction(feature.status, actionStatus, definition.action),
    };
  });

  return {
    features,
    actions,
    source,
    updatedAt: rows
      .map((row) => row.updatedAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .slice(-1)[0],
  };
};

export const getRouteControlForPath = (pathname: string) => {
  const normalizedPath = pathname === '' ? '/' : pathname;
  return (routeDefinitions as readonly FeatureRouteDefinition[]).find((route) =>
    new RegExp(route.routePattern).test(normalizedPath),
  );
};

export const bundledFeatureConfig = resolveFeatureControls([], 'bundled');
