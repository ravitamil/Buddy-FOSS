import {Button} from '@ravitamil/buddy-ui';
/**
 * Phone Authentication Button Component
 * Modern, simplified button that navigates to phone input screen
 */

import React from 'react';
import {styled} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {router} from 'expo-router';
import {isWeb} from '@tamagui/constants';

import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';
import type {AuthError} from '@/types/auth.types';
import {useFeatureAction} from '@/features/featureControls';

const toAuthError = (error: unknown): AuthError => {
  if (error instanceof Error) {
    return {
      code: 'phone-auth-navigation-failed',
      message: error.message,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const errorRecord = error as Record<string, unknown>;
    return {
      code:
        typeof errorRecord.code === 'string' ? errorRecord.code : 'phone-auth-navigation-failed',
      message:
        typeof errorRecord.message === 'string'
          ? errorRecord.message
          : 'Could not open phone authentication',
    };
  }

  return {
    code: 'phone-auth-navigation-failed',
    message: 'Could not open phone authentication',
  };
};

interface PhoneAuthButtonProps {
  onError?: (error: AuthError) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const PhoneAuthButton: React.FC<PhoneAuthButtonProps> = ({
  onError,
  disabled = false,
  compact = false,
}) => {
  const {showAlert} = useAlert();
  const phoneSignIn = useFeatureAction('auth.phoneSignIn');

  if (phoneSignIn.status === 'hidden' || phoneSignIn.status === 'disabled') {
    return null;
  }

  const handlePhoneAuth = () => {
    if (!phoneSignIn.isAllowed) {
      showAlert({
        title: 'Phone Authentication Unavailable',
        message: phoneSignIn.message ?? 'Phone authentication is currently unavailable.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    // Check if platform is web
    if (isWeb) {
      showAlert({
        title: 'Phone Authentication Unavailable',
        message:
          'Phone authentication is currently only available on mobile devices. Please use Google Sign-In or create an anonymous account.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    try {
      // Navigate immediately without delay for faster performance
      router.push('/phone-input');
    } catch (error) {
      appLogger.error('PhoneAuthButton: Navigation error:', error);
      onError?.(toAuthError(error));
    }
  };

  // Optimized Tamagui Button for better performance
  return (
    <Button
      variant={compact ? 'ghost' : 'outline'}
      size={compact ? 'small' : 'large'}
      onPress={handlePhoneAuth}
      disabled={disabled || !phoneSignIn.isAllowed}
      opacity={disabled || !phoneSignIn.isAllowed ? 0.55 : 1}
      leftIcon={<ThemedIonicon name="call-outline" size={20} color="$color" />}>
      {compact ? 'Use phone instead' : 'Continue with Phone'}
    </Button>
  );
};

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
