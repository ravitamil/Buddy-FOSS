import AsyncStorage from '@react-native-async-storage/async-storage';
import {fileSystem as FileSystem, documentDirectory} from './filesystem/fileSystemAdapter';

/**
 * Local Profile Service
 * Manages profile pictures using local storage and file system
 */
export class LocalProfileService {
  private static readonly STORAGE_KEY_PREFIX = 'profile_picture_';
  private static readonly PROFILE_DIR = `${documentDirectory}profile_pictures/`;

  /**
   * Initialize profile pictures directory
   */
  static async initializeDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.PROFILE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.PROFILE_DIR, {intermediates: true});
        appLogger.debug('LocalProfileService: Profile pictures directory created');
      }
    } catch (error) {
      appLogger.error('LocalProfileService: Error creating directory:', error);
    }
  }

  /**
   * Save profile picture locally
   */
  static async saveProfilePicture(userId: string, imageUri: string): Promise<string> {
    try {
      await this.initializeDirectory();

      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      const localUri = `${this.PROFILE_DIR}${fileName}`;

      // Copy the image to app's profile pictures directory
      await FileSystem.copyAsync({
        from: imageUri,
        to: localUri,
      });

      // Delete old profile picture if exists
      const oldImageUri = await this.getProfilePictureUri(userId);
      if (oldImageUri) {
        await this.deleteProfilePicture(oldImageUri);
      }

      // Save the local file path to AsyncStorage
      await AsyncStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, localUri);

      appLogger.debug('LocalProfileService: Profile picture saved:', localUri);
      return localUri;
    } catch (error) {
      appLogger.error('LocalProfileService: Error saving profile picture:', error);
      throw error;
    }
  }

  /**
   * Get profile picture URI from storage
   */
  static async getProfilePictureUri(userId: string): Promise<string | null> {
    try {
      const uri = await AsyncStorage.getItem(`${this.STORAGE_KEY_PREFIX}${userId}`);

      if (uri) {
        // Check if file still exists
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          return uri;
        } else {
          // File doesn't exist, remove from storage
          await AsyncStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
          return null;
        }
      }

      return null;
    } catch (error) {
      appLogger.error('LocalProfileService: Error getting profile picture URI:', error);
      return null;
    }
  }

  /**
   * Delete profile picture
   */
  static async deleteProfilePicture(imageUri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(imageUri);
        appLogger.debug('LocalProfileService: Profile picture deleted:', imageUri);
      }
    } catch (error) {
      appLogger.error('LocalProfileService: Error deleting profile picture:', error);
    }
  }

  /**
   * Remove profile picture for user
   */
  static async removeUserProfilePicture(userId: string): Promise<void> {
    try {
      const uri = await this.getProfilePictureUri(userId);
      if (uri) {
        await this.deleteProfilePicture(uri);
        await AsyncStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
        appLogger.debug('LocalProfileService: User profile picture removed');
      }
    } catch (error) {
      appLogger.error('LocalProfileService: Error removing user profile picture:', error);
    }
  }

  /**
   * Get storage usage for all profile pictures
   */
  static async getStorageUsage(): Promise<number> {
    try {
      await this.initializeDirectory();

      const dirContents = await FileSystem.readDirectoryAsync(this.PROFILE_DIR);
      let totalSize = 0;

      for (const fileName of dirContents) {
        const filePath = `${this.PROFILE_DIR}${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && 'size' in fileInfo && fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      appLogger.error('LocalProfileService: Error calculating storage usage:', error);
      return 0;
    }
  }

  /**
   * Clean up orphaned profile pictures
   */
  static async cleanupOrphanedPictures(): Promise<void> {
    try {
      await this.initializeDirectory();

      const dirContents = await FileSystem.readDirectoryAsync(this.PROFILE_DIR);
      const allKeys = await AsyncStorage.getAllKeys();
      const profileKeys = allKeys.filter((key) => key.startsWith(this.STORAGE_KEY_PREFIX));

      // Get all stored URIs
      const storedUris = new Set<string>();
      for (const key of profileKeys) {
        const uri = await AsyncStorage.getItem(key);
        if (uri) {
          storedUris.add(uri);
        }
      }

      // Delete files not referenced in AsyncStorage
      for (const fileName of dirContents) {
        const filePath = `${this.PROFILE_DIR}${fileName}`;
        if (!storedUris.has(filePath)) {
          await FileSystem.deleteAsync(filePath);
          appLogger.debug('LocalProfileService: Cleaned up orphaned file:', fileName);
        }
      }
    } catch (error) {
      appLogger.error('LocalProfileService: Error cleaning up orphaned pictures:', error);
    }
  }

  /**
   * Check if profile picture exists for user
   */
  static async hasProfilePicture(userId: string): Promise<boolean> {
    const uri = await this.getProfilePictureUri(userId);
    return uri !== null;
  }

  /**
   * Get profile picture file size
   */
  static async getProfilePictureSize(userId: string): Promise<number> {
    try {
      const uri = await this.getProfilePictureUri(userId);
      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        return fileInfo.exists && 'size' in fileInfo ? fileInfo.size || 0 : 0;
      }
      return 0;
    } catch (error) {
      appLogger.error('LocalProfileService: Error getting profile picture size:', error);
      return 0;
    }
  }

  /**
   * Export profile picture (for backup or sharing)
   */
  static async exportProfilePicture(userId: string, destinationUri: string): Promise<boolean> {
    try {
      const sourceUri = await this.getProfilePictureUri(userId);
      if (sourceUri) {
        await FileSystem.copyAsync({
          from: sourceUri,
          to: destinationUri,
        });
        return true;
      }
      return false;
    } catch (error) {
      appLogger.error('LocalProfileService: Error exporting profile picture:', error);
      return false;
    }
  }
}

export default LocalProfileService;
