import React, {useCallback, useEffect, useState} from 'react';
import {router, useLocalSearchParams} from 'expo-router';
import * as Linking from 'expo-linking';
import {Button, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {Separator, XStack, YStack} from 'tamagui';

import {OtpCodeInput} from '@/features/auth/components/OtpCodeInput';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScreenContainer, ScreenWrapper} from '@/components/ui';
import {CustomNavigationHeader} from '@/components/ui/CustomNavigationHeader';
import {useAuth} from '@/context/AuthContext';
import {useFeatureAction} from '@/features/featureControls/hooks';
import {useAlert} from '@/hooks/useAlert';
import {logger as appLogger} from '@/services/LoggerService';

const hasErrorMessage = (error: unknown): error is {message: string} =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof error.message === 'string';

const getErrorMessage = (error: unknown): string =>
  hasErrorMessage(error) ? error.message : 'Something went wrong. Please try again.';

const readRouteParam = (value: string | string[] | undefined): string | null =>
  typeof value === 'string' ? value : Array.isArray(value) ? (value[0] ?? null) : null;

interface EmailVerificationState {
  otp: string;
  isLoading: boolean;
  countdown: number;
  canResend: boolean;
}

export default function EmailVerificationScreen() {
  const {showAlert} = useAlert();
  const {resendEmailOTP, verifyEmailOTP, user} = useAuth();
  const verifyEmail = useFeatureAction('auth.verifyEmailOtp');
  const resendEmail = useFeatureAction('auth.resendEmailOtp');
  const params = useLocalSearchParams();
  const email = readRouteParam(params.email);

  const [state, setState] = useState<EmailVerificationState>({
    otp: '',
    isLoading: false,
    countdown: 60,
    canResend: false,
  });

  // Auto-navigate if user becomes authenticated via magic link
  useEffect(() => {
    if (user) {
      router.dismissAll();
      router.replace('/(tabs)');
    }
  }, [user]);

  const startCountdown = useCallback(() => {
    setState((previous) => ({...previous, countdown: 60, canResend: false}));

    const timer = setInterval(() => {
      setState((previous) => {
        if (previous.countdown <= 1) {
          clearInterval(timer);
          return {...previous, countdown: 0, canResend: true};
        }
        return {...previous, countdown: previous.countdown - 1};
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => startCountdown(), [startCountdown]);

  const handleOTPChange = useCallback((otp: string) => {
    setState((previous) => ({...previous, otp}));
  }, []);

  const handleOTPComplete = useCallback(
    async (otp: string) => {
      if (otp.length !== 6) return;

      if (!verifyEmail.isAllowed) {
        showAlert({
          title: 'Email Login Unavailable',
          message: verifyEmail.message ?? 'Email login is currently unavailable.',
          actions: [{text: 'OK'}],
        });
        return;
      }

      setState((previous) => ({...previous, isLoading: true}));

      try {
        if (!email) {
          throw new Error('Missing email address for verification');
        }

        const verifiedUser = await verifyEmailOTP(email, otp);

        appLogger.info('Email verification successful', {userId: verifiedUser.uid});

        setState((previous) => ({...previous, isLoading: false}));

        router.dismissAll();
        router.replace('/(tabs)');
      } catch (error: unknown) {
        setState((previous) => ({...previous, isLoading: false, otp: ''}));
        showAlert({
          title: 'Verification Failed',
          message: getErrorMessage(error),
          actions: [{text: 'OK'}],
        });
      }
    },
    [email, showAlert, verifyEmail, verifyEmailOTP],
  );

  const handleResendCode = useCallback(async () => {
    if (!state.canResend) return;

    if (!resendEmail.isAllowed) {
      showAlert({
        title: 'Email Login Unavailable',
        message: resendEmail.message ?? 'Email login is currently unavailable.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    setState((previous) => ({...previous, isLoading: true}));

    try {
      if (!email) {
        throw new Error('Missing email address for resend');
      }

      await resendEmailOTP(email);
      setState((previous) => ({...previous, isLoading: false}));
      startCountdown();
      showAlert({
        title: 'Verification Sent',
        message: 'A new verification link and code has been sent to your email.',
        actions: [{text: 'OK'}],
      });
    } catch (error: unknown) {
      setState((previous) => ({...previous, isLoading: false}));
      showAlert({
        title: 'Resend Failed',
        message: getErrorMessage(error),
        actions: [{text: 'OK'}],
      });
    }
  }, [email, resendEmail, resendEmailOTP, showAlert, startCountdown, state.canResend]);

  const handleVerifyPress = useCallback(() => {
    void handleOTPComplete(state.otp);
  }, [handleOTPComplete, state.otp]);

  const handleResendPress = useCallback(() => {
    void handleResendCode();
  }, [handleResendCode]);

  const handleOpenEmailApp = useCallback(async () => {
    try {
      const canOpen = await Linking.canOpenURL('mailto:');
      if (canOpen) {
        await Linking.openURL('mailto:');
      }
    } catch {
      // Ignore if email client cannot be opened
    }
  }, []);

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <YStack flex={1}>
        <CustomNavigationHeader
          title="Verify Email"
          alignStaticTitleWithContent={true}
          onBackPress={() => router.back()}
        />

        <ScreenWrapper
          edges={[]}
          backgroundColor="transparent"
          padding={false}
          keyboardMode="avoid"
          scrollable={true}
          keyboardVerticalOffset={20}>
          <YStack flex={1} padding="$4" justifyContent="center" alignItems="center">
            <YStack width="100%" maxWidth={420}>
              <GlassSurface padding="$5" borderRadius={24}>
                <YStack gap="$4">
                  {/* Header */}
                  <YStack alignItems="center" gap="$2">
                    <Ionicons name="mail-open-outline" size={38} color="$iconBrand" />
                    <Text fontSize="$6" fontWeight="700" color="$color" textAlign="center">
                      Check your inbox
                    </Text>
                    <Text
                      fontSize="$3"
                      color="$colorSecondary"
                      textAlign="center"
                      lineHeight={20}
                      paddingHorizontal="$2">
                      We sent an instant sign-in link and verification code to
                    </Text>
                    <Text fontSize="$3" fontWeight="700" color="$color" textAlign="center">
                      {email ?? 'your email'}
                    </Text>
                  </YStack>

                  {/* Instant Link Button */}
                  <Button
                    variant="secondary"
                    size="medium"
                    leftIcon={<Ionicons name="open-outline" size={18} color="$color" />}
                    onPress={() => {
                      void handleOpenEmailApp();
                    }}
                    marginTop="$1">
                    Open Email App
                  </Button>

                  {/* Divider */}
                  <XStack alignItems="center" gap="$3" marginVertical="$1">
                    <Separator flex={1} borderColor="$borderColor" />
                    <Text
                      color="$colorSecondary"
                      fontSize="$1"
                      fontWeight="600"
                      letterSpacing={0.5}>
                      OR ENTER 6-DIGIT CODE
                    </Text>
                    <Separator flex={1} borderColor="$borderColor" />
                  </XStack>

                  {/* 6-Digit OTP Input */}
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

                  {/* Submit Button */}
                  <Button
                    size="large"
                    variant="primary"
                    loading={state.isLoading}
                    loadingLabel="Verifying..."
                    leftIcon={<Ionicons name="checkmark-circle" size={18} color="white" />}
                    onPress={handleVerifyPress}
                    disabled={state.isLoading || state.otp.length !== 6 || !verifyEmail.isAllowed}
                    opacity={
                      state.isLoading || state.otp.length !== 6 || !verifyEmail.isAllowed ? 0.6 : 1
                    }
                    width="100%">
                    Verify Code
                  </Button>

                  {/* Resend Link Row */}
                  <XStack justifyContent="center" alignItems="center" gap="$2" marginTop="$1">
                    <Text color="$colorSecondary" fontSize="$3">
                      Didn&apos;t receive the email?
                    </Text>
                    <Button
                      size="small"
                      variant="ghost"
                      onPress={handleResendPress}
                      disabled={!state.canResend || state.isLoading || !resendEmail.isAllowed}
                      pressStyle={{opacity: 0.7}}>
                      <Text
                        color={state.canResend ? '$iconBrand' : '$colorSecondary'}
                        fontWeight="600"
                        fontSize="$3">
                        {state.canResend ? 'Resend' : `Resend in ${state.countdown}s`}
                      </Text>
                    </Button>
                  </XStack>
                </YStack>
              </GlassSurface>
            </YStack>
          </YStack>
        </ScreenWrapper>

        {/* Footer info */}
        <YStack paddingBottom="$5" paddingHorizontal="$4">
          <XStack alignItems="center" justifyContent="center" gap="$2">
            <Ionicons name="shield-checkmark-outline" size={16} color="$iconBrand" />
            <Text color="$colorSecondary" fontSize="$2" textAlign="center">
              Tap the link in your email or enter the code above
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
