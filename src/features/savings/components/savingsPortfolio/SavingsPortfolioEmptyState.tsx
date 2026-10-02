import {EmptyState} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {YStack} from 'tamagui';

export const SavingsPortfolioEmptyState = ({onAddInvestment}: {onAddInvestment: () => void}) => {
  return (
    <YStack marginTop="$6">
      <GlassSurface padding="$4" borderRadius="$4">
        <EmptyState
          icon="trending-up"
          iconColor="#4CAF50"
          iconAccessibilityLabel="Add investment"
          maxTextWidth={280}
          onIconPress={onAddInvestment}
          title="Start Your Investment Journey"
          description="Track your investments and watch your portfolio grow. Add your first investment to get started."
        />
      </GlassSurface>
    </YStack>
  );
};
