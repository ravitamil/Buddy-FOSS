import {LottieAnimationView} from '@ravitamil/buddy-ui';
import React, {useEffect} from 'react';
import {router} from 'expo-router';
import type {Href} from 'expo-router';
import {YStack} from 'tamagui';

import successAnimation from '../../../../assets/lottie/Success.json';
import {ScreenContainer} from '@/components/ui';

interface SuccessAnimationScreenProps {
  /**
   * Type of success animation
   */
  type?: 'newUser' | 'existingUser';
  /**
   * Optional custom message
   */
  message?: string;
  /**
   * Animation duration in milliseconds before navigating
   * @default 1500
   */
  duration?: number;
  /**
   * Navigation target after animation
   * @default '/(tabs)'
   */
  navigateTo?: string;
  /**
   * Optional callback when animation completes
   */
  onComplete?: () => void;
}

export function SuccessAnimationScreen({
  duration = 1500,
  navigateTo = '/(tabs)',
  onComplete,
}: SuccessAnimationScreenProps) {
  useEffect(() => {
    // Navigate to main app after animation duration
    const navigationTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        appLogger.debug('🎯 SuccessAnimationScreen: Navigating to:', navigateTo);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        router.replace(navigateTo as Href);
      }
    }, duration);

    return () => {
      clearTimeout(navigationTimer);
    };
  }, [duration, navigateTo, onComplete]);

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea={true}>
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieAnimationView
          source={successAnimation}
          width={250}
          height={250}
          autoPlay={true}
          loop={false}
          speed={1}
          resizeMode="contain"
          backgroundColor="transparent"
          onAnimationReady={() => {
            appLogger.debug('✅ Success animation loaded and playing');
          }}
        />
      </YStack>
    </ScreenContainer>
  );
}

export default SuccessAnimationScreen;
