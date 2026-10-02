import {offlineDataStorage} from './cacheStorage';

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await offlineDataStorage.setItem(key, JSON.stringify(value));
}

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  const data = await offlineDataStorage.getItem(key);
  if (!data) return fallback;
  try {
    const parsed: unknown = JSON.parse(data);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export async function deleteStorageKey(key: string): Promise<void> {
  await offlineDataStorage.removeItem(key);
}

export async function deleteStorageKeys(keys: readonly string[]): Promise<void> {
  await offlineDataStorage.removeItems(keys as string[]);
}
