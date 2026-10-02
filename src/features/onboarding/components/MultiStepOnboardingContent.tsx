import React from 'react';
import {YStack} from 'tamagui';

import type {OnboardingScreenModel} from '../types';
import {OnboardingStepContent} from './OnboardingStepContent';

interface MultiStepOnboardingContentProps {
  screen: OnboardingScreenModel;
}

export function MultiStepOnboardingContent({screen}: MultiStepOnboardingContentProps) {
  return (
    <YStack flex={1} paddingTop="$2">
      <OnboardingStepContent screen={screen} />
    </YStack>
  );
}
