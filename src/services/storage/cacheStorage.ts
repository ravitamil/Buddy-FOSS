import AsyncStorage from '@react-native-async-storage/async-storage';
import {MMKVLoader} from 'react-native-mmkv-storage';
import appLogger from '../LoggerService';

type CacheStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  getKeys: (prefix?: string) => Promise<string[]>;
  removeItems: (keys: string[]) => Promise<void>;
};

const createMmkvCacheStorage = (instanceId: string): CacheStorage => {
  try {
    const storage = new MMKVLoader().withInstanceID(instanceId).initialize();

    return {
      getItem(key) {
        return Promise.resolve(storage.getString(key) ?? null);
      },
      setItem(key, value) {
        storage.setString(key, value);
        return Promise.resolve();
      },
      removeItem(key) {
        storage.removeItem(key);
        return Promise.resolve();
      },
      async getKeys(prefix) {
        const keys = await storage.indexer.getKeys();
        return prefix ? keys.filter((key) => key.startsWith(prefix)) : keys;
      },
      removeItems(keys) {
        if (keys.length > 0) {
          storage.removeItems(keys);
        }
        return Promise.resolve();
      },
    };
  } catch (error) {
    appLogger.warn(`[cacheStorage] Falling back to AsyncStorage for ${instanceId}`, error);

    return {
      getItem: (key) => AsyncStorage.getItem(key),
      async setItem(key, value) {
        await AsyncStorage.setItem(key, value);
      },
      async removeItem(key) {
        await AsyncStorage.removeItem(key);
      },
      async getKeys(prefix) {
        const keys = await AsyncStorage.getAllKeys();
        return prefix ? keys.filter((key) => key.startsWith(prefix)) : [...keys];
      },
      async removeItems(keys) {
        if (keys.length > 0) {
          await AsyncStorage.multiRemove(keys);
        }
      },
    };
  }
};

export const imageMetadataStorage = createMmkvCacheStorage('image-metadata-cache');
export const profileImageStorage = createMmkvCacheStorage('profile-image-cache');
export const financialDataCacheStorage = createMmkvCacheStorage('financial-data-cache');
export const offlineDataStorage = createMmkvCacheStorage('buddy-offline-data');

export const clearModernizedCacheStorage = async () => {
  const clearByPrefix = async (storage: CacheStorage, prefix?: string) => {
    const keys = await storage.getKeys(prefix);
    await storage.removeItems(keys);
  };

  await Promise.all([
    clearByPrefix(imageMetadataStorage, 'image_cache_'),
    clearByPrefix(profileImageStorage, 'profile_picture_'),
    clearByPrefix(financialDataCacheStorage, '@FinancialDataCache_'),
  ]);
};
