import React from 'react';
import {Text} from '@ravitamil/buddy-ui';
import {XStack, YStack} from 'tamagui';
import type {AddTransactionRouteType} from '../../types';
import {AddTransactionChoice} from './AddTransactionChoice';
import {AddTransactionCard} from './AddTransactionCard';

interface TransactionTypeSectionProps {
  isIncome: boolean;
  transactionType: AddTransactionRouteType;
  onSelectType: (type: AddTransactionRouteType) => void;
}

export function TransactionTypeSection({
  isIncome,
  transactionType,
  onSelectType,
}: TransactionTypeSectionProps) {
  return (
    <AddTransactionCard>
      <YStack gap="$3">
        <Text variant="h4" weight="semibold" color="$color">
          Transaction Type
        </Text>
        <XStack gap="$2">
          <AddTransactionChoice
            icon="remove-circle"
            label="Expense"
            tone="error"
            flex={1}
            isSelected={transactionType === 'expense'}
            onPress={() => onSelectType('expense')}
            accessibilityLabel="Select expense transaction type"
            accessibilityHint="Changes the form to record expense"
          />
          <AddTransactionChoice
            icon="add-circle"
            label="Income"
            tone="success"
            flex={1}
            isSelected={isIncome}
            onPress={() => onSelectType('income')}
            accessibilityLabel="Select income transaction type"
            accessibilityHint="Changes the form to record income"
          />
        </XStack>
      </YStack>
    </AddTransactionCard>
  );
}
