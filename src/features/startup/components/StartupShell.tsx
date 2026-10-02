import {useCallback} from 'react';
import {LottieAnimationView, Text} from '@ravitamil/buddy-ui';
import {YStack} from 'tamagui';
import {ScreenContainer} from '@/components/ui';
import loadingAnimation from '../../../../assets/lottie/Loading.json';
import {markStartupPhase} from '@/services/StartupTelemetry';

interface StartupShellProps {
  message?: string;
}

export function StartupShell({message = 'Getting Buddy ready…'}: StartupShellProps) {
  const handleLayout = useCallback(() => {
    markStartupPhase('first_shell');
  }, []);

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap="$4"
        paddingHorizontal="$6"
        onLayout={handleLayout}>
        <LottieAnimationView
          source={loadingAnimation}
          width={160}
          height={160}
          autoPlay
          loop
          backgroundColor="transparent"
        />
        <YStack alignItems="center" gap="$2">
          <Text
            selectable
            color="$color"
            fontFamily="$heading"
            fontSize="$8"
            fontWeight="700"
            letterSpacing={-0.5}>
            Buddy
          </Text>
          <Text
            selectable
            color="$colorSecondary"
            fontFamily="$body"
            fontSize="$3"
            textAlign="center">
            {message}
          </Text>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
