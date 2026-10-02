import {Button, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {router} from 'expo-router';
import {styled} from 'tamagui';

import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useFeatureAction} from '@/features/featureControls';
import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';

import type {AuthError} from '@/types/auth.types';

const toAuthError = (error: unknown): AuthError => {
  if (error instanceof Error) {
    return {
      code: 'email-auth-navigation-failed',
      message: error.message,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const errorRecord = error as Record<string, unknown>;
    return {
      code:
        typeof errorRecord.code === 'string' ? errorRecord.code : 'email-auth-navigation-failed',
      message:
        typeof errorRecord.message === 'string'
          ? errorRecord.message
          : 'Could not open email login',
    };
  }

  return {
    code: 'email-auth-navigation-failed',
    message: 'Could not open email login',
  };
};

interface EmailAuthButtonProps {
  onError?: (error: AuthError) => void;
  disabled?: boolean;
}

export const EmailAuthButton: React.FC<EmailAuthButtonProps> = ({onError, disabled = false}) => {
  const {showAlert} = useAlert();
  const emailSignIn = useFeatureAction('auth.emailSignIn');

  if (emailSignIn.status === 'hidden' || emailSignIn.status === 'disabled') {
    return null;
  }

  const handleEmailAuth = () => {
    if (!emailSignIn.isAllowed) {
      showAlert({
        title: 'Email Login Unavailable',
        message: emailSignIn.message ?? 'Email login is currently unavailable.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    try {
      router.push('/email-login');
    } catch (error) {
      appLogger.error('EmailAuthButton: Navigation error:', error);
      onError?.(toAuthError(error));
    }
  };

  return (
    <Button
      variant="outline"
      height={50}
      borderRadius={14}
      backgroundColor="$glassSurfaceFill"
      borderColor="$glassSurfaceBorder"
      borderWidth={1}
      pressStyle={{scale: 0.98, opacity: 0.8}}
      onPress={handleEmailAuth}
      disabled={disabled || !emailSignIn.isAllowed}
      opacity={disabled || !emailSignIn.isAllowed ? 0.55 : 1}
      leftIcon={<ThemedIonicon name="mail-outline" size={20} color="$color" />}>
      <Text color="$color" fontWeight="600" fontSize="$4">
        Continue with Email
      </Text>
    </Button>
  );
};

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
