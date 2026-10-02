import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {useAuth, useSettings, useUser} from '@/context';
import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';
import {StorageService} from '@/services/storage';
import {SupabaseStorageService} from '@/services/SupabaseStorageService';
import {UnifiedAuthService} from '@/services/UnifiedAuthService';
import {AuthMethod} from '@/types/context-foundation';
import type {OnboardingProfileData, OnboardingScreenModel} from '../types';
import {getOnboardingStepErrors} from './onboardingStepValidation';
import {
  createEmptyOnboardingProfile,
  isLocalProfilePictureUri,
  LAST_ONBOARDING_STEP,
  normalizeOnboardingAuthMethod,
  sanitizeOnboardingInput,
} from '../utils';

const logger = appLogger.contextLogger('MultiStepOnboardingScreen');

const getCurrentFirebaseUser = () => UnifiedAuthService.getInstance().getCurrentUserSync();

export function useMultiStepOnboardingScreen(): OnboardingScreenModel {
  const {showAlert} = useAlert();
  const router = useRouter();
  const {updateCurrency, updateGroupCurrency} = useSettings();
  const {user} = useAuth();
  const {updateProfile} = useUser();
  const hasAutoPopulated = useRef(false);

  const params = useLocalSearchParams();
  const {authMethod: paramAuthMethod, email: paramEmail, phoneNumber: paramPhoneNumber} = params;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingProfileData>(createEmptyOnboardingProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const firebaseUser = getCurrentFirebaseUser();
  const currentPhoneNumber = firebaseUser?.phoneNumber || null;
  const currentEmail = firebaseUser?.email || null;
  const contextAuthMethod = user?.phoneNumber
    ? 'phone'
    : user?.authProvider === 'email'
      ? 'email'
      : user?.email
        ? 'google'
        : null;

  const authMethod = useMemo(() => {
    const paramNormalized = normalizeOnboardingAuthMethod(paramAuthMethod);
    if (paramNormalized) return paramNormalized;
    if (currentPhoneNumber) return AuthMethod.PHONE;
    if (currentEmail) {
      return firebaseUser?.authProvider === 'email' ? AuthMethod.EMAIL : AuthMethod.GOOGLE;
    }
    return normalizeOnboardingAuthMethod(contextAuthMethod);
  }, [
    contextAuthMethod,
    currentEmail,
    currentPhoneNumber,
    firebaseUser?.authProvider,
    paramAuthMethod,
  ]);

  const email = useMemo(
    () => currentEmail || user?.email || (typeof paramEmail === 'string' ? paramEmail : null),
    [currentEmail, paramEmail, user?.email],
  );

  const phoneNumber = useMemo(
    () =>
      currentPhoneNumber ||
      user?.phoneNumber ||
      (typeof paramPhoneNumber === 'string' ? paramPhoneNumber : null),
    [currentPhoneNumber, paramPhoneNumber, user?.phoneNumber],
  );

  useEffect(() => {
    if (hasAutoPopulated.current || !user) return;

    const googleUser = UnifiedAuthService.getInstance().getLastGoogleUser();

    setFormData((prev) => {
      const updates: Partial<OnboardingProfileData> = {};

      if (!prev.mobileNumber && phoneNumber) updates.mobileNumber = phoneNumber;
      if (!prev.emailAddress && email) updates.emailAddress = email;

      const profilePic = user.photoURL || googleUser?.photo;
      if (!prev.profilePictureUri && profilePic) {
        updates.profilePictureUri = profilePic;
      }

      if (user.displayName || googleUser?.name) {
        const full = user.displayName || googleUser?.name || '';
        const names = full.split(' ');
        const firstName = googleUser?.givenName || names[0];
        const lastName =
          googleUser?.familyName || (names.length > 1 ? names.slice(1).join(' ') : '');

        if (!prev.firstName && firstName) updates.firstName = firstName;
        if (!prev.lastName && lastName) updates.lastName = lastName;
        if (!prev.displayName && firstName) updates.displayName = firstName;
      }

      const googleDob =
        user.dateOfBirth || (googleUser?.dateOfBirth ? new Date(googleUser.dateOfBirth) : null);
      if (googleDob && !isNaN(googleDob.getTime())) {
        updates.dateOfBirth = googleDob;
      }

      if (Object.keys(updates).length === 0) return prev;

      hasAutoPopulated.current = true;
      return {...prev, ...updates};
    });
  }, [email, phoneNumber, user]);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;

      const newErrors = {...prev};
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors = getOnboardingStepErrors(step, formData);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData],
  );

  const handleGoBack = useCallback(() => {
    const authService = UnifiedAuthService.getInstance();

    authService
      .signOut()
      .then(() => router.replace('/'))
      .catch((error) => {
        logger.error('Error signing out:', error);
        router.replace('/');
      });
  }, [router]);

  const uploadProfilePictureIfNeeded = useCallback(
    async (uri?: string) => {
      if (!uri || !isLocalProfilePictureUri(uri)) return uri;

      try {
        if (!user?.uid) throw new Error('User not authenticated for upload');

        logger.debug('Uploading profile picture before saving profile');
        const publicUrl = await SupabaseStorageService.uploadAvatar(user.uid, uri);
        logger.info('Uploaded avatar to Supabase:', publicUrl);
        return publicUrl;
      } catch (uploadError) {
        logger.error('Failed to upload profile picture:', uploadError);
        return uri;
      }
    },
    [user?.uid],
  );

  const saveUserData = useCallback(async () => {
    try {
      setIsLoading(true);

      const firstName = sanitizeOnboardingInput(formData.firstName, true);
      const lastName = sanitizeOnboardingInput(formData.lastName, true);
      const displayName = sanitizeOnboardingInput(formData.displayName || '', true);

      logger.debug('Setting auth data:', {authMethod, email, phoneNumber});
      logger.debug('Saving currencies via SettingsContext:', formData.currencyPreference);
      await Promise.all([
        updateCurrency(formData.currencyPreference),
        updateGroupCurrency(formData.currencyPreference),
      ]);

      await StorageService.savePreference('onboardingComplete', 'true');
      logger.debug('Onboarding completion flag saved to local storage');

      const finalProfilePictureUri = await uploadProfilePictureIfNeeded(formData.profilePictureUri);

      await updateProfile({
        firstName,
        lastName,
        displayName,
        dateOfBirth: formData.dateOfBirth,
        mobileNumber: formData.mobileNumber,
        emailAddress: formData.emailAddress,
        authMethod,
        isOnboardingComplete: true,
        profilePictureUri: finalProfilePictureUri,
      });

      logger.debug('All onboarding data saved successfully');
      return true;
    } catch (error) {
      logger.error('Profile save error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showAlert({
        title: 'Profile Save Failed',
        message: `Failed to save your profile: ${errorMessage}. Please check your internet connection and try again.`,
        actions: [{text: 'OK', style: 'default'}],
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    authMethod,
    email,
    formData,
    phoneNumber,
    showAlert,
    updateCurrency,
    updateGroupCurrency,
    updateProfile,
    uploadProfilePictureIfNeeded,
  ]);

  const handleSubmit = useCallback(async () => {
    logger.debug('Starting profile save process');
    const success = await saveUserData();

    if (success) {
      setShowSuccess(true);
    } else {
      logger.error('Onboarding save failed, not showing success screen');
    }
  }, [saveUserData]);

  const goToNextStep = useCallback(() => {
    logger.debug('goToNextStep called for step:', currentStep);

    if (!validateStep(currentStep)) {
      logger.warn('Step validation failed for step:', currentStep);
      return;
    }

    if (currentStep < LAST_ONBOARDING_STEP) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    void handleSubmit();
  }, [currentStep, handleSubmit, validateStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      return;
    }

    handleGoBack();
  }, [currentStep, handleGoBack]);

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      const sanitizedValue = sanitizeOnboardingInput(value);
      setFormData((prev) => ({...prev, [field]: sanitizedValue}));
      clearFieldError(field);
    },
    [clearFieldError],
  );

  const handleProfilePictureChange = useCallback((uri: string) => {
    setFormData((prev) => ({...prev, profilePictureUri: uri}));
  }, []);

  const handleDateChange = useCallback(
    (date: Date) => {
      setFormData((prev) => ({...prev, dateOfBirth: date}));
      clearFieldError('dateOfBirth');
    },
    [clearFieldError],
  );

  const handleCurrencyChange = useCallback(
    (currency: string) => {
      logger.debug('handleCurrencyChange called with currency:', currency);
      setFormData((prev) => ({...prev, currencyPreference: currency}));
      clearFieldError('currencyPreference');
    },
    [clearFieldError],
  );

  return {
    currentStep,
    formData,
    errors,
    authMethod,
    userId: user?.uid,
    goToNextStep,
    goToPreviousStep,
    handleGoBack,
    handleInputChange,
    handleProfilePictureChange,
    handleDateChange,
    handleCurrencyChange,
    showSuccess,
  };
}
