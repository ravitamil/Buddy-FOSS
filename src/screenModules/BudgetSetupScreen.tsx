import {LoadingIndicator, Text, VStack} from '@ravitamil/buddy-ui';
import {useLocalSearchParams} from 'expo-router';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  BudgetSetupActionBar,
  BudgetSetupSections,
  BudgetSetupStepIndicator,
  useBudgetSetupScreen,
} from '@/features/budgets';

export default function BudgetSetupScreen() {
  const routeParams = useLocalSearchParams<{budgetId?: string; mode?: string}>();
  const budgetId =
    typeof routeParams.budgetId === 'string' && routeParams.budgetId.length > 0
      ? routeParams.budgetId
      : undefined;
  const mode = typeof routeParams.mode === 'string' ? routeParams.mode : undefined;
  const screen = useBudgetSetupScreen({budgetId, mode});
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);

  if (screen.loadError) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['top', 'bottom']}>
        <VStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$3">
          <Text variant="h5" color="$text" weight="bold" textAlign="center">
            Budget plan unavailable
          </Text>
          <Text variant="body2" color="$textSecondary" textAlign="center">
            {screen.loadError}
          </Text>
        </VStack>
      </ScreenContainer>
    );
  }

  if (!screen.isReady) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['top', 'bottom']}>
        <VStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <LoadingIndicator size="large" accessibilityLabel="Loading budget plan" />
        </VStack>
      </ScreenContainer>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
        <BudgetSetupStepIndicator
          currentStep={screen.currentStep}
          scrollY={screen.headerProps?.scrollY}
          isDarkMode={screen.isDarkMode}
        />

        <ScreenWrapper
          edges={[]}
          backgroundColor="transparent"
          padding={false}
          keyboardMode="aware-scroll"
          keyboardBottomOffset={60}
          onScroll={screen.onScroll}
          scrollEventThrottle={16}
          bounces
          contentContainerStyle={{
            paddingTop: topInset + 88,
            paddingBottom: 130,
            flexGrow: 1,
          }}>
          <VStack paddingHorizontal="$4" paddingBottom="$4" gap="$4">
            <BudgetSetupSections screen={screen} />
          </VStack>
        </ScreenWrapper>

        <BudgetSetupActionBar screen={screen} />
      </ScreenContainer>
    </GestureHandlerRootView>
  );
}
