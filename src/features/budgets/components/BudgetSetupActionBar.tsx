import {Button, GlassSurface} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {XStack, YStack} from 'tamagui';

import type {UseBudgetSetupScreenResult} from '../hooks/useBudgetSetupScreenTypes';

interface BudgetSetupActionBarProps {
  screen: UseBudgetSetupScreenResult;
}

export function BudgetSetupActionBar({screen}: BudgetSetupActionBarProps) {
  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    saveBudget,
    canProceedToNextStep,
    isSaving,
    existingBudget,
  } = screen;

  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      paddingHorizontal="$4"
      paddingBottom="$4"
      paddingTop="$2">
      <GlassSurface padding={10} borderRadius={22}>
        {currentStep === 0 ? (
          <XStack gap="$2.5" width="100%">
            <Button
              variant="outline"
              size="large"
              flex={0.38}
              onPress={goToPreviousStep}
              accessibilityLabel="Cancel or go back"
              leftIcon={<Ionicons name="arrow-back" size={18} color="$color" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="large"
              flex={0.62}
              onPress={goToNextStep}
              disabled={!canProceedToNextStep}
              accessibilityLabel="Continue to Allocations"
              rightIcon={<Ionicons name="arrow-forward" size={18} color="$buttonPrimaryText" />}>
              Next: Allocations
            </Button>
          </XStack>
        ) : currentStep === 1 ? (
          <XStack gap="$2.5" width="100%">
            <Button
              variant="outline"
              size="large"
              flex={0.38}
              onPress={goToPreviousStep}
              accessibilityLabel="Back to Foundation"
              leftIcon={<Ionicons name="arrow-back" size={18} color="$color" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="large"
              flex={0.62}
              onPress={goToNextStep}
              disabled={!canProceedToNextStep}
              accessibilityLabel="Continue to Review"
              rightIcon={<Ionicons name="arrow-forward" size={18} color="$buttonPrimaryText" />}>
              Next: Review
            </Button>
          </XStack>
        ) : (
          <XStack gap="$2.5" width="100%">
            <Button
              variant="outline"
              size="large"
              flex={0.38}
              onPress={goToPreviousStep}
              disabled={isSaving}
              accessibilityLabel="Back to Allocations"
              leftIcon={<Ionicons name="arrow-back" size={18} color="$color" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="large"
              flex={0.62}
              onPress={() => {
                void saveBudget();
              }}
              loading={isSaving}
              disabled={isSaving}
              accessibilityLabel={existingBudget ? 'Save Changes' : 'Create Budget Plan'}
              rightIcon={<Ionicons name="checkmark-circle" size={18} color="$buttonPrimaryText" />}>
              {existingBudget ? 'Save Changes' : 'Create Budget Plan'}
            </Button>
          </XStack>
        )}
      </GlassSurface>
    </YStack>
  );
}
