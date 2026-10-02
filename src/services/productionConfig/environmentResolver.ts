import Constants from 'expo-constants';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const determineEnvironment = (): string => {
  const extra: unknown = Constants.expoConfig?.extra;
  if (isRecord(extra) && typeof extra.environment === 'string') {
    return extra.environment;
  }

  if (__DEV__) {
    return 'development';
  }

  if (isRecord(extra) && extra.staging === true) {
    return 'staging';
  }

  return 'production';
};
