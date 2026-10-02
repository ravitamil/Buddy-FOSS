import {Button, GlassSurface, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {ScreenContainer, ScreenWrapper} from '@/components/ui';

export function BudgetDetailsEmptyState({onCreateBudget}: {onCreateBudget: () => void}) {
  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false}>
        <VStack flex={1} padding="$4" justifyContent="center" alignItems="center">
          <GlassSurface>
            <VStack alignItems="center" gap="$3" padding="$4">
              <Text variant="h4" color="$text" weight="bold" textAlign="center">
                No budget plan yet
              </Text>
              <Text variant="body2" color="$textSecondary" textAlign="center">
                Create a plan to track spending, commitments, savings, and safe-to-spend amounts.
              </Text>
              <Button variant="primary" onPress={onCreateBudget}>
                Create budget plan
              </Button>
            </VStack>
          </GlassSurface>
        </VStack>
      </ScreenWrapper>
    </ScreenContainer>
  );
}
