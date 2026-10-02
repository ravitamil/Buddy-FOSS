import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@/lib/query-keys';
import {StorageService} from '@/services/storage';
import {logger as appLogger} from '@/services/LoggerService';
import {userProfileDatabaseService} from '@/services/UserProfileDatabaseService';
import {AuthMethod, type User, type UserProfile} from '@/types/context-foundation';
import {useAuth} from './AuthContext';
import {markStartupPhase} from '@/services/StartupTelemetry';

export interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const logger = appLogger.contextLogger('UserContext');

const getAuthMethod = (user: User): AuthMethod =>
  user.isAnonymous
    ? AuthMethod.ANONYMOUS
    : user.phoneNumber
      ? AuthMethod.PHONE
      : user.authProvider === 'email'
        ? AuthMethod.EMAIL
        : AuthMethod.GOOGLE;

const createDefaultProfile = (user: User): UserProfile => ({
  id: user.uid,
  firstName: null,
  lastName: null,
  displayName: user.displayName?.trim() || null,
  dateOfBirth: null,
  profilePictureUri: user.photoURL,
  mobileNumber: user.phoneNumber,
  emailAddress: user.email,
  authMethod: getAuthMethod(user),
  isOnboardingComplete: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const restoreCachedProfile = async (userId: string): Promise<UserProfile | null> => {
  const cached = await StorageService.getCachedProfile(userId);
  if (!cached) return null;

  return {
    ...cached,
    createdAt: new Date(cached.createdAt),
    updatedAt: new Date(cached.updatedAt),
    dateOfBirth: cached.dateOfBirth ? new Date(cached.dateOfBirth) : null,
  };
};

const cacheProfile = async (userId: string, profile: UserProfile): Promise<void> => {
  try {
    await StorageService.setCachedProfile(userId, {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      dateOfBirth: profile.dateOfBirth?.toISOString() ?? null,
    });
  } catch (error) {
    logger.warn('Failed to cache user profile; continuing with in-memory profile', error);
  }
};

const normalizeProfileDates = (profile: UserProfile): UserProfile => ({
  ...profile,
  createdAt: profile.createdAt instanceof Date ? profile.createdAt : new Date(profile.createdAt),
  updatedAt: profile.updatedAt instanceof Date ? profile.updatedAt : new Date(profile.updatedAt),
  dateOfBirth:
    profile.dateOfBirth instanceof Date
      ? profile.dateOfBirth
      : profile.dateOfBirth
        ? new Date(profile.dateOfBirth)
        : null,
});

const loadProfile = async (user: User): Promise<UserProfile> => {
  const cachedProfile = await restoreCachedProfile(user.uid);

  try {
    const remoteProfile = await userProfileDatabaseService.getUserProfile(user.uid);
    if (!remoteProfile) {
      const fallback = cachedProfile ?? createDefaultProfile(user);
      await cacheProfile(user.uid, fallback);
      return fallback;
    }

    const profile: UserProfile = {
      id: user.uid,
      firstName: remoteProfile.firstName ?? null,
      lastName: remoteProfile.lastName ?? null,
      displayName: remoteProfile.displayName ?? null,
      dateOfBirth: remoteProfile.dateOfBirth,
      profilePictureUri: remoteProfile.profilePictureUri ?? null,
      cinId: remoteProfile.cinId,
      mobileNumber: remoteProfile.phoneNumber ?? user.phoneNumber,
      emailAddress: remoteProfile.email ?? user.email,
      authMethod: getAuthMethod(user),
      isOnboardingComplete: remoteProfile.isOnboardingComplete ?? false,
      createdAt: remoteProfile.createdAt ? new Date(remoteProfile.createdAt) : new Date(),
      updatedAt: remoteProfile.updatedAt ? new Date(remoteProfile.updatedAt) : new Date(),
    };

    await cacheProfile(user.uid, profile);
    return profile;
  } catch (error) {
    if (cachedProfile) return cachedProfile;
    throw error;
  }
};

const saveProfile = async (
  user: User,
  currentProfile: UserProfile | null,
  updates: Partial<UserProfile>,
): Promise<UserProfile> => {
  const updatedProfile: UserProfile = {
    ...(currentProfile ?? createDefaultProfile(user)),
    ...updates,
    id: user.uid,
    updatedAt: new Date(),
  };

  if (updates.isOnboardingComplete === true || currentProfile?.isOnboardingComplete === true) {
    await userProfileDatabaseService.saveUserProfile(user.uid, {
      firstName: updatedProfile.firstName?.trim() || undefined,
      lastName: updatedProfile.lastName?.trim() || undefined,
      displayName: updatedProfile.displayName?.trim() || undefined,
      dateOfBirth: updatedProfile.dateOfBirth?.toISOString(),
      profilePictureUri: updatedProfile.profilePictureUri || undefined,
      phoneNumber: updatedProfile.mobileNumber || undefined,
      email: updatedProfile.emailAddress || undefined,
      authMethod: updatedProfile.authMethod || undefined,
      isOnboardingComplete: updatedProfile.isOnboardingComplete,
    });
  }

  await cacheProfile(user.uid, updatedProfile);
  return updatedProfile;
};

export const UserProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {user, isAuthenticated} = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.uid ?? '';
  const profileKey = queryKeys.users.detail(userId);

  const profileQuery = useQuery<UserProfile, Error>({
    queryKey: profileKey,
    queryFn: () => loadProfile(user!),
    enabled: isAuthenticated && Boolean(user),
    select: normalizeProfileDates,
  });

  React.useEffect(() => {
    if (profileQuery.data) {
      markStartupPhase('profile_ready');
    }
  }, [profileQuery.data]);

  const updateMutation = useMutation<
    UserProfile,
    Error,
    Partial<UserProfile>,
    {previousProfile: UserProfile | null}
  >({
    mutationFn: (updates) => {
      if (!user) throw new Error('No authenticated user');
      return saveProfile(user, profileQuery.data ?? null, updates);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({queryKey: profileKey});
      const previousProfile = queryClient.getQueryData<UserProfile>(profileKey) ?? null;

      if (user) {
        queryClient.setQueryData<UserProfile>(profileKey, {
          ...(previousProfile ?? createDefaultProfile(user)),
          ...updates,
          updatedAt: new Date(),
        });
      }

      return {previousProfile};
    },
    onError: (_error, _updates, context) => {
      queryClient.setQueryData(profileKey, context?.previousProfile ?? null);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKey, profile);
    },
  });

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<void> => {
      await updateMutation.mutateAsync(updates);
    },
    [updateMutation],
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (userId) {
      await queryClient.invalidateQueries({queryKey: profileKey});
    }
  }, [profileKey, queryClient, userId]);

  const contextValue = useMemo<UserContextType>(
    () => ({
      profile: profileQuery.data ?? null,
      isLoading: profileQuery.isLoading,
      error: profileQuery.error?.message ?? null,
      updateProfile,
      refreshProfile,
    }),
    [profileQuery.data, profileQuery.error, profileQuery.isLoading, refreshProfile, updateProfile],
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserContext;
