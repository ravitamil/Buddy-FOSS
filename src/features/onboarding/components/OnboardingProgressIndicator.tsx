import React from 'react';
import {Badge, Text} from '@ravitamil/buddy-ui';
import {XStack, YStack} from 'tamagui';

import {ONBOARDING_STEPS} from '../utils';

interface OnboardingProgressIndicatorProps {
  currentStep: number;
}

const STEP_SUBTITLES = ['Profile Details', 'Date of Birth', 'Home Currency'] as const;

export function OnboardingProgressIndicator({currentStep}: OnboardingProgressIndicatorProps) {
  const stepSubtitle = STEP_SUBTITLES[currentStep] ?? 'Personal setup';

  return (
    <YStack paddingHorizontal="$4" paddingTop="$3" paddingBottom="$3" gap="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Text variant="h4" weight="bold" color="$text">
          {stepSubtitle}
        </Text>
        <Badge label={`${currentStep + 1} of ${ONBOARDING_STEPS.length}`} tone="brand" />
      </XStack>

      <XStack
        gap="$2"
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 1,
          max: ONBOARDING_STEPS.length,
          now: currentStep + 1,
        }}>
        {ONBOARDING_STEPS.map((step) => (
          <YStack
            key={step}
            flex={1}
            height={6}
            borderRadius="$10"
            backgroundColor={step <= currentStep ? '$primary' : '$borderColor'}
          />
        ))}
      </XStack>
    </YStack>
  );
}
