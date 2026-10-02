/**
 * Settings Validation and Migration Utilities
 *
 * Provides validation functions for settings data and migration utilities
 * for handling settings schema changes across app versions.
 */

import {isSupportedCurrency} from '../constants/currencies';
import type {ThemeMode, NotificationSettings} from '../context/settings/settingsContextTypes';
import {logger as appLogger} from '../services/LoggerService';

type SettlementStrategy = 'pairwise' | 'minimize_transactions';

interface SanitizedSettings {
  currency: string;
  groupCurrency: string;
  language: string;
  theme: ThemeMode;
  notifications: NotificationSettings;
  settlementStrategy: SettlementStrategy;
}

const NOTIFICATION_BOOLEAN_FIELDS = [
  'subscriptionReminders',
  'loanReminders',
  'overdueReminders',
  'successNotifications',
  'pushNotifications',
  'emailNotifications',
] as const satisfies readonly (keyof NotificationSettings)[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getStringValue = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
};

const isSettlementStrategy = (value: unknown): value is SettlementStrategy =>
  value === 'minimize_transactions' || value === 'pairwise';

const parseJson = (value: string): unknown => JSON.parse(value) as unknown;

// Default notification settings for greenfield project
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  subscriptionReminders: true,
  loanReminders: true,
  reminderDaysBefore: 3,
  dailyReminderTime: '09:00',
  overdueReminders: true,
  successNotifications: true,
  pushNotifications: true,
  emailNotifications: false,
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates currency code against supported currencies
 */
export const validateCurrency = (currency: string): boolean => {
  if (!currency || typeof currency !== 'string') {
    return false;
  }
  return isSupportedCurrency(currency);
};

/**
 * Validates language code (basic validation)
 */
export const validateLanguage = (language: string): boolean => {
  if (!language || typeof language !== 'string') {
    return false;
  }
  // Basic validation: 2-5 character language codes
  return /^[a-z]{2,5}(-[A-Z]{2})?$/.test(language);
};

/**
 * Validates theme mode
 */
export const validateTheme = (theme: string): theme is ThemeMode => {
  const validThemes: ThemeMode[] = ['light', 'dark', 'system'];
  return validThemes.includes(theme as ThemeMode);
};

/**
 * Validates notification settings object
 */
export const validateNotificationSettings = (
  settings: unknown,
): settings is NotificationSettings => {
  if (!isRecord(settings)) {
    return false;
  }

  for (const field of NOTIFICATION_BOOLEAN_FIELDS) {
    if (typeof settings[field] !== 'boolean') {
      return false;
    }
  }

  // Validate reminderDaysBefore
  if (
    typeof settings.reminderDaysBefore !== 'number' ||
    settings.reminderDaysBefore < 0 ||
    settings.reminderDaysBefore > 30
  ) {
    return false;
  }

  // Validate dailyReminderTime format (HH:MM)
  if (
    typeof settings.dailyReminderTime !== 'string' ||
    !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(settings.dailyReminderTime)
  ) {
    return false;
  }

  return true;
};

/**
 * Validates complete settings object
 */
export const validateSettings = (
  settings: unknown,
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!isRecord(settings)) {
    return {isValid: false, errors: ['Settings must be an object']};
  }

  // Validate currency
  const currency = getStringValue(settings, 'currency');
  if (settings.currency !== undefined && !currency) {
    errors.push('Invalid currency code');
  } else if (currency && !validateCurrency(currency)) {
    errors.push('Invalid currency code');
  }

  // Validate language
  const language = getStringValue(settings, 'language');
  if (settings.language !== undefined && !language) {
    errors.push('Invalid language code');
  } else if (language && !validateLanguage(language)) {
    errors.push('Invalid language code');
  }

  // Validate theme
  const theme = getStringValue(settings, 'theme');
  if (settings.theme !== undefined && !theme) {
    errors.push('Invalid theme mode');
  } else if (theme && !validateTheme(theme)) {
    errors.push('Invalid theme mode');
  }

  // Validate notifications
  if (
    settings.notifications !== undefined &&
    !validateNotificationSettings(settings.notifications)
  ) {
    errors.push('Invalid notification settings');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// Migration Utilities
// ============================================================================

/**
 * Sanitizes settings by removing invalid fields and applying defaults
 */
export const sanitizeSettings = (settings: unknown): SanitizedSettings => {
  const sanitized: SanitizedSettings = {
    currency: 'USD',
    groupCurrency: '',
    language: 'en',
    theme: 'system',
    notifications: {...DEFAULT_NOTIFICATION_SETTINGS},
    settlementStrategy: 'minimize_transactions',
  };

  if (isRecord(settings)) {
    // Sanitize currency
    const currency = getStringValue(settings, 'currency');
    if (currency && validateCurrency(currency)) {
      sanitized.currency = currency;
    }

    // Sanitize group currency
    const groupCurrency = getStringValue(settings, 'groupCurrency');
    if (groupCurrency && validateCurrency(groupCurrency)) {
      sanitized.groupCurrency = groupCurrency;
    }

    // Sanitize language
    const language = getStringValue(settings, 'language');
    if (language && validateLanguage(language)) {
      sanitized.language = language;
    }

    // Sanitize theme
    const theme = getStringValue(settings, 'theme');
    if (theme && validateTheme(theme)) {
      sanitized.theme = theme;
    }

    // Sanitize notifications
    const notifications = settings.notifications;
    if (validateNotificationSettings(notifications)) {
      sanitized.notifications = notifications;
    } else if (isRecord(notifications)) {
      // Partial sanitization - keep valid fields
      sanitized.notifications = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...Object.fromEntries(
          Object.entries(notifications).filter(([key, value]) => {
            const defaultValue = DEFAULT_NOTIFICATION_SETTINGS[key as keyof NotificationSettings];
            return typeof value === typeof defaultValue;
          }),
        ),
      };
    }
    // Sanitize settlement strategy
    if (isSettlementStrategy(settings.settlementStrategy)) {
      sanitized.settlementStrategy = settings.settlementStrategy;
    }
  }

  return sanitized;
};

/**
 * Restores settings from backup
 */
export const restoreSettingsFromBackup = async (): Promise<unknown> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const backupData = await AsyncStorage.default.getItem('@BuddyApp:settings_backup');

    if (!backupData) {
      return null;
    }

    const backup = parseJson(backupData);
    const backupRecord = isRecord(backup) ? backup : {};
    appLogger.debug('✅ Settings: Restored from backup', backupRecord.version);
    return backupRecord.settings;
  } catch (error) {
    appLogger.error('❌ Settings: Failed to restore from backup', error);
    return null;
  }
};

/**
 * Validates and migrates settings with error handling
 * Simplified for greenfield project - no migration needed
 */
export const validateAndMigrateSettings = (rawSettings: unknown): Promise<SanitizedSettings> => {
  try {
    // For greenfield project, just sanitize settings without migration
    return Promise.resolve(sanitizeSettings(rawSettings));
  } catch (error) {
    appLogger.error('❌ Settings: Validation failed', error);
    // Return safe defaults
    return Promise.resolve(sanitizeSettings(null));
  }
};
