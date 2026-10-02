import React from 'react';

import {SuccessAnimationScreen} from '@/features/auth/components/SuccessAnimationScreen';
import {ScreenContainer} from '@/components/ui';
import {MultiStepOnboardingContent, useMultiStepOnboardingScreen} from '@/features/onboarding';

export default function MultiStepOnboardingScreen() {
  const screen = useMultiStepOnboardingScreen();

  if (screen.showSuccess) {
    return (
      <SuccessAnimationScreen
        type="newUser"
        message="Welcome Buddy!"
        duration={3000}
        navigateTo="/(tabs)"
      />
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} dotSize={2} dotSpacing={18}>
      <MultiStepOnboardingContent screen={screen} />
    </ScreenContainer>
  );
}
