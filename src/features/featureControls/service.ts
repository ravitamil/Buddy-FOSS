import {supabase} from '@/lib/supabase';
import {environmentName} from '@/config/environment.config';
import {logger as appLogger} from '@/services/LoggerService';
import {actionDefinitions, featureDefinitions} from './matrix';
import {isFeatureStatus} from './resolver';
import type {
  FeatureAction,
  FeatureControlRow,
  FeatureKey,
  FeaturePlatform,
  FeatureStatus,
} from './types';

const logger = appLogger.serviceLogger('FeatureControls');

type FeatureControlRecord = {
  feature_key?: unknown;
  featureKey?: unknown;
  platform?: unknown;
  environment?: unknown;
  status?: unknown;
  message?: unknown;
  action_overrides?: unknown;
  actionOverrides?: unknown;
  updated_at?: unknown;
  updatedAt?: unknown;
};

const featureKeySet = new Set<FeatureKey>(
  featureDefinitions.map((definition) => definition.feature),
);
const actionKeySet = new Set<FeatureAction>(
  actionDefinitions.map((definition) => definition.action),
);
const platformSet = new Set<FeaturePlatform>(['all', 'android', 'ios']);

const isFeatureKey = (value: unknown): value is FeatureKey =>
  typeof value === 'string' && featureKeySet.has(value as FeatureKey);

const isFeaturePlatform = (value: unknown): value is FeaturePlatform =>
  typeof value === 'string' && platformSet.has(value as FeaturePlatform);

const normalizeActionOverrides = (
  value: unknown,
): Partial<Record<FeatureAction, FeatureStatus>> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  const result: Partial<Record<FeatureAction, FeatureStatus>> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, status]) => {
    if (actionKeySet.has(key as FeatureAction) && isFeatureStatus(status)) {
      result[key as FeatureAction] = status;
    }
  });
  return result;
};

const normalizeRemoteRecord = (record: FeatureControlRecord): FeatureControlRow | null => {
  const rawFeatureKey = record.feature_key ?? record.featureKey;
  const rawUpdatedAt = record.updated_at ?? record.updatedAt;

  if (
    !isFeatureKey(rawFeatureKey) ||
    !isFeaturePlatform(record.platform) ||
    !isFeatureStatus(record.status)
  ) {
    return null;
  }

  return {
    featureKey: rawFeatureKey,
    platform: record.platform,
    environment: typeof record.environment === 'string' ? record.environment : environmentName,
    status: record.status,
    message: typeof record.message === 'string' ? record.message : undefined,
    actionOverrides: normalizeActionOverrides(record.action_overrides ?? record.actionOverrides),
    updatedAt: typeof rawUpdatedAt === 'string' ? rawUpdatedAt : undefined,
  };
};

export async function fetchFeatureControlRows(
  platform: FeaturePlatform,
): Promise<FeatureControlRow[]> {
  const {data, error} = await supabase
    .from('feature_controls')
    .select('feature_key, platform, environment, status, message, action_overrides, updated_at')
    .in('platform', ['all', platform])
    .in('environment', ['all', environmentName])
    .order('environment', {ascending: true})
    .order('platform', {ascending: true})
    .order('updated_at', {ascending: true});

  if (error) {
    logger.warn('Failed to fetch remote feature controls', error);
    throw error;
  }

  return (data ?? [])
    .map((record) => normalizeRemoteRecord(record as FeatureControlRecord))
    .filter((row): row is FeatureControlRow => row !== null);
}
