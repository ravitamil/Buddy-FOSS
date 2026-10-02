import {useCallback, useEffect, useMemo, useState} from 'react';
import {router} from 'expo-router';

import {useAuth, useSettings, useUser} from '@/context';
import {useMembership} from '@/context/MembershipContext';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {useAlert} from '@/hooks/useAlert';
import {useProfilePicture} from '@/hooks/useProfilePicture';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {logger as appLogger} from '@/services/LoggerService';
import {UnifiedAuthService} from '@/services/UnifiedAuthService';

const logger = appLogger.contextLogger('ProfileSettingsScreen');

export interface ProfileSettingsData {
  firstName: string;
  lastName: string;
  displayName?: string;
  dateOfBirth: Date;
  currencyPreference: string;
  mobileNumber?: string;
  emailAddress?: string;
  profilePictureUri?: string | null;
}

export interface ProfileSettingsScreenModel {
  headerProps: ReturnType<typeof useProgressiveBlurHeader>['headerProps'];
  onScroll: ReturnType<typeof useProgressiveBlurHeader>['onScroll'];
  isDarkMode: boolean;
  isPro: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  authMethod: 'email' | 'phone' | 'google' | null;
  profileData: ProfileSettingsData;
  profileImageUri?: string | null;
  userId?: string;
  cinId?: string;
  initials: string;
  formattedDateOfBirth: string;
  displayName: string;
  updateField: <Key extends keyof ProfileSettingsData>(
    field: Key,
    value: ProfileSettingsData[Key],
  ) => void;
  updateDateOfBirth: (value: string | Date) => void;
  updateProfilePicture: (uri: string) => void;
  copyProfileId: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleLinkGoogle: () => Promise<void>;
  navigateToSubscription: () => void;
  navigateToPlanComparison: () => void;
  navigateBack: () => void;
}

const getAuthErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to link account.';

const formatDate = (date: unknown) => {
  if (!date) return '';
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  if (typeof date === 'string' || typeof date === 'number') {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return '';
};

const normalizeDateOfBirth = (date: unknown, fallback: Date) => {
  if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
  if (typeof date === 'string' || typeof date === 'number') {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
};

export function useProfileSettingsScreen(): ProfileSettingsScreenModel {
  logger.debug('Component rendering started');

  const {onScroll, headerProps} = useProgressiveBlurHeader({
    headerHeight: 75,
    showBackButtonInNonBlur: false,
  });

  const {isDarkMode} = useTamaguiTheme();
  const {isAnonymous, signInWithGoogle} = useAuth();
  const {currency, updateCurrency} = useSettings();
  const {profileImageUri, userId} = useProfilePicture();
  const {showAlert} = useAlert();
  const {profile, updateProfile} = useUser();
  const {isPro} = useMembership();

  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google' | null>(null);
  const [profileData, setProfileData] = useState<ProfileSettingsData>({
    firstName: '',
    lastName: '',
    displayName: '',
    dateOfBirth: new Date(),
    currencyPreference: currency,
    mobileNumber: '',
    emailAddress: '',
    profilePictureUri: null,
  });

  const initials = useMemo(() => {
    const first = profileData.firstName.trim().charAt(0);
    const last = profileData.lastName.trim().charAt(0);
    return `${first}${last}`.toUpperCase() || 'U';
  }, [profileData.firstName, profileData.lastName]);

  const syncProfileForm = useCallback(
    (
      fallbackPhone?: string | null,
      fallbackEmail?: string | null,
      fallbackName?: string | null,
    ) => {
      if (profile) {
        setProfileData((previous) => ({
          ...previous,
          firstName: profile.firstName || previous.firstName,
          lastName: profile.lastName || previous.lastName,
          displayName: profile.displayName || previous.displayName,
          dateOfBirth: normalizeDateOfBirth(profile.dateOfBirth, previous.dateOfBirth),
          mobileNumber: profile.mobileNumber || fallbackPhone || previous.mobileNumber,
          emailAddress: profile.emailAddress || fallbackEmail || previous.emailAddress,
          profilePictureUri: profile.profilePictureUri || previous.profilePictureUri,
        }));
        return;
      }

      setProfileData((previous) => ({
        ...previous,
        firstName: fallbackName?.split(' ')[0] || previous.firstName,
        lastName: fallbackName?.split(' ').slice(1).join(' ') || previous.lastName,
        displayName: previous.displayName,
        currencyPreference: currency,
        mobileNumber: fallbackPhone || previous.mobileNumber,
        emailAddress: fallbackEmail || previous.emailAddress,
        profilePictureUri: previous.profilePictureUri,
      }));
    },
    [currency, profile],
  );

  const loadProfileData = useCallback(() => {
    logger.debug('Loading profile data');
    setIsLoading(true);

    try {
      const authUser = UnifiedAuthService.getInstance().getCurrentUserSync();
      if (!authUser) return;

      setAuthMethod(
        authUser.phoneNumber ? 'phone' : authUser.authProvider === 'email' ? 'email' : 'google',
      );
      syncProfileForm(authUser.phoneNumber, authUser.email, authUser.displayName);
    } catch (error) {
      logger.error('Error loading profile data', error);
      showAlert({
        title: 'Error',
        message: 'Failed to load profile data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, syncProfileForm]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    if (profile) {
      syncProfileForm();
    }
  }, [profile, syncProfileForm]);

  const updateField = useCallback(
    <Key extends keyof ProfileSettingsData>(field: Key, value: ProfileSettingsData[Key]) => {
      setProfileData((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    [],
  );

  const updateDateOfBirth = useCallback(
    (value: string | Date) => {
      const date = value instanceof Date ? value : new Date(value);
      if (!Number.isNaN(date.getTime())) {
        updateField('dateOfBirth', date);
      }
    },
    [updateField],
  );

  const updateProfilePicture = useCallback(
    (uri: string) => {
      updateField('profilePictureUri', uri);
      if (profile) {
        void updateProfile({profilePictureUri: uri});
      }
    },
    [profile, updateField, updateProfile],
  );

  const copyProfileId = useCallback(async () => {
    if (!profile?.cinId) return;

    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(profile.cinId);
    showAlert({title: 'Copied', message: 'Profile ID copied to clipboard!'});
  }, [profile?.cinId, showAlert]);

  const handleSave = useCallback(async () => {
    logger.debug('Saving profile data');
    setIsLoading(true);

    try {
      if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
        showAlert({
          title: 'Validation Error',
          message: 'First name and last name are required.',
        });
        return;
      }

      const authUser = UnifiedAuthService.getInstance().getCurrentUserSync();
      if (!authUser) return;

      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: profileData.displayName,
        dateOfBirth: profileData.dateOfBirth,
      });

      logger.debug('Profile saved via UserContext');

      if (profileData.currencyPreference !== currency) {
        await updateCurrency(profileData.currencyPreference);
      }

      showAlert({
        title: 'Success',
        message: 'Profile updated successfully!',
        actions: [{text: 'OK', onPress: () => router.back(), variant: 'success'}],
      });
    } catch (error) {
      logger.error('Error saving profile data', error);
      showAlert({
        title: 'Error',
        message: 'Failed to save profile data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currency, profileData, showAlert, updateCurrency, updateProfile]);

  const handleLinkGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      showAlert({
        title: 'Success',
        message: 'Account linked successfully!',
        actions: [{text: 'OK', variant: 'success'}],
      });
    } catch (error) {
      logger.error('Error linking account', error);
      showAlert({
        title: 'Link Failed',
        message: getAuthErrorMessage(error),
        actions: [{text: 'OK'}],
      });
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, signInWithGoogle]);

  const displayName = useMemo(() => {
    if (profileData.displayName?.trim()) {
      return profileData.displayName.trim();
    }
    const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
    return fullName || 'Buddy User';
  }, [profileData.displayName, profileData.firstName, profileData.lastName]);

  return {
    headerProps,
    onScroll,
    isDarkMode,
    isPro,
    isAnonymous,
    isLoading,
    isInitialLoading: isLoading && !profileData.firstName,
    showDatePicker,
    setShowDatePicker,
    authMethod,
    profileData,
    profileImageUri,
    userId,
    cinId: profile?.cinId,
    initials,
    formattedDateOfBirth: formatDate(profileData.dateOfBirth),
    displayName,
    updateField,
    updateDateOfBirth,
    updateProfilePicture,
    copyProfileId,
    handleSave,
    handleLinkGoogle,
    navigateToSubscription: () => router.push(isPro ? '/customer-center' : '/paywall'),
    navigateToPlanComparison: () => router.push('/plan-comparison'),
    navigateBack: () => router.back(),
  };
}
