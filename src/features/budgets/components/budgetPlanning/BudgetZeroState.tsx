import {Button, HStack, LottieAnimationView, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import spinningCoinAnimation from '../../../../../assets/lottie/spinning-coin.json';

import {BudgetPlanningGlassFrame} from './BudgetPlanningGlassFrame';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

export const BudgetZeroState = React.memo(({onSetupBudget}: {onSetupBudget: () => void}) => {
  const {isDarkMode} = useTamaguiTheme();
  const buttonBgColor = isDarkMode ? '#38BDF8' : '#0284C7';
  const buttonTextColor = isDarkMode ? '#0F172A' : '#FFFFFF';
  return (
    <VStack width="100%" gap="$3" marginTop="$2">
      <Text color="$text" weight="bold" variant="h5">
        Your budget
      </Text>
      <BudgetPlanningGlassFrame padding={20}>
        <VStack gap="$4">
          <HStack alignItems="center" gap="$3">
            <VStack
              width={120}
              height={120}
              flexShrink={0}
              alignItems="center"
              justifyContent="center">
              <LottieAnimationView
                testID="budget-zero-state-animation"
                source={spinningCoinAnimation}
                autoPlay
                loop
                resizeMode="contain"
                width={180}
                height={180}
              />
            </VStack>
            <VStack flex={1} gap="$2">
              <Text variant="h5" color="$text" weight="bold">
                Give your money a purpose
              </Text>
              <Text variant="body2" color="$textSecondary" lineHeight={20}>
                Balance spending, savings, and bills in one clear plan.
              </Text>
            </VStack>
          </HStack>
          <Button
            size="large"
            width="100%"
            borderRadius={999}
            backgroundColor={buttonBgColor}
            pressStyle={{opacity: 0.8}}
            onPress={onSetupBudget}
            accessibilityLabel="Set up your budget">
            <Text color={buttonTextColor} weight="semibold">
              Get started
            </Text>
          </Button>
        </VStack>
      </BudgetPlanningGlassFrame>
    </VStack>
  );
});
