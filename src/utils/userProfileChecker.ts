import appLogger from '../services/LoggerService';
import {userProfileDatabaseService} from '../services/UserProfileDatabaseService';

export interface UserProfileStatus {
  hasProfile: boolean;
  needsOnboarding: boolean;
  userId: string;
}

/**
 * Check if user has completed onboarding and has a profile
 * @param userId - User ID (Supabase UID)
 * @returns UserProfileStatus with profile completion information
 */
export async function checkUserProfileStatus(userId: string): Promise<UserProfileStatus> {
  appLogger.debug('🔍 checkUserProfileStatus: Starting profile check for user:', userId);

  if (!userId) {
    // This is expected during sign-out or initial load, no need to error
    appLogger.debug('🔍 checkUserProfileStatus: No userId provided, returning default state');
    return {
      hasProfile: false,
      needsOnboarding: true,
      userId: userId || 'unknown',
    };
  }

  // intentionally no try-catch here - we want errors to propagate to AuthGuard
  // so that it can trigger retry logic instead of assuming "needs onboarding"

  appLogger.debug('🔍 checkUserProfileStatus: Fetching profile from Supabase...');

  const profile = await userProfileDatabaseService.getUserProfile(userId);

  if (!profile) {
    appLogger.debug('🔍 checkUserProfileStatus: No profile found in Supabase');
    return {
      hasProfile: false,
      needsOnboarding: true,
      userId,
    };
  }

  const hasProfileData =
    profile.firstName && profile.lastName && profile.isOnboardingComplete === true;

  const result = {
    hasProfile: !!hasProfileData,
    needsOnboarding: !hasProfileData,
    userId,
  };

  appLogger.debug('🔍 checkUserProfileStatus: Final result:', result);
  return result;
}

/**
 * Check if user is authenticated and has completed onboarding
 * @param userId - Firebase user ID
 * @returns boolean indicating if user can access main app
 */
export async function canUserAccessMainApp(userId: string): Promise<boolean> {
  appLogger.debug('🔐 canUserAccessMainApp: Checking access for user:', userId);

  try {
    const profileStatus = await checkUserProfileStatus(userId);
    const canAccess = profileStatus.hasProfile && !profileStatus.needsOnboarding;

    appLogger.debug('🔐 canUserAccessMainApp: Access result:', {
      canAccess,
      hasProfile: profileStatus.hasProfile,
      needsOnboarding: profileStatus.needsOnboarding,
    });

    return canAccess;
  } catch (error) {
    appLogger.error('❌ canUserAccessMainApp: Error checking user access:', error);
    return false;
  }
}
