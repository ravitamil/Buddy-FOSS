import React, {useCallback, useState} from 'react';
import {router} from 'expo-router';
import {
  Button,
  FormField,
  GlassSurface,
  IconTile,
  Text,
  resolveThemeColor,
} from '@ravitamil/buddy-ui';
import {YStack, useTheme} from 'tamagui';

import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScreenContainer, CustomNavigationHeader, ScreenWrapper} from '@/components/ui';
import {useAuth} from '@/context/AuthContext';
import {useFeatureAction} from '@/features/featureControls/hooks';
import {useAlert} from '@/hooks/useAlert';
import {getFontFamilyForWeight} from '@/utils/fonts';
import type {AuthError} from '@/types/auth.types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export default function EmailLoginScreen() {
  const theme = useTheme();
  const primaryColor = resolveThemeColor(theme, 'primary', '#22c55e');
  const secondaryColor = resolveThemeColor(theme, 'colorSecondary', '#6b7280');
  const buttonTextColor = resolveThemeColor(theme, 'buttonPrimaryText', '#ffffff');

  const {showAlert} = useAlert();
  const {signInWithEmail} = useAuth();
  const emailSignIn = useFeatureAction('auth.emailSignIn');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const normalizedEmail = email.trim().toLowerCase();
  const isValidEmail = emailPattern.test(normalizedEmail);

  const handleSendVerification = useCallback(async () => {
    if (!emailSignIn.isAllowed) {
      showAlert({
        title: 'Email Login Unavailable',
        message: emailSignIn.message ?? 'Email login is currently unavailable.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    if (!isValidEmail) {
      showAlert({
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    setIsLoading(true);

    try {
      const {verificationId} = await signInWithEmail(normalizedEmail);

      router.push({
        pathname: '/email-verification',
        params: {
          verificationId,
          email: normalizedEmail,
        },
      });
    } catch (error: unknown) {
      const authError = error as AuthError;
      showAlert({
        title: 'Verification Failed',
        message: authError.message,
        actions: [{text: 'OK'}],
      });
    } finally {
      setIsLoading(false);
    }
  }, [emailSignIn, isValidEmail, normalizedEmail, showAlert, signInWithEmail]);

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <YStack flex={1}>
        <YStack zIndex={2} paddingTop="$2" paddingBottom="$2">
          <CustomNavigationHeader
            title="Email Login"
            subtitle="Sign in or register with email"
            showBackButton
            alignStaticTitleWithContent
            staticTitleVariant="compact"
            onBackPress={() => router.back()}
          />
        </YStack>

        <ScreenWrapper
          edges={[]}
          backgroundColor="transparent"
          padding={false}
          keyboardMode="aware-scroll"
          scrollable={true}
          keyboardBottomOffset={24}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-start',
          }}>
          <YStack
            flex={1}
            justifyContent="flex-start"
            alignItems="center"
            width="100%"
            paddingHorizontal="$4"
            paddingTop="$4"
            paddingBottom="$6">
            <YStack width="100%" maxWidth={420}>
              <GlassSurface padding="$5" borderRadius={24}>
                <YStack gap="$4">
                  {/* Hero Header with Buddy-UI IconTile */}
                  <YStack alignItems="center" gap="$2">
                    <IconTile
                      icon="mail"
                      size={72}
                      iconSize={32}
                      color={primaryColor}
                      tone="soft"
                      shape="circle"
                    />

                    <Text fontSize="$6" fontWeight="700" color="$color" textAlign="center">
                      Sign in with Email
                    </Text>
                    <Text
                      fontSize="$3"
                      color="$colorSecondary"
                      textAlign="center"
                      lineHeight={20}
                      paddingHorizontal="$2">
                      We&apos;ll send you an instant verification link and login code.
                    </Text>
                  </YStack>

                  {/* Form Input using Buddy-UI FormField */}
                  <YStack marginTop="$2">
                    <FormField
                      id="email-address-input"
                      label="Email Address"
                      labelTextProps={{
                        fontWeight: '600',
                        color: isFocused ? '$primary' : '$colorSecondary',
                        marginLeft: '$1',
                      }}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="name@example.com"
                      placeholderTextColor="$inputPlaceholder"
                      size="large"
                      variant="default"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="send"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onSubmitEditing={() => {
                        if (isValidEmail && !isLoading && emailSignIn.isAllowed) {
                          void handleSendVerification();
                        }
                      }}
                      accessibilityLabel="Email address"
                      error={
                        email.length > 0 && !isValidEmail && !isFocused
                          ? 'Please enter a valid email address'
                          : undefined
                      }
                      fontSize={16}
                      fontFamily={getFontFamilyForWeight('600')}
                      fontWeight="600"
                      leftIcon={
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color={isFocused ? primaryColor : secondaryColor}
                        />
                      }
                      rightIcon={
                        email.length > 0 ? (
                          <YStack
                            accessibilityRole="button"
                            accessibilityLabel="Clear email"
                            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                            onPress={() => setEmail('')}
                            pressStyle={{opacity: 0.6}}>
                            <Ionicons name="close-circle" size={18} color={secondaryColor} />
                          </YStack>
                        ) : undefined
                      }
                    />
                  </YStack>

                  {/* Submit Button */}
                  <Button
                    size="large"
                    variant="primary"
                    loading={isLoading}
                    loadingLabel="Sending Link & Code..."
                    leftIcon={<Ionicons name="paper-plane" size={18} color={buttonTextColor} />}
                    onPress={() => {
                      void handleSendVerification();
                    }}
                    disabled={isLoading || !isValidEmail || !emailSignIn.isAllowed}
                    opacity={isLoading || !isValidEmail || !emailSignIn.isAllowed ? 0.6 : 1}
                    marginTop="$2">
                    Send Verification Link
                  </Button>
                </YStack>
              </GlassSurface>
            </YStack>
          </YStack>
        </ScreenWrapper>
      </YStack>
    </ScreenContainer>
  );
}
