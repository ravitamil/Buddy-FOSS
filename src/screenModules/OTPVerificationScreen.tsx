import {useBuddyColors} from '@ravitamil/buddy-ui';
import React, {useCallback, useEffect, useState} from 'react';
import {router, useLocalSearchParams} from 'expo-router';
import {Button, Card, Text} from '@ravitamil/buddy-ui';
import {YStack, XStack} from 'tamagui';
import {OtpCodeInput} from '@/features/auth/components/OtpCodeInput';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useAuth} from '@/context/AuthContext';
import {useFeatureAction} from '@/features/featureControls/hooks';
import {useAlert} from '../hooks/useAlert';

import {ScreenContainer, ScreenWrapper} from '../components/ui';
import {CustomNavigationHeader} from '../components/ui/CustomNavigationHeader';
import {SuccessAnimationScreen} from '@/features/auth/components/SuccessAnimationScreen';
import {logger as appLogger} from '../services/LoggerService';

const hasErrorMessage = (error: unknown): error is {message: string} => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
};

const getErrorMessage = (error: unknown): string => {
  if (hasErrorMessage(error)) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

interface OTPVerificationState {
  otp: string;
  isLoading: boolean;
  countdown: number;
  canResend: boolean;
  showSuccessAnimation: boolean;
}

export default function OTPVerificationScreen() {
  const primaryColor = useBuddyColors().iconBrand;
  const {showAlert} = useAlert();
  const {resendOTP, verifyOTP} = useAuth();
  const verifyPhone = useFeatureAction('auth.verifyPhoneOtp');
  const resendPhone = useFeatureAction('auth.resendPhoneOtp');
  const params = useLocalSearchParams();
  const rawPhoneNumber = params.phoneNumber;
  const phoneNumber =
    typeof rawPhoneNumber === 'string'
      ? rawPhoneNumber
      : Array.isArray(rawPhoneNumber) && typeof rawPhoneNumber[0] === 'string'
        ? rawPhoneNumber[0]
        : null;

  const [state, setState] = useState<OTPVerificationState>({
    otp: '',
    isLoading: false,
    countdown: 60,
    canResend: false,
    showSuccessAnimation: false,
  });

  const startCountdown = useCallback(() => {
    setState((prev) => ({...prev, countdown: 60, canResend: false}));

    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.countdown <= 1) {
          clearInterval(timer);
          return {...prev, countdown: 0, canResend: true};
        }
        return {...prev, countdown: prev.countdown - 1};
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => startCountdown(), [startCountdown]);

  const handleOTPChange = useCallback((otp: string) => {
    setState((prev) => ({...prev, otp}));
  }, []);

  const handleOTPComplete = useCallback(
    async (otp: string) => {
      if (otp.length !== 6) return;

      if (!verifyPhone.isAllowed) {
        showAlert({
          title: 'Phone Authentication Unavailable',
          message: verifyPhone.message ?? 'Phone authentication is currently unavailable.',
          actions: [{text: 'OK'}],
        });
        return;
      }

      setState((prev) => ({...prev, isLoading: true}));

      try {
        if (!phoneNumber) {
          throw new Error('Missing phone number for verification');
        }

        const user = await verifyOTP(phoneNumber, otp);

        appLogger.info('Phone verification successful', {userId: user.uid});

        setState((prev) => ({...prev, isLoading: false}));

        appLogger.debug('OTP verified, navigating to tabs');
        router.dismissAll();
        router.replace('/(tabs)');
      } catch (error: unknown) {
        setState((prev) => ({...prev, isLoading: false, otp: ''}));
        showAlert({
          title: 'Verification Failed',
          message: getErrorMessage(error),
          actions: [{text: 'OK'}],
        });
      }
    },
    [phoneNumber, showAlert, verifyOTP, verifyPhone],
  );

  const handleResendCode = useCallback(async () => {
    if (!state.canResend) return;

    if (!resendPhone.isAllowed) {
      showAlert({
        title: 'Phone Authentication Unavailable',
        message: resendPhone.message ?? 'Phone authentication is currently unavailable.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    setState((prev) => ({...prev, isLoading: true}));

    try {
      if (!phoneNumber) {
        throw new Error('Missing phone number for resend');
      }

      await resendOTP(phoneNumber);
      setState((prev) => ({...prev, isLoading: false}));
      startCountdown();
      showAlert({
        title: 'Code Sent',
        message: 'A new verification code has been sent to your phone.',
        actions: [{text: 'OK'}],
      });
    } catch (error: unknown) {
      setState((prev) => ({...prev, isLoading: false}));
      showAlert({
        title: 'Resend Failed',
        message: getErrorMessage(error),
        actions: [{text: 'OK'}],
      });
    }
  }, [phoneNumber, resendOTP, resendPhone, showAlert, startCountdown, state.canResend]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      const country = cleaned.slice(0, -10);
      const area = cleaned.slice(-10, -7);
      const first = cleaned.slice(-7, -4);
      const last = cleaned.slice(-4);
      return `+${country} (${area}) ${first}-${last}`;
    }
    return phone;
  };

  const handleVerifyPress = useCallback(() => {
    void handleOTPComplete(state.otp);
  }, [handleOTPComplete, state.otp]);

  const handleResendPress = useCallback(() => {
    void handleResendCode();
  }, [handleResendCode]);

  // Show success animation for existing users
  if (state.showSuccessAnimation) {
    return (
      <SuccessAnimationScreen
        type="existingUser"
        message="Welcome back!"
        duration={3000}
        navigateTo="/(tabs)"
      />
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      <YStack flex={1}>
        <ScreenWrapper
          edges={[]}
          backgroundColor="transparent"
          padding={false}
          keyboardMode="avoid"
          scrollable={false}
          keyboardVerticalOffset={20}>
          <YStack flex={1} padding="$4">
            <CustomNavigationHeader title="Enter Verification Code" onBackPress={handleGoBack} />

            <YStack flex={1} justifyContent="flex-end" paddingBottom="$4">
              <YStack alignItems="center">
                <Card
                  width={80}
                  height={80}
                  padding={0}
                  elevation={0}
                  borderRadius={40}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="$primaryMuted"
                  borderWidth={2}
                  borderColor="$primary">
                  <Ionicons name="lock-closed" size={36} color={primaryColor} />
                </Card>
              </YStack>
            </YStack>

            <YStack
              flex={2}
              justifyContent="center"
              alignItems="center"
              gap="$6"
              paddingHorizontal="$2">
              <YStack gap="$3" alignItems="center" maxWidth={280}>
                <Text color="$color" fontWeight="bold" textAlign="center" fontSize="$6">
                  Enter 6-Digit Code
                </Text>
                <Text color="$gray11" textAlign="center" fontSize="$3" lineHeight="$4">
                  We sent a verification code to {formatPhoneNumber(phoneNumber ?? '')}
                </Text>
              </YStack>

              <YStack alignItems="center" width="100%">
                <OtpCodeInput
                  length={6}
                  value={state.otp}
                  onChange={handleOTPChange}
                  onComplete={(otp) => {
                    void handleOTPComplete(otp);
                  }}
                />
              </YStack>

              <Button
                size="medium"
                variant="success"
                loading={state.isLoading}
                loadingLabel="Verifying..."
                leftIcon={<Ionicons name="checkmark-circle" size={18} color="white" />}
                onPress={handleVerifyPress}
                disabled={state.isLoading || state.otp.length !== 6 || !verifyPhone.isAllowed}
                opacity={
                  state.isLoading || state.otp.length !== 6 || !verifyPhone.isAllowed ? 0.6 : 1
                }
                width="100%"
                maxWidth={300}>
                Verify Code
              </Button>
            </YStack>

            <YStack flex={1} />
          </YStack>
        </ScreenWrapper>

        <YStack gap="$4" paddingBottom="$4" paddingHorizontal="$4">
          <XStack justifyContent="center" alignItems="center" gap="$2">
            <Text color="$gray11" fontSize="$3">
              Didn't receive the code?
            </Text>
            <Button
              size="small"
              variant="outline"
              borderColor="transparent"
              backgroundColor="transparent"
              onPress={handleResendPress}
              disabled={!state.canResend || state.isLoading || !resendPhone.isAllowed}
              pressStyle={{opacity: 0.7}}>
              <Text
                color={state.canResend ? '$iconBrand' : '$gray11'}
                fontWeight="600"
                fontSize="$3">
                {state.canResend ? 'Resend Code' : `Resend in ${state.countdown}s`}
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
