import {Skeleton} from '@ravitamil/buddy-ui';
import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';

import {TransactionItem} from '@/features/transactions/components/TransactionItem';
import type {HomeScreenModel} from '../types';
import {HomeEmptyStateCard} from './HomeEmptyStateCard';
import {HomeSectionHeader} from './HomeSectionHeader';

interface HomeRecentTransactionsSectionProps {
  isLoading: boolean;
  isDarkMode: boolean;
  linkIconColor: string;
  transactions: HomeScreenModel['transactions'];
  formatCurrency: HomeScreenModel['formatCurrency'];
  onViewAll: () => void;
  onAddTransaction: () => void;
}

export const HomeRecentTransactionsSection = ({
  isLoading,
  isDarkMode,
  linkIconColor,
  transactions,
  formatCurrency,
  onViewAll,
  onAddTransaction,
}: HomeRecentTransactionsSectionProps) => (
  <VStack gap="$4" marginTop="$3" marginBottom="$8">
    <HomeSectionHeader
      title="Recent Transactions"
      linkIconColor={linkIconColor}
      isDarkMode={isDarkMode}
      onViewAll={onViewAll}
    />

    <VStack gap="$2">
      <Skeleton visible={isLoading} height={400} borderRadius={16}>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <TransactionItem
              key={`recent-tx-${transaction.id || index}`}
              {...transaction}
              formatCurrency={formatCurrency}
            />
          ))
        ) : (
          <HomeEmptyStateCard
            type="transaction"
            title="No Transactions Yet"
            description="Start tracking your expenses and income by adding your first transaction"
            onPress={onAddTransaction}
          />
        )}
      </Skeleton>
    </VStack>
  </VStack>
);
