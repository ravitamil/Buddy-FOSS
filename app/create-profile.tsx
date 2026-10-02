import React, {useCallback} from 'react';
import {YStack} from 'tamagui';
import MultiStepOnboardingScreen from '../src/screenModules/MultiStepOnboardingScreen';
import {markStartupPhase} from '../src/services/StartupTelemetry';

export default function CreateProfileRoute() {
  const handleLayout = useCallback(() => {
    markStartupPhase('app_interactive');
  }, []);

  return (
    <YStack flex={1} onLayout={handleLayout}>
      <MultiStepOnboardingScreen />
    </YStack>
  );
}
