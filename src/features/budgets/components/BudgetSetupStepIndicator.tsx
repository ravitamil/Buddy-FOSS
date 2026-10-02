import {createAlphaColor, Text} from '@ravitamil/buddy-ui';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {XStack, YStack} from 'tamagui';

import type {BudgetSetupStep} from '../hooks/useBudgetSetupScreenTypes';

export interface BudgetStepInfo {
  step: BudgetSetupStep;
  title: string;
  shortTitle: string;
}

export const BUDGET_SETUP_STEPS: BudgetStepInfo[] = [
  {
    step: 0,
    title: 'Plan & Income Foundation',
    shortTitle: 'Basics & Income',
  },
  {
    step: 1,
    title: 'Spending & Savings Allocations',
    shortTitle: 'Allocations',
  },
  {
    step: 2,
    title: 'Categories & Review',
    shortTitle: 'Review',
  },
];

interface BudgetSetupStepIndicatorProps {
  currentStep: BudgetSetupStep;
  scrollY?: SharedValue<number>;
  isDarkMode?: boolean;
  title?: string;
  onBack?: () => void;
  onClose?: () => void;
}

export function BudgetSetupStepIndicator({
  currentStep,
  scrollY,
  isDarkMode = true,
}: BudgetSetupStepIndicatorProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);
  const currentStepInfo = BUDGET_SETUP_STEPS[currentStep] ?? BUDGET_SETUP_STEPS[0];
  const themeBackgroundColor = isDarkMode ? '#0A0B0E' : '#FFFFFF';

  const scrimStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return {opacity: 0};
    }
    const opacity = interpolate(scrollY.value, [0, 40], [0, 1], Extrapolation.CLAMP);
    return {opacity};
  });

  return (
    <YStack position="absolute" top={0} left={0} right={0} zIndex={10} pointerEvents="box-none">
      {/* Progressive scrim beneath indicator when scrolled */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: topInset + 95,
          },
          scrimStyle,
        ]}>
        <LinearGradient
          colors={[
            themeBackgroundColor,
            createAlphaColor(themeBackgroundColor, 0.95),
            createAlphaColor(themeBackgroundColor, 0),
          ]}
          locations={[0, 0.75, 1]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </Animated.View>

      {/* Step counter, title, and progress bar */}
      <YStack
        paddingHorizontal="$4"
        paddingTop={topInset + 8}
        paddingBottom="$2"
        gap="$2"
        width="100%">
        <YStack gap="$1" width="100%">
          <Text
            variant="body2"
            color="$primary"
            weight="bold"
            textTransform="uppercase"
            letterSpacing={1.2}>
            Step {currentStep + 1} of {BUDGET_SETUP_STEPS.length}
          </Text>
          <Text variant="h3" color="$text" weight="bold">
            {currentStepInfo.title}
          </Text>
        </YStack>

        {/* Progress bar only - stretched to full screen length */}
        <XStack
          testID="budget-setup-progress-bar"
          gap="$2"
          width="100%"
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 1,
            max: BUDGET_SETUP_STEPS.length,
            now: currentStep + 1,
          }}>
          {BUDGET_SETUP_STEPS.map((item) => {
            const isCompleted = item.step < currentStep;
            const isActive = item.step === currentStep;
            return (
              <YStack
                key={item.step}
                flex={1}
                height={5}
                borderRadius="$10"
                backgroundColor={isCompleted || isActive ? '$primary' : '$borderColor'}
                opacity={isActive ? 1 : isCompleted ? 0.8 : 0.35}
              />
            );
          })}
        </XStack>
      </YStack>
    </YStack>
  );
}
