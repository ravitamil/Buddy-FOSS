import {Image} from 'expo-image';
import {documentDirectory, fileSystem as FileSystem} from './filesystem/fileSystemAdapter';
import appLogger from './LoggerService';
import {imageMetadataStorage} from './storage/cacheStorage';

// Alias exported logger instance to match existing call sites

interface CachedImage {
  uri: string;
  localUri: string;
  timestamp: number;
  size: number;
}

const isCachedImage = (value: unknown): value is CachedImage => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const cachedImage = value as Record<string, unknown>;
  return (
    typeof cachedImage.uri === 'string' &&
    typeof cachedImage.localUri === 'string' &&
    typeof cachedImage.timestamp === 'number' &&
    typeof cachedImage.size === 'number'
  );
};

const parseCachedImage = (cachedData: string): CachedImage | null => {
  const parsed: unknown = JSON.parse(cachedData);
  return isCachedImage(parsed) ? parsed : null;
};

class ImageCacheService {
  private static instance: ImageCacheService;
  private cacheDir: string;
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB
  private cacheExpiry: number = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor() {
    this.cacheDir = `${documentDirectory}image-cache/`;
    void this.initializeCache();
  }

  static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  private async initializeCache() {
    try {
      // Create cache directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, {intermediates: true});
      }

      // Clean up expired cache entries
      await this.cleanupExpiredCache();
    } catch (error) {
      appLogger.warn('ImageCacheService: Error initializing cache', error);
    }
  }

  /**
   * Cache an image from URI
   */
  async cacheImage(uri: string): Promise<string> {
    try {
      // Check if already cached
      const cachedImage = await this.getCachedImage(uri);
      if (cachedImage) {
        return cachedImage.localUri;
      }

      // Generate unique filename
      const fileName = this.generateFileName(uri);
      const localUri = `${this.cacheDir}${fileName}`;

      // Download and cache the image
      const downloadResult = await FileSystem.downloadAsync(uri, localUri);

      if (downloadResult.status === 200) {
        // Store cache metadata
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        const cachedImageInfo: CachedImage = {
          uri,
          localUri,
          timestamp: Date.now(),
          size: fileInfo.exists ? fileInfo.size : 0,
        };

        await this.storeCacheMetadata(uri, cachedImageInfo);
        await this.enforceSizeLimit();

        return localUri;
      } else {
        throw new Error(`Failed to download image: ${downloadResult.status}`);
      }
    } catch (error) {
      appLogger.warn('ImageCacheService: Error caching image', error);
      throw error;
    }
  }

  /**
   * Get cached image if available
   */
  private async getCachedImage(uri: string): Promise<CachedImage | null> {
    try {
      const cacheKey = this.getCacheKey(uri);
      const cachedData = await imageMetadataStorage.getItem(`image_cache_${cacheKey}`);

      if (cachedData) {
        const cachedImage = parseCachedImage(cachedData);
        if (!cachedImage) {
          await this.removeCacheMetadata(uri);
          return null;
        }

        // Check if cache is still valid
        if (Date.now() - cachedImage.timestamp < this.cacheExpiry) {
          // Check if file still exists
          const fileInfo = await FileSystem.getInfoAsync(cachedImage.localUri);
          if (fileInfo.exists) {
            return cachedImage;
          } else {
            // Clean up stale cache entry
            await this.removeCacheMetadata(uri);
          }
        } else {
          // Remove expired cache entry
          await this.removeCacheMetadata(uri);
          await FileSystem.deleteAsync(cachedImage.localUri, {idempotent: true});
        }
      }

      return null;
    } catch (error) {
      appLogger.warn('ImageCacheService: Error getting cached image', error);
      return null;
    }
  }

  /**
   * Preload images for better performance
   */
  async preloadImages(uris: string[]): Promise<void> {
    try {
      // Preload images with low priority
      await Promise.all(
        uris.map((uri) =>
          Image.prefetch(uri).catch((error) => {
            appLogger.warn('ImageCacheService: Error preloading image', uri, error);
          }),
        ),
      );
    } catch (error) {
      appLogger.warn('ImageCacheService: Error preloading images', error);
    }
  }

  /**
   * Clear all cached images
   */
  async clearCache(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.cacheDir, {idempotent: true});
        await FileSystem.makeDirectoryAsync(this.cacheDir, {intermediates: true});
      }

      // Clear all cache metadata
      const imageCacheKeys = await imageMetadataStorage.getKeys('image_cache_');
      await imageMetadataStorage.removeItems(imageCacheKeys);
    } catch (error) {
      appLogger.warn('ImageCacheService: Error clearing cache', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      let totalSize = 0;
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);

      if (dirInfo.exists && dirInfo.isDirectory) {
        const files = await FileSystem.readDirectoryAsync(this.cacheDir);
        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(`${this.cacheDir}${file}`);
          if (fileInfo.exists && !fileInfo.isDirectory) {
            totalSize += fileInfo.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      appLogger.warn('ImageCacheService: Error getting cache size', error);
      return 0;
    }
  }

  /**
   * Clean up expired cache entries
   */
  private async cleanupExpiredCache(): Promise<void> {
    try {
      const imageCacheKeys = await imageMetadataStorage.getKeys('image_cache_');

      for (const key of imageCacheKeys) {
        const cachedData = await imageMetadataStorage.getItem(key);
        if (cachedData) {
          const cachedImage = parseCachedImage(cachedData);
          if (!cachedImage) {
            await imageMetadataStorage.removeItem(key);
            continue;
          }

          if (Date.now() - cachedImage.timestamp >= this.cacheExpiry) {
            // Remove expired entry
            await imageMetadataStorage.removeItem(key);
            await FileSystem.deleteAsync(cachedImage.localUri, {idempotent: true});
          }
        }
      }
    } catch (error) {
      appLogger.warn('ImageCacheService: Error cleaning up expired cache', error);
    }
  }

  /**
   * Enforce maximum cache size limit
   */
  private async enforceSizeLimit(): Promise<void> {
    try {
      const currentSize = await this.getCacheSize();
      if (currentSize > this.maxCacheSize) {
        // Get all cached images sorted by timestamp (oldest first)
        const imageCacheKeys = await imageMetadataStorage.getKeys('image_cache_');

        const cachedImages: CachedImage[] = [];
        for (const key of imageCacheKeys) {
          const cachedData = await imageMetadataStorage.getItem(key);
          if (cachedData) {
            const cachedImage = parseCachedImage(cachedData);
            if (cachedImage) {
              cachedImages.push(cachedImage);
            } else {
              await imageMetadataStorage.removeItem(key);
            }
          }
        }

        cachedImages.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest entries until we're under the limit
        let removedSize = 0;
        for (const cachedImage of cachedImages) {
          if (currentSize - removedSize <= this.maxCacheSize * 0.8) {
            break;
          }

          await imageMetadataStorage.removeItem(`image_cache_${this.getCacheKey(cachedImage.uri)}`);
          await FileSystem.deleteAsync(cachedImage.localUri, {idempotent: true});
          removedSize += cachedImage.size;
        }
      }
    } catch (error) {
      appLogger.warn('ImageCacheService: Error enforcing size limit', error);
    }
  }

  /**
   * Store cache metadata
   */
  private async storeCacheMetadata(uri: string, metadata: CachedImage): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(uri);
      await imageMetadataStorage.setItem(`image_cache_${cacheKey}`, JSON.stringify(metadata));
    } catch (error) {
      appLogger.warn('ImageCacheService: Error storing cache metadata', error);
    }
  }

  /**
   * Remove cache metadata
   */
  private async removeCacheMetadata(uri: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(uri);
      await imageMetadataStorage.removeItem(`image_cache_${cacheKey}`);
    } catch (error) {
      appLogger.warn('ImageCacheService: Error removing cache metadata', error);
    }
  }

  /**
   * Generate cache key from URI
   */
  private getCacheKey(uri: string): string {
    return uri.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Generate filename from URI
   */
  private generateFileName(uri: string): string {
    const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const hash = this.simpleHash(uri);
    return `${hash}.${extension}`;
  }

  /**
   * Simple hash function for generating filenames
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export const imageCacheService = ImageCacheService.getInstance();
