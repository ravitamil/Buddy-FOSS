import {useBuddyColors} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScrollView} from 'tamagui';

import {GroupTransactionItem} from './GroupTransactionItem';
import {GroupEmptyState} from './GroupEmptyState';
import type {GroupTransactionFilter, GroupDetailSectionsProps} from '../types/groupDetailScreen';

type Props = Pick<
  GroupDetailSectionsProps,
  | 'group'
  | 'filteredTopTransactions'
  | 'transactionFilter'
  | 'isDarkMode'
  | 'formatCurrency'
  | 'onSetFilter'
  | 'onAddTransaction'
  | 'onAllTransactions'
  | 'onTransactionPress'
  | 'getTransactionItem'
>;

const filters: {value: GroupTransactionFilter; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'paid_by_me', label: 'Paid by me'},
  {value: 'my_share', label: 'My share'},
];

export const GroupDetailTransactionsSection: React.FC<Props> = ({
  filteredTopTransactions,
  transactionFilter,
  isDarkMode,
  formatCurrency,
  onSetFilter,
  onAddTransaction,
  onAllTransactions,
  onTransactionPress,
  getTransactionItem,
}) => {
  const colors = useBuddyColors();
  const brandIconColor = colors.iconBrand;
  const primaryColor = colors.iconBrand;
  const activeBg = colors.primary;
  const activeBorder = colors.primary;
  const inactiveBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const inactiveBorder = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <VStack gap="$3">
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap="$2" alignItems="center">
          <Ionicons name="time-outline" size={18} color={brandIconColor} />
          <Text variant="h4" weight="bold">
            Recent Transactions
          </Text>
        </HStack>
        <HStack
          accessibilityRole="button"
          accessibilityLabel="See all transactions"
          onPress={onAllTransactions}
          pressStyle={{opacity: 0.8}}
          alignItems="center"
          gap="$1">
          <Text color={primaryColor} variant="body1" weight="semibold">
            See All
          </Text>
          <Ionicons name="chevron-forward" size={16} color={primaryColor} />
        </HStack>
      </HStack>

      <ScrollView
        removeClippedSubviews={false}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingVertical: 4}}>
        <HStack gap="$2">
          {filters.map((filter) => {
            const isActive = transactionFilter === filter.value;
            return (
              <HStack
                key={filter.value}
                accessibilityRole="button"
                accessibilityState={{selected: isActive}}
                onPress={() => onSetFilter(filter.value)}
                pressStyle={{opacity: 0.8}}
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius="$5"
                backgroundColor={isActive ? activeBg : inactiveBg}
                borderWidth={1}
                borderColor={isActive ? activeBorder : inactiveBorder}>
                <Text
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? '$buttonPrimaryText' : '$textSecondary'}>
                  {filter.label}
                </Text>
              </HStack>
            );
          })}
        </HStack>
      </ScrollView>

      {filteredTopTransactions.length > 0 ? (
        <VStack gap="$2">
          {filteredTopTransactions.map((transaction) => {
            const item = getTransactionItem(transaction);
            return item ? (
              <GroupTransactionItem
                key={transaction.id}
                {...item}
                formatCurrency={formatCurrency}
                onPress={() => onTransactionPress(transaction.id)}
              />
            ) : null;
          })}
        </VStack>
      ) : (
        <GroupEmptyState
          iconName="receipt-outline"
          title="No Transactions Yet"
          subtitle="Start tracking group expenses by adding your first transaction."
          ctaLabel="Add Expense"
          onCtaPress={onAddTransaction}
        />
      )}
    </VStack>
  );
};
