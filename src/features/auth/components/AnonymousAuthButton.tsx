/**
 * Anonymous Authentication Button Component
 * Modern, offline-first sign-in for FOSS Community Edition
 */

import React, {useState} from 'react';
import {Button, Card} from '@ravitamil/buddy-ui';
import {YStack, styled, useTheme} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useAuth} from '@/context/AuthContext';
import {AuthError} from '@/types/auth.types';
import {useAlert} from '@/hooks/useAlert';
import {Dialog} from '@ravitamil/buddy-ui/overlays';

type AnonymousAuthSuccessPayload = Record<string, never>;

const tokenColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const toAuthError = (error: unknown): AuthError => {
  if (error instanceof Error) {
    return {
      code: 'anonymous-sign-in-failed',
      message: error.message,
    };
  }

  return {
    code: 'anonymous-sign-in-failed',
    message: 'Could not sign in anonymously',
  };
};

interface AnonymousAuthButtonProps {
  onSuccess?: (user: AnonymousAuthSuccessPayload) => void;
  onError?: (error: AuthError) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const AnonymousAuthButton: React.FC<AnonymousAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  compact = false,
}) => {
  const theme = useTheme();
  const {showAlert} = useAlert();
  const {signInAnonymously} = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  const initiateSignIn = async () => {
    setShowConfirmSheet(false);
    setIsLoading(true);
    try {
      await signInAnonymously();
      setIsLoading(false);
      onSuccess?.({});
    } catch (error: unknown) {
      setIsLoading(false);
      const authError = toAuthError(error);
      onError?.(authError);
      showAlert({
        title: 'Sign In Failed',
        message: authError.message || 'Could not sign in offline',
        actions: [{text: 'OK'}],
      });
    }
  };

  const handleButtonPress = () => {
    setShowConfirmSheet(true);
  };

  return (
    <>
      <Button
        size={compact ? 'small' : 'large'}
        variant={compact ? 'ghost' : 'outline'}
        loading={isLoading}
        loadingLabel="Signing in..."
        leftIcon={<ThemedAnonymousIcon name="person-outline" size={20} color="$colorSecondary" />}
        onPress={handleButtonPress}
        disabled={disabled || isLoading}
        opacity={disabled ? 0.5 : 1}
        borderColor={compact ? '$transparent' : '$glassSurfaceBorder'}>
        {disabled ? 'Guest access — coming soon' : 'Continue Offline'}
      </Button>

      <Dialog
        open={showConfirmSheet}
        onOpenChange={setShowConfirmSheet}
        title="Continue Offline?"
        description="Use Buddy completely offline without an online account. All your data is saved securely on this device."
        actions={[
          {label: 'Cancel', onPress: () => undefined, disabled: isLoading},
          {
            label: isLoading ? 'Starting...' : 'Yes, Continue',
            onPress: () => void initiateSignIn(),
            tone: 'success',
            disabled: isLoading,
            closeOnPress: false,
          },
        ]}>
        <YStack alignItems="center">
          <Card
            width={64}
            height={64}
            padding={0}
            borderRadius={32}
            backgroundColor="$gray3"
            alignItems="center"
            justifyContent="center">
            <Ionicons
              name="person-outline"
              size={28}
              color={tokenColor(theme.gray11?.val as unknown, '$gray11')}
            />
          </Card>
        </YStack>
      </Dialog>
    </>
  );
};

const ThemedAnonymousIcon = styled(Ionicons, {}, {accept: {color: 'color'} as const});

export default AnonymousAuthButton;
