import {HStack, Input} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ConfirmationDialog, Dialog} from '@ravitamil/buddy-ui/overlays';

export const SavingsGoalEditButton = ({
  isDarkMode,
  onPress,
}: {
  isDarkMode: boolean;
  onPress: () => void;
}) => (
  <HStack
    accessibilityRole="button"
    accessibilityLabel="Edit savings goal"
    onPress={onPress}
    pressStyle={{opacity: 0.8}}
    width={44}
    height={44}
    borderRadius="$10"
    alignItems="center"
    justifyContent="center"
    backgroundColor={isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}>
    <Ionicons name="create-outline" size={20} color="#3b82f6" />
  </HStack>
);

export const SavingsGoalDeleteDialog = ({
  goalName,
  onCancel,
  onConfirm,
}: {
  goalName: string;
  isDarkMode: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  return (
    <ConfirmationDialog
      open
      onOpenChange={handleOpenChange}
      title="Delete savings goal?"
      description={`Are you sure you want to delete "${goalName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      confirmTone="destructive"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export const SavingsGoalAddAmountDialog = ({
  amount,
  isSubmitting,
  onAmountChange,
  onCancel,
  onConfirm,
}: {
  amount: string;
  isDarkMode: boolean;
  isSubmitting: boolean;
  onAmountChange: (amount: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  return (
    <Dialog
      open
      onOpenChange={handleOpenChange}
      title="Add to savings"
      description="Enter the amount you want to add to your savings."
      actions={[
        {label: 'Cancel', onPress: () => undefined},
        {
          label: isSubmitting ? 'Adding…' : 'Add',
          onPress: onConfirm,
          tone: 'success',
          disabled: isSubmitting || amount.trim().length === 0,
          closeOnPress: false,
        },
      ]}>
      <Input
        autoFocus
        value={amount}
        onChangeText={onAmountChange}
        editable={!isSubmitting}
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={onConfirm}
        placeholder="0.00"
        accessibilityLabel="Amount to add"
      />
    </Dialog>
  );
};
