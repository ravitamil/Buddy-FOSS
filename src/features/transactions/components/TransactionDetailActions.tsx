import {Button, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack} from 'tamagui';

export function TransactionDetailActions({
  isLoanPayment,
  isGroupTransaction,
  onEditTransaction,
  onNavigateToSource,
  onDeleteTransaction,
}: {
  isDarkMode?: boolean;
  canEditAmount?: boolean;
  isLoanPayment: boolean;
  isGroupTransaction: boolean;
  onEditTransaction: () => void;
  onNavigateToSource?: () => void;
  onDeleteTransaction: () => void;
}) {
  return (
    <VStack gap="$3" marginTop="$2">
      {isLoanPayment ? (
        <VStack gap="$1.5">
          <Button
            variant="outline"
            onPress={onNavigateToSource ?? onEditTransaction}
            accessibilityLabel="Manage loan details">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="card-outline" size={18} color="$primary" />
              <Text variant="body1" weight="semibold" color="$primary">
                View Loan Contract
              </Text>
            </XStack>
          </Button>
          <Text variant="caption" color="$colorSubtitle" textAlign="center">
            This transaction was auto-recorded for your loan EMI. Manage payments from the Loans
            tab.
          </Text>
        </VStack>
      ) : isGroupTransaction ? (
        <Button
          variant="primary"
          onPress={onNavigateToSource ?? onEditTransaction}
          accessibilityLabel="View in group">
          <XStack alignItems="center" gap="$2">
            <Ionicons name="people" size={18} color="#ffffff" />
            <Text variant="body1" weight="semibold" color="#ffffff">
              View Group Expense
            </Text>
          </XStack>
        </Button>
      ) : (
        <Button variant="primary" onPress={onEditTransaction} accessibilityLabel="Edit transaction">
          <XStack alignItems="center" gap="$2">
            <Ionicons name="create-outline" size={18} color="#ffffff" />
            <Text variant="body1" weight="semibold" color="#ffffff">
              Edit Transaction
            </Text>
          </XStack>
        </Button>
      )}

      <Button
        variant="outline"
        onPress={onDeleteTransaction}
        accessibilityLabel="Delete transaction">
        <XStack alignItems="center" gap="$2">
          <Ionicons name="trash-outline" size={18} color="$badgeDangerText" />
          <Text variant="body1" weight="semibold" color="$badgeDangerText">
            Delete Transaction
          </Text>
        </XStack>
      </Button>
    </VStack>
  );
}
