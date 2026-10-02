import React from 'react';
import {FormField} from '@ravitamil/buddy-ui/FormField';
import {Text} from '@ravitamil/buddy-ui';
import {YStack} from 'tamagui';
import {AddTransactionCard} from './AddTransactionCard';

interface DescriptionSectionProps {
  description: string;
  isExpanded?: boolean;
  isIncome: boolean;
  onChangeDescription: (description: string) => void;
  onSubmitDescription: () => void;
  onToggleExpanded?: () => void;
}

export function DescriptionSection({
  description,
  isIncome,
  onChangeDescription,
  onSubmitDescription,
}: DescriptionSectionProps) {
  return (
    <AddTransactionCard>
      <YStack gap="$2.5">
        <Text variant="h5" weight="semibold" color="$color">
          Note / Description
        </Text>
        <FormField
          id="transaction-description"
          size="small"
          placeholder={
            isIncome
              ? 'e.g., Monthly salary, Freelance project'
              : 'e.g., Grocery shopping, Dinner out'
          }
          value={description}
          onChangeText={onChangeDescription}
          multiline
          numberOfLines={2}
          maxLength={160}
          showCharacterCount
          testID="transaction-description"
          onSubmitEditing={onSubmitDescription}
        />
      </YStack>
    </AddTransactionCard>
  );
}
