import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {logger as appLogger} from '../services/LoggerService';
import {clearModernizedCacheStorage} from '../services/storage/cacheStorage';
import {clearQueryState} from '../services/QueryPersistenceProvider';
import {StorageService} from '../services/storage';

/**
 * Wipes all local user data. Use for account deletion and sign out.
 */
export const wipeAllLocalData = async (userId?: string) => {
  appLogger.info('🧹 [DataWiper] Starting comprehensive local data wipe...');

  const runCleanupStep = async (label: string, cleanup: () => Promise<void>) => {
    try {
      await cleanup();
      appLogger.info(`[DataWiper] ${label} cleared successfully.`);
    } catch (error) {
      appLogger.error(`[DataWiper] Failed to clear ${label}`, error);
    }
  };

  await runCleanupStep('query and offline mutation state', clearQueryState);

  await runCleanupStep('AsyncStorage', async () => {
    const keys = await AsyncStorage.getAllKeys();
    appLogger.debug(`[DataWiper] Found ${keys.length} keys in AsyncStorage to delete.`);
    await AsyncStorage.clear();
    await AsyncStorage.setItem('onboarding_completed', 'false');
    await AsyncStorage.setItem('has_seen_onboarding', 'false');
  });

  await runCleanupStep('modernized cache storage', clearModernizedCacheStorage);

  if (userId) {
    await runCleanupStep('scoped profile cache', () => StorageService.clearCachedProfile(userId));
  }

  const commonKeys = [
    'supabase-auth-token',
    'supabase-url',
    'supabase-anon-key',
    'sb-access-token',
    'sb-refresh-token',
    'display_name',
    'photo_url',
    'user_settings',
    'google_auth_user',
    'google_auth_tokens',
    'app_auth_user',
  ];

  await runCleanupStep('known SecureStore session keys', async () => {
    await Promise.all(
      commonKeys.map(async (key) => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch {
          // Key may not exist — expected during wipe
          appLogger.debug(`[DataWiper] Key "${key}" not found, skipping`);
        }
      }),
    );
  });
};
