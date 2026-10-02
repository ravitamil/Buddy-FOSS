import appLogger from '../LoggerService';
import {financialDataCacheStorage} from '../storage/cacheStorage';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cacheKeyPrefix = '@FinancialDataCache';
const cacheDurationMs = 5 * 60 * 1000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCacheEntry = (value: unknown): value is CacheEntry<unknown> =>
  isRecord(value) && typeof value.timestamp === 'number' && 'data' in value;

export class FinancialDataCache {
  async set(key: string, data: unknown): Promise<void> {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };
      await financialDataCacheStorage.setItem(
        `${cacheKeyPrefix}_${key}`,
        JSON.stringify(cacheEntry),
      );
    } catch (error) {
      appLogger.error('Error caching data:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await financialDataCacheStorage.getItem(`${cacheKeyPrefix}_${key}`);
      if (!cached) {
        return null;
      }

      const cacheEntry: unknown = JSON.parse(cached);
      if (!isCacheEntry(cacheEntry)) {
        return null;
      }

      return Date.now() - cacheEntry.timestamp < cacheDurationMs ? (cacheEntry.data as T) : null;
    } catch (error) {
      appLogger.error('Error getting cached data:', error);
      return null;
    }
  }
}
