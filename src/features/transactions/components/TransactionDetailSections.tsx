import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {ConfirmationDialog} from '@ravitamil/buddy-ui/overlays';
import type {Category, Transaction} from '@/types';

import type {TransactionDetailIcon} from '../hooks/useTransactionDetailScreenModel';
import {TransactionDetailActions} from './TransactionDetailActions';
import {TransactionInformationCard, TransactionOverviewCard} from './TransactionDetailContent';

interface TransactionDetailSectionsProps {
  transaction: Transaction;
  category?: Category;
  walletName?: string;
  groupName?: string;
  isLoanPayment: boolean;
  isSubscriptionPayment: boolean;
  isGroupTransaction: boolean;
  canEditAmount: boolean;
  transactionIcon: TransactionDetailIcon;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
  onEditTransaction: () => void;
  onNavigateToSource?: () => void;
  onDeleteTransaction: () => void;
}

interface DeleteTransactionModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function TransactionDetailNotFound({isDarkMode}: {isDarkMode: boolean}) {
  return (
    <VStack flex={1} padding="$4" gap="$4">
      <VStack flex={1} justifyContent="center" alignItems="center" gap="$4">
        <Ionicons
          name="document-text-outline"
          size={64}
          color={isDarkMode ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'}
        />
        <Text variant="h3" color="$text" weight="bold" textAlign="center">
          Transaction not found
        </Text>
        <Text variant="body2" color="$textSecondary" textAlign="center">
          This transaction may have been deleted or moved.
        </Text>
      </VStack>
    </VStack>
  );
}

export function TransactionDetailSections({
  transaction,
  category,
  walletName,
  groupName,
  isLoanPayment,
  isSubscriptionPayment,
  isGroupTransaction,
  canEditAmount,
  transactionIcon,
  isDarkMode,
  formatCurrency,
  onEditTransaction,
  onNavigateToSource,
  onDeleteTransaction,
}: TransactionDetailSectionsProps) {
  return (
    <VStack flex={1} padding="$4" gap="$4">
      <TransactionOverviewCard
        transaction={transaction}
        category={category}
        transactionIcon={transactionIcon}
        isDarkMode={isDarkMode}
        formatCurrency={formatCurrency}
      />
      <TransactionInformationCard
        transaction={transaction}
        category={category}
        walletName={walletName}
        groupName={groupName}
        isLoanPayment={isLoanPayment}
        isSubscriptionPayment={isSubscriptionPayment}
        isGroupTransaction={isGroupTransaction}
        isDarkMode={isDarkMode}
        onNavigateToSource={onNavigateToSource}
      />
      <TransactionDetailActions
        isDarkMode={isDarkMode}
        canEditAmount={canEditAmount}
        isLoanPayment={isLoanPayment}
        isGroupTransaction={isGroupTransaction}
        onEditTransaction={onEditTransaction}
        onNavigateToSource={onNavigateToSource}
        onDeleteTransaction={onDeleteTransaction}
      />
    </VStack>
  );
}

export function DeleteTransactionModal({
  isVisible,
  onCancel,
  onConfirm,
}: DeleteTransactionModalProps) {
  return (
    <ConfirmationDialog
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Delete Transaction"
      description="Are you sure you want to delete this transaction? This action cannot be undone."
      onCancel={onCancel}
      onConfirm={() => void onConfirm()}
      confirmLabel="Delete"
    />
  );
}
