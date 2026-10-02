import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageService} from '@/services/storage';
import {logger as appLogger} from '@/services/LoggerService';
import {userProfileDatabaseService} from '@/services/UserProfileDatabaseService';
import {validateAndMigrateSettings, validateCurrency} from '@/utils/settings-validation';
import {
  isRecord,
  NotificationSettings,
  parseJson,
  SETTINGS_STORAGE_KEYS,
  ThemeMode,
} from './settingsContextTypes';

const logger = appLogger.contextLogger('SettingsContext');

export interface InitialSettingsState {
  currency: string;
  groupCurrency: string;
  language: string;
  theme: ThemeMode;
  notifications: NotificationSettings;
  settlementStrategy: 'pairwise' | 'minimize_transactions';
  lastSyncTime: Date | null;
}

const parseStoredLastSync = (storedLastSync: string | null): Date | null => {
  if (!storedLastSync) return null;

  try {
    return new Date(storedLastSync);
  } catch (error) {
    logger.warn('Invalid last sync time', error);
    return null;
  }
};

export const loadInitialSettings = async (): Promise<InitialSettingsState> => {
  const [
    storedCurrency,
    storedGroupCurrency,
    storedLanguage,
    storedTheme,
    storedNotifications,
    storedLastSync,
    storedSettlementStrategy,
  ] = await Promise.all([
    AsyncStorage.getItem(SETTINGS_STORAGE_KEYS.CURRENCY),
    AsyncStorage.getItem(SETTINGS_STORAGE_KEYS.GROUP_CURRENCY),
    AsyncStorage.getItem(SETTINGS_STORAGE_KEYS.LANGUAGE),
    AsyncStorage.getItem(SETTINGS_STORAGE_KEYS.THEME),
    AsyncStorage.getItem(SETTINGS_STORAGE_KEYS.NOTIFICATIONS),
    AsyncStorage.getItem(SETTINGS_STORAGE_KEYS.LAST_SYNC),
    AsyncStorage.getItem(SETTINGS_STORAGE_KEYS.SETTLEMENT_STRATEGY),
  ]);

  const rawSettings: Record<string, unknown> = {};

  if (storedCurrency) rawSettings.currency = storedCurrency;
  if (storedGroupCurrency) rawSettings.groupCurrency = storedGroupCurrency;
  if (storedLanguage) rawSettings.language = storedLanguage;
  if (storedTheme) rawSettings.theme = storedTheme;
  if (storedNotifications) {
    try {
      rawSettings.notifications = parseJson(storedNotifications);
    } catch (error) {
      logger.warn('Failed to parse stored notifications', error);
    }
  }

  try {
    const securePrefs = await StorageService.getPreferences();
    const secureCurrency = isRecord(securePrefs) ? securePrefs.currency : undefined;
    if (typeof secureCurrency === 'string' && validateCurrency(secureCurrency)) {
      rawSettings.currency = secureCurrency;
    }
  } catch (error) {
    logger.warn(
      'Failed to load SecureStore preferences; continuing with AsyncStorage values',
      error,
    );
  }

  if (typeof rawSettings.currency !== 'string') {
    const profile = await userProfileDatabaseService.getUserProfile();
    if (profile?.currency && validateCurrency(profile.currency)) {
      rawSettings.currency = profile.currency;
    }
    if (profile?.group_currency && validateCurrency(profile.group_currency)) {
      rawSettings.groupCurrency = profile.group_currency;
    }
  }

  const validatedSettings = await validateAndMigrateSettings(rawSettings);
  const groupCurrency = validatedSettings.groupCurrency || validatedSettings.currency;
  const settlementStrategy =
    storedSettlementStrategy === 'minimize_transactions' || storedSettlementStrategy === 'pairwise'
      ? storedSettlementStrategy
      : validatedSettings.settlementStrategy;

  if (
    storedCurrency !== validatedSettings.currency ||
    storedGroupCurrency !== groupCurrency ||
    storedLanguage !== validatedSettings.language ||
    storedTheme !== validatedSettings.theme ||
    JSON.stringify(rawSettings.notifications) !== JSON.stringify(validatedSettings.notifications)
  ) {
    await Promise.all([
      AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.CURRENCY, validatedSettings.currency),
      AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.GROUP_CURRENCY, groupCurrency),
      AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.LANGUAGE, validatedSettings.language),
      AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.THEME, validatedSettings.theme),
      AsyncStorage.setItem(
        SETTINGS_STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(validatedSettings.notifications),
      ),
      StorageService.savePreference('currency', validatedSettings.currency),
    ]);

    logger.info('Migrated and saved validated settings');
  }

  logger.info('Initialized successfully');

  return {
    currency: validatedSettings.currency,
    groupCurrency,
    language: validatedSettings.language,
    theme: validatedSettings.theme,
    notifications: validatedSettings.notifications,
    settlementStrategy,
    lastSyncTime: parseStoredLastSync(storedLastSync),
  };
};
