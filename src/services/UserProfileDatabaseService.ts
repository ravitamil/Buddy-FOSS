import {logger as appLogger} from './LoggerService';
import {UnifiedAuthService} from './UnifiedAuthService';
import {StorageService} from './storage';
import type {CachedProfile} from './storage/storageTypes';

const logger = appLogger.contextLogger('UserProfileDatabaseService');

type UserProfileUpdates = Record<string, unknown> & {
  email?: unknown;
  displayName?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phoneNumber?: unknown;
  profilePictureUri?: unknown;
  currency?: unknown;
  language?: unknown;
  theme?: unknown;
  isOnboardingComplete?: unknown;
  dateOfBirth?: unknown;
  notifications?: unknown;
};

type UserProfileResult = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  dateOfBirth: Date | null;
  phoneNumber?: string | null;
  cinId?: string;
  profilePictureUri?: string | null;
  currency?: string;
  language?: string;
  theme?: string;
  group_currency?: string;
  isOnboardingComplete?: boolean;
  notifications?: UserProfileNotificationSettings;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
};

type UserProfileNotificationSettings = {
  subscriptionReminders: boolean;
  loanReminders: boolean;
  reminderDaysBefore: number;
  dailyReminderTime: string;
  overdueReminders: boolean;
  successNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
};

type ProfileRow = Record<string, unknown> & {
  email?: unknown;
  first_name?: unknown;
  last_name?: unknown;
  full_name?: unknown;
  date_of_birth?: unknown;
  phone_number?: unknown;
  cin_id?: unknown;
  avatar_url?: unknown;
  currency?: unknown;
  language?: unknown;
  theme?: unknown;
  group_currency?: unknown;
  is_onboarding_complete?: unknown;
  is_pro_override?: unknown;
  notification_settings?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

type SupabaseErrorLike = {
  code?: string;
};

type SupabaseSingleResponse = {
  data: unknown;
  error: SupabaseErrorLike | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isSupabaseErrorLike = (value: unknown): value is SupabaseErrorLike =>
  isRecord(value) && (value.code === undefined || typeof value.code === 'string');

const getString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const getStringOrNull = (value: unknown): string | null | undefined =>
  value === null ? null : getString(value);

const getBoolean = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

const getDateInput = (value: unknown): string | number | Date | undefined =>
  typeof value === 'string' || typeof value === 'number' || value instanceof Date
    ? value
    : undefined;

const isUserProfileNotificationSettings = (
  value: unknown,
): value is UserProfileNotificationSettings => {
  if (!isRecord(value)) return false;

  return (
    typeof value.subscriptionReminders === 'boolean' &&
    typeof value.loanReminders === 'boolean' &&
    typeof value.reminderDaysBefore === 'number' &&
    typeof value.dailyReminderTime === 'string' &&
    typeof value.overdueReminders === 'boolean' &&
    typeof value.successNotifications === 'boolean' &&
    typeof value.pushNotifications === 'boolean' &&
    typeof value.emailNotifications === 'boolean'
  );
};

const toSupabaseSingleResponse = (value: unknown): SupabaseSingleResponse => {
  if (!isRecord(value)) {
    return {data: null, error: null};
  }

  return {
    data: value.data,
    error: isSupabaseErrorLike(value.error) ? value.error : null,
  };
};

const getCurrentUserId = (): string | undefined =>
  UnifiedAuthService.getInstance().getCurrentUserSync()?.uid;

export const userProfileDatabaseService = {
  async saveUserProfile(userId: string, updates: UserProfileUpdates): Promise<void> {
    try {
      if (!userId) {
        userId = getCurrentUserId() ?? '';
      }

      if (!userId) return;

      const targetUserId = userId || getCurrentUserId() || 'local_user';
      const cached = await StorageService.getCachedProfile(targetUserId);
      const existing: CachedProfile = cached || {
        id: targetUserId,
        displayName: 'Buddy User',
        firstName: null,
        lastName: null,
        mobileNumber: null,
        emailAddress: null,
        profilePictureUri: null,
        authMethod: null,
        isOnboardingComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dateOfBirth: null,
      };

      const updated: CachedProfile = {
        ...existing,
        id: targetUserId,
        displayName:
          typeof updates.displayName === 'string' ? updates.displayName : existing.displayName,
        firstName: typeof updates.firstName === 'string' ? updates.firstName : existing.firstName,
        lastName: typeof updates.lastName === 'string' ? updates.lastName : existing.lastName,
        mobileNumber:
          typeof updates.mobileNumber === 'string' ? updates.mobileNumber : existing.mobileNumber,
        emailAddress:
          typeof updates.emailAddress === 'string' ? updates.emailAddress : existing.emailAddress,
        profilePictureUri:
          typeof updates.profilePictureUri === 'string'
            ? updates.profilePictureUri
            : existing.profilePictureUri,
        authMethod: existing.authMethod,
        isOnboardingComplete:
          typeof updates.isOnboardingComplete === 'boolean'
            ? updates.isOnboardingComplete
            : existing.isOnboardingComplete,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
        dateOfBirth: existing.dateOfBirth,
      };

      await StorageService.setCachedProfile(targetUserId, updated);
    } catch (error) {
      logger.error('Error saving user profile:', error);
      throw error;
    }
  },

  async getUserProfile(userId?: string): Promise<UserProfileResult | null> {
    try {
      const targetUserId = userId || getCurrentUserId() || 'local_user';
      const cached = await StorageService.getCachedProfile(targetUserId);

      if (cached) {
        const extra = cached as CachedProfile & {
          currency?: string;
          language?: string;
          theme?: string;
          group_currency?: string;
        };

        return {
          displayName: cached.displayName || 'Buddy User',
          firstName: cached.firstName || null,
          lastName: cached.lastName || null,
          email: cached.emailAddress || null,
          phoneNumber: cached.mobileNumber || null,
          profilePictureUri: cached.profilePictureUri || null,
          currency: extra.currency || 'USD',
          language: extra.language || 'en',
          theme: extra.theme || 'system',
          group_currency: extra.group_currency || 'USD',
          isOnboardingComplete:
            cached.isOnboardingComplete !== undefined ? cached.isOnboardingComplete : true,
          dateOfBirth: cached.dateOfBirth ? new Date(cached.dateOfBirth) : null,
          createdAt: cached.createdAt ? new Date(cached.createdAt) : new Date(),
          updatedAt: cached.updatedAt ? new Date(cached.updatedAt) : new Date(),
        };
      }

      return {
        displayName: 'Buddy User',
        firstName: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        profilePictureUri: null,
        currency: 'USD',
        language: 'en',
        theme: 'system',
        group_currency: 'USD',
        isOnboardingComplete: true,
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Error getting user profile:', error);
      return null;
    }
  },
};
