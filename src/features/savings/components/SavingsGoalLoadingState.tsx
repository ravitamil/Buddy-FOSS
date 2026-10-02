import {Button, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';

export const SavingsGoalLoadingState = ({
  availableGoals,
  goalId,
  headerProps,
  loadingTimeout,
  onBack,
  onRetry,
}: {
  availableGoals: number;
  goalId: string;
  headerProps: Record<string, unknown>;
  loadingTimeout: boolean;
  onBack: () => void;
  onRetry: () => void;
}) => (
  <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
    <CustomNavigationHeader
      title="Savings Goal"
      subtitle={loadingTimeout ? 'Failed to load goal' : 'Loading goal information'}
      onBackPress={onBack}
      mode="collapsing"
      {...headerProps}
    />
    <VStack flex={1} padding="$4" gap="$4" paddingTop={118}>
      <VStack flex={1} justifyContent="center" alignItems="center" gap="$4">
        {loadingTimeout ? (
          <>
            <Text color="$red5" textAlign="center">
              Unable to load savings goal details.
            </Text>
            <Text color="$gray10" textAlign="center" fontSize="$3">
              Goal ID: {goalId}
            </Text>
            <Text color="$gray10" textAlign="center" fontSize="$3">
              Available goals: {availableGoals}
            </Text>
            <Button onPress={onRetry} theme="blue">
              Retry
            </Button>
            <Button onPress={onBack} theme="gray">
              Go Back
            </Button>
          </>
        ) : (
          <>
            <Text>Loading savings goal details...</Text>
            <Text color="$gray10" fontSize="$3">
              Goal ID: {goalId}
            </Text>
          </>
        )}
      </VStack>
    </VStack>
  </ScreenContainer>
);
