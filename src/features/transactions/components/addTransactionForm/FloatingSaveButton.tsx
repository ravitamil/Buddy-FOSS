import React from 'react';
import {Button} from '@ravitamil/buddy-ui';
import {YStack} from 'tamagui';

interface FloatingSaveButtonProps {
  canSave: boolean;
  isEditMode: boolean;
  isIncome: boolean;
  isSaving: boolean;
  onPress: () => void;
}

export function FloatingSaveButton({
  canSave,
  isEditMode,
  isIncome,
  isSaving,
  onPress,
}: FloatingSaveButtonProps) {
  const isDisabled = !canSave;
  const action = isEditMode ? 'Update' : 'Save';
  const transactionLabel = isIncome ? 'Income' : 'Expense';
  const label = isSaving
    ? `${isEditMode ? 'Updating' : 'Saving'} ${transactionLabel}...`
    : `${action} ${transactionLabel}`;

  return (
    <YStack
      testID="transaction-action-bar"
      backgroundColor="$surface"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      paddingHorizontal="$4"
      paddingTop="$3"
      paddingBottom="$3">
      <Button
        width="100%"
        size="large"
        loading={isSaving}
        loadingLabel={label}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{disabled: isDisabled, busy: isSaving}}
        onPress={onPress}
        accessibilityLabel={isEditMode ? 'Update transaction' : 'Save transaction'}
        accessibilityHint={
          isEditMode
            ? 'Updates the existing transaction with your changes'
            : 'Saves this new transaction'
        }>
        {label}
      </Button>
    </YStack>
  );
}
