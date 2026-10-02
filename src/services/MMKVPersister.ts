import {MMKVLoader} from 'react-native-mmkv-storage';
import type {PersistedClient, Persister} from '@tanstack/query-persist-client-core';
import appLogger from './LoggerService';

const PERSISTENCE_KEY = 'buddy_query_cache';

/**
 * Creates a TanStack Query persister using an encrypted MMKV instance.
 */
export const createPersister = (): Persister => {
  try {
    // withEncryption generates and securely stores the instance key itself.
    const storage = new MMKVLoader().withInstanceID('query-cache').withEncryption().initialize();

    return {
      persistClient: (client: PersistedClient) => {
        storage.setMap(PERSISTENCE_KEY, client);
      },
      restoreClient: () => {
        return storage.getMap<PersistedClient>(PERSISTENCE_KEY) ?? undefined;
      },
      removeClient: () => {
        storage.removeItem(PERSISTENCE_KEY);
      },
    };
  } catch (error) {
    appLogger.error('Failed to create MMKV persister:', error);
    throw error;
  }
};

export const createNoopPersister = (): Persister => ({
  persistClient: () => undefined,
  restoreClient: () => undefined,
  removeClient: () => undefined,
});
