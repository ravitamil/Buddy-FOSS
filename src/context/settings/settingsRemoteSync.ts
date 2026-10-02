import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger as appLogger} from '@/services/LoggerService';
import {userProfileDatabaseService} from '@/services/UserProfileDatabaseService';
import {NotificationSettings, SETTINGS_STORAGE_KEYS, ThemeMode} from './settingsContextTypes';

const logger = appLogger.contextLogger('SettingsContext');

export interface RemoteSettingsState {
  currency?: string;
  groupCurrency?: string;
  language?: string;
  theme?: ThemeMode;
  notifications?: NotificationSettings;
}

export const syncSettingsFromRemote = async (
  userId?: string,
): Promise<RemoteSettingsState | null> => {
  try {
    const profile = await userProfileDatabaseService.getUserProfile(userId);
    if (!profile) return null;

    const effectiveCurrency = profile.currency;
    const effectiveGroupCurrency = profile.group_currency || profile.currency;

    await Promise.all([
      effectiveCurrency
        ? AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.CURRENCY, effectiveCurrency)
        : Promise.resolve(),
      effectiveGroupCurrency
        ? AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.GROUP_CURRENCY, effectiveGroupCurrency)
        : Promise.resolve(),
      profile.language
        ? AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.LANGUAGE, profile.language)
        : Promise.resolve(),
      profile.theme
        ? AsyncStorage.setItem(SETTINGS_STORAGE_KEYS.THEME, profile.theme)
        : Promise.resolve(),
      profile.notifications
        ? AsyncStorage.setItem(
            SETTINGS_STORAGE_KEYS.NOTIFICATIONS,
            JSON.stringify(profile.notifications),
          )
        : Promise.resolve(),
    ]);

    logger.info('Settings synced from Supabase');

    return {
      currency: effectiveCurrency,
      groupCurrency: effectiveGroupCurrency,
      language: profile.language,
      theme: profile.theme as ThemeMode | undefined,
      notifications: profile.notifications,
    };
  } catch (error) {
    logger.error('Failed to sync settings from Supabase', error);
    return null;
  }
};
