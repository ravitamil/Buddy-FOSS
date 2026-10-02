import {Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {YStack} from 'tamagui';

import {LottieAnimationView} from '@ravitamil/buddy-ui';
import premiumButtonAnimation from '../../../../assets/lottie/Premium button animation.json';

export function PlanComparisonHero() {
  return (
    <>
      <YStack alignItems="center" marginTop="$2">
        <LottieAnimationView
          source={premiumButtonAnimation}
          width={140}
          height={140}
          autoPlay={true}
          loop={true}
          speed={0.8}
          backgroundColor="transparent"
        />
      </YStack>

      <YStack alignItems="center" gap="$1">
        <Text variant="h3" weight="bold" textAlign="center">
          Go Pro with Buddy
        </Text>
        <Text variant="body2" color="$gray11" textAlign="center">
          Unlock unlimited groups, priority support & more
        </Text>
      </YStack>
    </>
  );
}
