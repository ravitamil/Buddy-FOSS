import {EmptyState} from '@ravitamil/buddy-ui';
import React from 'react';

import {VStack} from '@ravitamil/buddy-ui';

interface LoansScreenEmptyStateProps {
  onAddLoan: () => void;
}

export const LoansScreenEmptyState = ({onAddLoan}: LoansScreenEmptyStateProps) => (
  <VStack flex={1} justifyContent="center" alignItems="center" gap="$4">
    <EmptyState
      icon="wallet"
      iconColor="#3B82F6"
      iconAccessibilityLabel="Add loan"
      onIconPress={onAddLoan}
      title="No Loans Yet"
      description="Track your loans and manage EMI payments efficiently"
    />
  </VStack>
);
