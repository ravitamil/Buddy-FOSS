import {Dispatch, SetStateAction, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageService} from '@/services/storage';
import {logger as appLogger} from '@/services/LoggerService';
import {userProfileDatabaseService} from '@/services/UserProfileDatabaseService';
import {ContextError, ErrorSeverity, withErrorHandling} from '@/types/context-foundation';
import {
  validateCurrency,
  validateLanguage,
  validateNotificationSettings,
  validateTheme,
} from '@/utils/settings-validation';
import {NotificationSettings, SETTINGS_STORAGE_KEYS, ThemeMode} from './settingsContextTypes';

const logger = appLogger.contextLogger('SettingsContext');

interface UseSettingsOperationsParams {
  currency: string;
  groupCurrency: string;
  language: string;
  theme: ThemeMode;
  notifications: NotificationSettings;
  userId?: string;
  setCurrencyState: Dispatch<SetStateAction<string>>;
  setGroupCurrencyState: Dispatch<SetStateAction<string>>;
  setLanguageState: Dispatch<SetStateAction<string>>;
  setThemeState: Dispatch<SetStateAction<ThemeMode>>;
  setNotificationsState: Dispatch<SetStateAction<NotificationSettings>>;
}

export const useSettingsOperations = ({
  currency,
  groupCurrency,
  language,
  theme,
  notifications,
  userId,
  setCurrencyState,
  setGroupCurrencyState,
  setLanguageState,
  setThemeState,
  setNotificationsState,
}: UseSettingsOperationsParams) => {
  const updateCurrency = useCallback(
    async (newCurrency: string): Promise<void> =>
      withErrorHandling(
        async () => {
          if (!validateCurrency(newCurrency)) {
            throw new ContextError(
              `Invalid currency code: ${newCurrency}`,
              'SETTINGS_INVALID_CURRENCY',
              'Settings',
              ErrorSeverity.MEDIUM,
            );
          }

          const previousCurrency = currency;
          const previousGroupCurrency = groupCurrency;

          setCurrencyState(newCurrency);
          setGroupCurrencyState(newCurrency);

          try {
            const persistencePromises: Promise<void>[] = [
              AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.CURRENCY, newCurrency),
              AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.GROUP_CURRENCY, newCurrency),
              StorageService.savePreference('currency', newCurrency),
            ];

            await Promise.all(persistencePromises);

            if (userId) {
              const profileUpdates: Record<string, unknown> = {
                currency: newCurrency,
                group_currency: newCurrency,
              };
              await userProfileDatabaseService.saveUserProfile(userId, profileUpdates);
            }

            logger.info('Currency updated', {currency: newCurrency, syncedGroup: true});
          } catch (error) {
            setCurrencyState(previousCurrency);
            setGroupCurrencyState(previousGroupCurrency);
            throw error;
          }
        },
        'Settings',
        'updateCurrency',
      ),
    [currency, groupCurrency, setCurrencyState, setGroupCurrencyState, userId],
  );

  const updateGroupCurrency = useCallback(
    async (newCurrency: string): Promise<void> =>
      withErrorHandling(
        async () => {
          if (!validateCurrency(newCurrency)) {
            throw new ContextError(
              `Invalid currency code: ${newCurrency}`,
              'SETTINGS_INVALID_GROUP_CURRENCY',
              'Settings',
              ErrorSeverity.MEDIUM,
            );
          }

          const previousGroupCurrency = groupCurrency;
          setGroupCurrencyState(newCurrency);

          try {
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.GROUP_CURRENCY, newCurrency);
            if (userId) {
              await userProfileDatabaseService.saveUserProfile(userId, {
                group_currency: newCurrency,
              });
            }

            logger.info('Group currency updated', {groupCurrency: newCurrency});
          } catch (error) {
            setGroupCurrencyState(previousGroupCurrency);
            throw error;
          }
        },
        'Settings',
        'updateGroupCurrency',
      ),
    [groupCurrency, setGroupCurrencyState, userId],
  );

  const updateLanguage = useCallback(
    async (newLanguage: string): Promise<void> =>
      withErrorHandling(
        async () => {
          if (!validateLanguage(newLanguage)) {
            throw new ContextError(
              `Invalid language code: ${newLanguage}`,
              'SETTINGS_INVALID_LANGUAGE',
              'Settings',
              ErrorSeverity.MEDIUM,
            );
          }

          const previousLanguage = language;
          setLanguageState(newLanguage);

          try {
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.LANGUAGE, newLanguage);
            if (userId) {
              await userProfileDatabaseService.saveUserProfile(userId, {language: newLanguage});
            }

            logger.info('Language updated', {language: newLanguage});
          } catch (error) {
            setLanguageState(previousLanguage);
            throw error;
          }
        },
        'Settings',
        'updateLanguage',
      ),
    [language, setLanguageState, userId],
  );

  const updateTheme = useCallback(
    async (newTheme: ThemeMode): Promise<void> =>
      withErrorHandling(
        async () => {
          if (!validateTheme(newTheme)) {
            throw new ContextError(
              `Invalid theme: ${String(newTheme)}`,
              'SETTINGS_INVALID_THEME',
              'Settings',
              ErrorSeverity.MEDIUM,
            );
          }

          const previousTheme = theme;
          setThemeState(newTheme);

          try {
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.THEME, newTheme);
            if (userId) {
              await userProfileDatabaseService.saveUserProfile(userId, {theme: newTheme});
            }

            logger.info('Theme updated', {theme: newTheme});
          } catch (error) {
            setThemeState(previousTheme);
            throw error;
          }
        },
        'Settings',
        'updateTheme',
      ),
    [setThemeState, theme, userId],
  );

  const updateNotifications = useCallback(
    async (updates: Partial<NotificationSettings>): Promise<void> =>
      withErrorHandling(
        async () => {
          const newNotifications = {...notifications, ...updates};

          if (!validateNotificationSettings(newNotifications)) {
            throw new ContextError(
              'Invalid notification settings provided',
              'SETTINGS_INVALID_NOTIFICATIONS',
              'Settings',
              ErrorSeverity.MEDIUM,
            );
          }

          const previousNotifications = notifications;
          setNotificationsState(newNotifications);

          try {
            await AsyncStorage.setItem(
              SETTINGS_STORAGE_KEYS.NOTIFICATIONS,
              JSON.stringify(newNotifications),
            );

            if (userId) {
              await userProfileDatabaseService.saveUserProfile(userId, {
                notifications: newNotifications,
              });
            }

            logger.info('Notifications updated', {updates});
          } catch (error) {
            setNotificationsState(previousNotifications);
            throw error;
          }
        },
        'Settings',
        'updateNotifications',
      ),
    [notifications, setNotificationsState, userId],
  );

  return {
    updateCurrency,
    updateGroupCurrency,
    updateLanguage,
    updateTheme,
    updateNotifications,
  };
};
