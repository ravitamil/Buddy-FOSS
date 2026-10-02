import {Badge, Button, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack, styled} from 'tamagui';

import {ONBOARDING_STEPS} from '../utils';
import {getFontFamilyForWeight} from '@/utils/fonts';

type OnboardingIconName = keyof typeof Ionicons.glyphMap;

interface OnboardingStepHeaderProps {
  currentStep?: number;
  eyebrow?: string;
  title: string;
  description?: string;
  subtitle?: string;
  icon?: OnboardingIconName;
}

interface OnboardingActionBarProps {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

export function OnboardingStepHeader({
  currentStep = 0,
  eyebrow,
  title,
  description,
  subtitle,
}: OnboardingStepHeaderProps) {
  const subtitleText = subtitle ?? description;

  return (
    <YStack gap="$2" width="100%" paddingTop="$1">
      {eyebrow ? (
        <Text
          variant="caption"
          weight="bold"
          color="$iconBrand"
          textTransform="uppercase"
          letterSpacing={1.2}>
          {eyebrow}
        </Text>
      ) : null}

      {/* Main Title horizontally aligned with 1 of 3 Badge */}
      <XStack alignItems="center" justifyContent="space-between" width="100%" gap="$2">
        <Text
          fontSize={28}
          lineHeight={34}
          fontWeight="700"
          color="$text"
          letterSpacing={-0.5}
          paddingLeft={2}
          fontFamily={getFontFamilyForWeight('bold')}
          flex={1}>
          {title}
        </Text>
        <Badge label={`${currentStep + 1} of ${ONBOARDING_STEPS.length}`} tone="neutral" />
      </XStack>

      {/* Subtitle / Description */}
      {subtitleText ? (
        <Text
          fontSize={11}
          lineHeight={16}
          fontWeight="600"
          color="$textSecondary"
          paddingLeft={4}
          fontFamily={getFontFamilyForWeight('semibold')}
          maxWidth={360}>
          {subtitleText}
        </Text>
      ) : null}

      {/* High-Contrast Theme-Aware Progress Bar */}
      <XStack
        gap="$2"
        marginTop="$2"
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 1,
          max: ONBOARDING_STEPS.length,
          now: currentStep + 1,
        }}>
        {ONBOARDING_STEPS.map((step) => {
          const isActive = step <= currentStep;
          return (
            <YStack
              key={step}
              flex={1}
              height={6}
              borderRadius="$10"
              backgroundColor={isActive ? '$primary' : '$glassSurfaceBorder'}
            />
          );
        })}
      </XStack>
    </YStack>
  );
}

export function OnboardingActionBar({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
}: OnboardingActionBarProps) {
  return (
    <YStack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$3">
      <GlassSurface padding={10} borderRadius={22} testID="onboarding-action-bar">
        <XStack gap="$2.5">
          <Button
            variant="outline"
            size="large"
            flex={0.42}
            onPress={onBack}
            accessibilityLabel="Go back"
            leftIcon={<ThemedIonicon name="arrow-back" size={18} color="$color" />}>
            Back
          </Button>
          <Button
            variant="primary"
            size="large"
            flex={1}
            onPress={onContinue}
            disabled={continueDisabled}
            accessibilityLabel={continueLabel}
            rightIcon={
              <ThemedIonicon
                name={continueLabel === 'Finish setup' ? 'sparkles' : 'arrow-forward'}
                size={18}
                color="$buttonPrimaryText"
              />
            }>
            {continueLabel}
          </Button>
        </XStack>
      </GlassSurface>
    </YStack>
  );
}

export const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
