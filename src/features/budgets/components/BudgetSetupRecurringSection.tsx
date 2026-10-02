import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import type {UseBudgetSetupScreenResult} from '../hooks/useBudgetSetupScreen';
import {AddEditBudgetCard} from './AddEditBudgetCard';
import {BudgetToggle} from './BudgetSetupControls';

export function BudgetSetupRecurringSection({screen}: {screen: UseBudgetSetupScreenResult}) {
  return (
    <AddEditBudgetCard
      title="Fixed Commitments"
      subtitle="Auto-calculated from your active loans, subscriptions, and recurring bills."
      icon="repeat"
      accentColor="#8B5CF6">
      <VStack gap="$3">
        <CommitmentRow
          label="Loan payments (EMI)"
          value={screen.formatCurrency(screen.totals.committedLoanAmount)}
        />
        <CommitmentRow
          label="Subscriptions"
          value={screen.formatCurrency(screen.totals.committedSubscriptionAmount)}
        />
        <HStack
          justifyContent="space-between"
          alignItems="center"
          gap="$3"
          paddingTop="$2"
          borderTopWidth={1}
          borderColor="$borderColor">
          <VStack flex={1} gap="$1">
            <Text variant="body1" color="$text" weight="semibold">
              Link recurring expenses
            </Text>
            <Text variant="caption" color="$textSecondary">
              Reserve active recurring bills outside flexible spending.
            </Text>
          </VStack>
          <BudgetToggle
            enabled={screen.autoPopulateFromRecurring}
            onChange={screen.setAutoPopulateFromRecurring}
            accessibilityLabel="Link recurring expenses"
          />
        </HStack>
        {screen.autoPopulateFromRecurring ? (
          screen.linkedRecurringItems.length > 0 ? (
            <VStack gap="$2" paddingTop="$1">
              {screen.linkedRecurringItems.map((item) => (
                <HStack key={item.templateId} justifyContent="space-between" gap="$3">
                  <VStack flex={1} gap="$1">
                    <Text variant="body2" color="$text" weight="semibold">
                      {item.description}
                    </Text>
                    <Text variant="caption" color="$textSecondary">
                      {item.type === 'expense' ? 'Expense' : 'Income'}
                    </Text>
                  </VStack>
                  <Text variant="body2" color="$text" weight="semibold">
                    {screen.formatCurrency(item.amount)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          ) : (
            <Text variant="caption" color="$textSecondary">
              No active recurring transactions are available to link.
            </Text>
          )
        ) : null}
      </VStack>
    </AddEditBudgetCard>
  );
}

function CommitmentRow({label, value}: {label: string; value: string}) {
  return (
    <HStack justifyContent="space-between" gap="$3">
      <Text variant="body2" color="$textSecondary">
        {label}
      </Text>
      <Text variant="body2" color="$text" weight="semibold">
        {value}
      </Text>
    </HStack>
  );
}
