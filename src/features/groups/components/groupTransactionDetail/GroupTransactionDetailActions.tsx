import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {
  TransactionDetailActionButton,
  TransactionDetailGlassCard,
} from '@/features/transactions/components/TransactionDetailChrome';
import type {Transaction} from '@/types';
import type {UseGroupTransactionDetailScreenResult} from '../../hooks/useGroupTransactionDetailScreen';

interface GroupTransactionDetailSectionsProps {
  screen: UseGroupTransactionDetailScreenResult;
}

export const SettlementDetailsSection = ({screen}: GroupTransactionDetailSectionsProps) => {
  const {group, transaction} = screen;
  if (!group || !transaction?.isSettlement || !transaction.settledDebts?.length) return null;

  return (
    <TransactionDetailGlassCard>
      <VStack gap="$3">
        <Text variant="h5" color="$text" weight="bold">
          Settlement Details
        </Text>
        <Text variant="body2" color="$textSecondary">
          This payment resolves the following debts:
        </Text>

        <VStack gap="$2">
          {transaction.settledDebts.map((debtTransactionId) => (
            <SettlementDebtRow
              key={debtTransactionId}
              debtTransactionId={debtTransactionId}
              transaction={transaction}
              screen={screen}
            />
          ))}
        </VStack>
      </VStack>
    </TransactionDetailGlassCard>
  );
};

export const ActionButtonsSection = ({screen}: GroupTransactionDetailSectionsProps) => {
  const {transaction} = screen;
  if (!transaction) return null;

  return (
    <VStack gap="$3">
      {!transaction.isSettlement && (
        <>
          <TransactionDetailActionButton
            icon="pencil"
            label="Edit Transaction"
            color="#FBBF24"
            isDarkMode={screen.isDarkMode}
            onPress={screen.handleEdit}
          />
          <TransactionDetailActionButton
            icon="trash"
            label="Delete Transaction"
            color="#EF4444"
            isDarkMode={screen.isDarkMode}
            onPress={screen.handleDelete}
          />
        </>
      )}

      <TransactionDetailActionButton
        icon="people"
        label="View Group Details"
        color="#4ECDC4"
        isDarkMode={screen.isDarkMode}
        onPress={screen.handleViewGroup}
      />
      <TransactionDetailActionButton
        icon="receipt"
        label="View All Group Transactions"
        color="#2196F3"
        isDarkMode={screen.isDarkMode}
        onPress={screen.handleViewAllTransactions}
      />
    </VStack>
  );
};

const SettlementDebtRow = ({
  debtTransactionId,
  transaction,
  screen,
}: {
  debtTransactionId: string;
  transaction: Transaction;
  screen: UseGroupTransactionDetailScreenResult;
}) => {
  const originalTx = screen.group?.transactions?.find((item) => item.id === debtTransactionId);
  const settledAmount = transaction.settledDebtAmounts?.[debtTransactionId] || 0;
  if (!originalTx || settledAmount <= 0.001) return null;

  const creditorName = originalTx.paidBy
    ? screen.group?.members.find((member) => member.id === originalTx.paidBy)?.name || 'Unknown'
    : 'Unknown';
  const debtorName =
    originalTx.splitDetails?.find((split) => split.memberId === transaction.paidBy)?.memberName ||
    screen.group?.members.find((member) => member.id === transaction.paidBy)?.name ||
    'Unknown';

  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      padding={8}
      borderRadius={8}
      backgroundColor={screen.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}>
      <VStack>
        <Text variant="body2" color="$text">
          {screen.formatMemberName(debtorName)} owes
        </Text>
        <Text variant="caption" color="$textSecondary">
          to {screen.formatMemberName(creditorName)}
        </Text>
      </VStack>

      <HStack alignItems="center" gap="$1">
        <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
        <Text variant="body2" color="$green5" weight="semibold">
          {screen.formatCurrency(settledAmount)}
        </Text>
      </HStack>
    </HStack>
  );
};
