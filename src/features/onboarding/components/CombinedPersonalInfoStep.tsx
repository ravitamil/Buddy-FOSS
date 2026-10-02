import React, {useCallback} from 'react';
import {Badge, FormField, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {XStack, YStack} from 'tamagui';

import ProfilePicture from '@/components/ui/ProfilePicture';
import {ScreenWrapper} from '@/components/ui/ScreenWrapper';
import {logger as appLogger} from '@/services/LoggerService';
import {OnboardingActionBar, OnboardingStepHeader, ThemedIonicon} from './OnboardingStepChrome';

const logger = appLogger.contextLogger('CombinedPersonalInfoStep');
const ALPHABETIC_ONLY_REGEX = /^[a-zA-Z\s]*$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]*$/;
const NAME_MAX_LENGTH = 50;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

interface CombinedPersonalInfoStepProps {
  firstName: string;
  lastName: string;
  displayName: string;
  profilePictureUri?: string;
  onInputChange: (field: string, value: string) => void;
  onProfilePictureChange: (uri: string) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
  userId?: string;
}

export const CombinedPersonalInfoStep: React.FC<CombinedPersonalInfoStepProps> = ({
  firstName,
  lastName,
  displayName,
  profilePictureUri,
  onInputChange,
  onProfilePictureChange,
  onNext,
  onBack,
  errors,
  userId,
}) => {
  const handleInputChange = useCallback(
    (field: 'firstName' | 'lastName' | 'displayName', value: string) => {
      const acceptsValue =
        field === 'displayName'
          ? !value.includes(' ') &&
            USERNAME_REGEX.test(value) &&
            value.length <= USERNAME_MAX_LENGTH
          : ALPHABETIC_ONLY_REGEX.test(value) && value.length <= NAME_MAX_LENGTH;

      if (!acceptsValue) {
        logger.debug(`Rejected invalid ${field} input`);
        return;
      }

      onInputChange(field, value);
    },
    [onInputChange],
  );

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    displayName.trim().length >= USERNAME_MIN_LENGTH;
  const initials =
    firstName && lastName ? `${firstName.at(0) ?? ''}${lastName.at(0) ?? ''}` : undefined;

  return (
    <YStack flex={1}>
      <ScreenWrapper
        edges={[]}
        useSafeArea={false}
        backgroundColor="transparent"
        padding={false}
        keyboardMode="aware-scroll"
        keyboardBottomOffset={76}
        contentContainerStyle={{paddingBottom: 20, flexGrow: 1}}>
        <YStack gap="$4" paddingHorizontal="$4">
          <OnboardingStepHeader
            currentStep={0}
            title="Let's get started"
            subtitle="A few details make Buddy feel personal from the very first screen."
          />

          <GlassSurface padding={18} testID="onboarding-profile-card">
            <YStack gap="$5">
              <XStack alignItems="center" gap="$4">
                <ProfilePicture
                  size={80}
                  imageUri={profilePictureUri}
                  onImageChange={onProfilePictureChange}
                  editable
                  userId={userId}
                  fallbackVariant="icon"
                  borderColor="$glassSurfaceBorder"
                  borderWidth={1.5}
                />
                <YStack flex={1} gap="$1">
                  <Text variant="h5" weight="semibold" color="$text">
                    Profile picture
                  </Text>
                  <Text variant="body2" color="$textSecondary" lineHeight={18}>
                    Tap the avatar to choose a photo from your library.
                  </Text>
                </YStack>
              </XStack>

              <YStack height={1} backgroundColor="$borderColor" />

              <YStack gap="$4">
                <FormField
                  label="First name"
                  required
                  value={firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="Ravi"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  returnKeyType="next"
                  maxLength={NAME_MAX_LENGTH}
                  error={errors.firstName}
                  leftIcon={
                    <ThemedIonicon name="person-outline" size={20} color="$textSecondary" />
                  }
                />
                <FormField
                  label="Last name"
                  required
                  value={lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Kumar"
                  autoCapitalize="words"
                  autoComplete="family-name"
                  returnKeyType="next"
                  maxLength={NAME_MAX_LENGTH}
                  error={errors.lastName}
                  leftIcon={
                    <ThemedIonicon name="people-outline" size={20} color="$textSecondary" />
                  }
                />
                <FormField
                  label="Display name"
                  required
                  value={displayName}
                  onChangeText={(value) => handleInputChange('displayName', value)}
                  placeholder="ravik"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  maxLength={USERNAME_MAX_LENGTH}
                  error={errors.displayName}
                  helpText="3–30 characters. Letters, numbers, dots and underscores work best."
                  showCharacterCount
                  leftIcon={<ThemedIonicon name="at" size={20} color="$textSecondary" />}
                />
              </YStack>
            </YStack>
          </GlassSurface>
        </YStack>
      </ScreenWrapper>

      <OnboardingActionBar onBack={onBack} onContinue={onNext} continueDisabled={!isFormValid} />
    </YStack>
  );
};
