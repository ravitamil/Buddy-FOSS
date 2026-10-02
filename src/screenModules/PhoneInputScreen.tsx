/**
 * Phone Input Screen Component
 * International phone input with official react-native-country-picker-modal
 */

import React, {useState, useCallback} from 'react';
import {router} from 'expo-router';
import {Button, Input, Text} from '@ravitamil/buddy-ui';
import {YStack, XStack, useTheme} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useAuth} from '@/context/AuthContext';
import {useFeatureAction} from '@/features/featureControls/hooks';
import {getFontFamilyForWeight} from '../utils/fonts';
import CountryPicker, {Country} from '../components/native/CountryPicker';
import {useAlert} from '../hooks/useAlert';

import {ScreenContainer, CustomNavigationHeader, ScreenWrapper} from '../components/ui';
import {AuthError} from '../types/auth.types';
import {
  defaultIndiaCountry,
  formatPhoneNumber,
  getCountryDisplayName,
  getPhoneNumberLength,
  getPlaceholder,
  getThemeColor,
  isValidPhoneNumber,
  type PhoneInputState,
} from '../features/auth/phoneInput';

export default function PhoneInputScreen() {
  const theme: unknown = useTheme();
  const {showAlert} = useAlert();
  const {signInWithPhone} = useAuth();
  const phoneSignIn = useFeatureAction('auth.phoneSignIn');
  // Removed useTamaguiTheme as we rely on standard Tamagui theming

  const [state, setState] = useState<PhoneInputState>({
    phoneNumber: '',
    isLoading: false,
    countryCode: 'IN',
    country: defaultIndiaCountry,
    showCountryPicker: false,
  });

  const [isFocused, setIsFocused] = useState(false);

  const handlePhoneInputChange = useCallback((text: string) => {
    // Remove all non-numeric characters
    const numericOnly = text.replace(/\D/g, '');
    setState((prev) => ({
      ...prev,
      phoneNumber: numericOnly,
    }));
  }, []);

  const onCountrySelect = useCallback((country: Country) => {
    setState((prev) => ({
      ...prev,
      countryCode: country.cca2,
      country: country,
      showCountryPicker: false,
      phoneNumber: '', // Clear phone number when country changes
    }));
  }, []);

  const handleSendVerification = useCallback(async () => {
    if (!phoneSignIn.isAllowed) {
      showAlert({
        title: 'Phone Authentication Unavailable',
        message: phoneSignIn.message ?? 'Phone authentication is currently unavailable.',
        actions: [{text: 'OK'}],
      });
      return;
    }

    if (!isValidPhoneNumber(state.phoneNumber, state.country)) {
      showAlert({
        title: 'Invalid Phone Number',
        message: `Please enter a valid ${getPhoneNumberLength(state.country)}-digit phone number for ${getCountryDisplayName(state.country)}`,
        actions: [{text: 'OK'}],
      });
      return;
    }

    setState((prev) => ({...prev, isLoading: true}));

    try {
      // Format the phone number with selected country's calling code
      const callingCode = state.country?.callingCode?.[0] || '1';
      const formattedNumber = `+${callingCode}${state.phoneNumber.replace(/\D/g, '')}`;

      // Supabase Phone Verification
      const {verificationId} = await signInWithPhone(formattedNumber);

      setState((prev) => ({...prev, isLoading: false}));

      // Navigate to OTP Screen
      router.push({
        pathname: '/otp-verification',
        params: {
          verificationId,
          phoneNumber: formattedNumber,
        },
      });
    } catch (error: unknown) {
      setState((prev) => ({...prev, isLoading: false}));
      const authError = error as AuthError;
      showAlert({
        title: 'Verification Failed',
        message: authError.message,
        actions: [{text: 'OK'}],
      });
    }
  }, [phoneSignIn, showAlert, signInWithPhone, state.country, state.phoneNumber]);

  const iconBrandColor = getThemeColor(
    theme,
    'iconBrand',
    getThemeColor(theme, 'green8', '#22c55e'),
  );
  const securityIconColor = getThemeColor(
    theme,
    'iconBrand',
    getThemeColor(theme, 'success', '#22c55e'),
  );
  const countryPickerTheme = {
    backgroundColor: getThemeColor(theme, 'background', '#ffffff'),
    onBackgroundTextColor: getThemeColor(theme, 'text', '#000000'),
    primaryColor: getThemeColor(theme, 'primary', '#007AFF'),
    primaryColorVariant: getThemeColor(theme, 'primaryFocus', '#0056CC'),
    fontFamily: getFontFamilyForWeight('600'),
    fontSize: 16,
    filterPlaceholderTextColor: getThemeColor(theme, 'placeholderColor', '#9ca3af'),
  };
  const chevronColor = getThemeColor(theme, 'textTertiary', '#6b7280');

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
            {/* Custom Header using CustomNavigationHeader */}
            <CustomNavigationHeader title="Phone Verification" showBackButton={true} />

            {/* Spacer to push content toward center with icon */}
            <YStack flex={1} justifyContent="flex-end" paddingBottom="$4">
              <YStack alignItems="center">
                <YStack
                  width={80}
                  height={80}
                  alignItems="center"
                  justifyContent="center"
                  position="relative">
                  <YStack
                    fullscreen
                    backgroundColor="$green8"
                    opacity={0.1}
                    borderRadius={40}
                    borderWidth={2}
                    borderColor="$green8"
                  />
                  <Ionicons name="call" size={36} color={iconBrandColor} />
                </YStack>
              </YStack>
            </YStack>

            {/* Centered Content Area */}
            <YStack gap="$4" justifyContent="center" flex={2}>
              {/* Phone Input Section */}
              <YStack gap="$4" paddingHorizontal="$2">
                <XStack gap={12} paddingHorizontal="$2">
                  {/* Country Selector Container */}
                  <YStack gap="$1.5" width={100}>
                    <Text fontSize="$3" fontWeight="700" color="$textSecondary" marginLeft="$1">
                      Country
                    </Text>
                    <CountryPicker
                      countryCode={state.countryCode}
                      withFilter={true}
                      withFlag={true}
                      withCallingCode={true}
                      withEmoji={true}
                      onSelect={onCountrySelect}
                      visible={state.showCountryPicker}
                      onClose={() => setState((prev) => ({...prev, showCountryPicker: false}))}
                      onOpen={() => setState((prev) => ({...prev, showCountryPicker: true}))}
                      theme={countryPickerTheme}>
                      <XStack
                        height={56}
                        alignItems="center"
                        justifyContent="space-between"
                        paddingHorizontal="$3"
                        backgroundColor="$inputBackground"
                        borderWidth={1.5}
                        borderColor="$inputBorder"
                        borderRadius="$4"
                        pressStyle={{opacity: 0.7}}>
                        <Text fontWeight="600" fontSize="$5" color="$text">
                          +{state.country?.callingCode?.[0] || '1'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={chevronColor} />
                      </XStack>
                    </CountryPicker>
                  </YStack>

                  {/* Phone Input Container */}
                  <YStack gap="$1.5" flex={1}>
                    <Text
                      fontSize="$3"
                      fontWeight="700"
                      color={isFocused ? '$iconBrand' : '$textSecondary'}
                      marginLeft="$1">
                      Phone
                    </Text>

                    <Input
                      accessibilityLabel="Phone number"
                      size="large"
                      variant="outline"
                      flex={1}
                      value={formatPhoneNumber(state.phoneNumber, state.country)}
                      onChangeText={handlePhoneInputChange}
                      placeholder={getPlaceholder(state.country)}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      fontSize={18}
                      fontFamily={getFontFamilyForWeight('600')}
                      fontWeight="600"
                      borderColor={isFocused ? '$primary' : '$inputBorder'}
                    />
                  </YStack>
                </XStack>

                {/* Send Button */}
                <Button
                  size="medium"
                  loading={state.isLoading}
                  loadingLabel="Sending..."
                  leftIcon={<Ionicons name="send" size={20} color="white" />}
                  onPress={() => {
                    void handleSendVerification();
                  }}
                  disabled={
                    state.isLoading ||
                    !phoneSignIn.isAllowed ||
                    !isValidPhoneNumber(state.phoneNumber, state.country)
                  }
                  opacity={
                    state.isLoading ||
                    !phoneSignIn.isAllowed ||
                    !isValidPhoneNumber(state.phoneNumber, state.country)
                      ? 0.6
                      : 1
                  }
                  marginTop="$6">
                  Get Verification Code
                </Button>
              </YStack>
            </YStack>

            {/* Bottom spacer to balance layout */}
            <YStack flex={1} />
          </YStack>
        </ScreenWrapper>

        {/* Fixed Bottom Section - Security Note */}
        <YStack gap="$4" paddingBottom="$4" paddingHorizontal="$4">
          <XStack alignItems="center" justifyContent="center" gap="$2">
            <Ionicons name="shield-checkmark" size={16} color={securityIconColor} />
            <Text color="$textSecondary" fontSize="$3">
              Your number is secure and encrypted
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
