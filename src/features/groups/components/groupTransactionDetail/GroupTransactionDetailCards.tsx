import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Image} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import {
  TransactionDetailGlassCard,
  TransactionOverviewHeader,
} from '@/features/transactions/components/TransactionDetailChrome';
import type {UseGroupTransactionDetailScreenResult} from '../../hooks/useGroupTransactionDetailScreen';

interface GroupTransactionDetailSectionsProps {
  screen: UseGroupTransactionDetailScreenResult;
}

export const GroupTransactionOverview = ({screen}: GroupTransactionDetailSectionsProps) => {
  const {transaction, splitDetails, transactionIcon} = screen;
  if (!transaction) return null;

  const category = screen.getCategory(transaction.categoryId);

  return (
    <TransactionDetailGlassCard>
      <VStack gap="$4">
        <TransactionOverviewHeader
          iconName={transactionIcon.name}
          iconColor={transactionIcon.color}
          title={screen.dynamicDescription}
          subtitle={
            <Text variant="body2" color="$textSecondary">
              {transaction.type === 'expense' ? 'Group Expense' : 'Payment'}
            </Text>
          }
          amount={
            <>
              {transaction.amount > 0 ? '+' : ''}
              {screen.formatCurrency(Math.abs(transaction.amount))}
            </>
          }
          amountColor={transaction.amount > 0 ? '$green5' : '$red5'}
          dateLabel={new Date(transaction.date).toLocaleDateString()}
        />

        <VStack gap="$2">
          <Text variant="body1" color="$text" weight="semibold">
            Paid by{' '}
            {splitDetails?.isPaidByCurrentUser
              ? 'You'
              : screen.formatMemberName(splitDetails?.paidByMember?.name || '')}
          </Text>
          {transaction.categoryId && (
            <HStack alignItems="center" gap="$2">
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: category?.color || '#9E9E9E',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text fontSize={12}>{category?.icon || '\uD83D\uDCDD'}</Text>
              </View>
              <Text variant="body2" color="$textSecondary">
                {category?.name || transaction.category}
              </Text>
            </HStack>
          )}
          {!transaction.categoryId &&
            transaction.category &&
            transaction.category !== transaction.description && (
              <Text variant="body2" color="$textSecondary">
                Category: {transaction.category}
              </Text>
            )}
        </VStack>
      </VStack>
    </TransactionDetailGlassCard>
  );
};

export const SplitDetailsSection = ({screen}: GroupTransactionDetailSectionsProps) => {
  const {transaction, splitDetails} = screen;
  if (transaction?.type !== 'expense' || !splitDetails?.memberSplits.length) return null;

  return (
    <TransactionDetailGlassCard>
      <VStack gap="$3">
        <Text variant="h5" color="$text" weight="bold">
          Split Details
        </Text>

        {splitDetails.memberSplits.map((split) => {
          if (!split.member) return null;

          const splitAmount = split.amount || 0;
          const percentage =
            splitDetails.totalAmount > 0 ? (splitAmount / splitDetails.totalAmount) * 100 : 0;

          return (
            <HStack key={split.member.id} justifyContent="space-between" alignItems="center">
              <HStack alignItems="center" gap="$3" flex={1}>
                <LinearGradient
                  colors={split.isCurrentUser ? ['#4CAF50', '#45A049'] : ['#2196F3', '#1976D2']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Ionicons name="person" size={16} color="white" />
                </LinearGradient>

                <VStack flex={1}>
                  <Text variant="body1" color="$text" weight="medium">
                    {split.isCurrentUser ? 'You' : screen.formatMemberName(split.member.name)}
                  </Text>
                  <Text variant="caption" color="$textSecondary">
                    {percentage.toFixed(1)}% of total
                  </Text>
                </VStack>
              </HStack>

              <Text variant="body1" color="$text" weight="semibold">
                {screen.formatCurrency(splitAmount)}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </TransactionDetailGlassCard>
  );
};

export const GroupMembersSection = ({screen}: GroupTransactionDetailSectionsProps) => {
  const {group, transaction} = screen;
  if (!group || !transaction) return null;

  return (
    <TransactionDetailGlassCard>
      <VStack gap="$3">
        <Text variant="h5" color="$text" weight="bold">
          Group Members
        </Text>

        {group.members.map((member) => {
          const isCurrentUser = member.id === screen.currentUserMember?.id;
          const isPaidBy = member.id === transaction.paidBy;

          return (
            <HStack key={member.id} justifyContent="space-between" alignItems="center">
              <HStack alignItems="center" gap="$3" flex={1}>
                <LinearGradient
                  colors={
                    isCurrentUser
                      ? ['#4CAF50', '#45A049']
                      : isPaidBy
                        ? ['#FF9800', '#F57C00']
                        : ['#9E9E9E', '#757575']
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Ionicons name="person" size={16} color="white" />
                </LinearGradient>

                <Text variant="body1" color="$text" weight="medium">
                  {isCurrentUser ? 'You' : screen.formatMemberName(member.name)}
                </Text>
              </HStack>

              {isPaidBy && (
                <HStack alignItems="center" gap="$1">
                  <Ionicons name="card" size={16} color="#FF9800" />
                  <Text variant="caption" color="#FF9800" weight="medium">
                    Paid
                  </Text>
                </HStack>
              )}
            </HStack>
          );
        })}
      </VStack>
    </TransactionDetailGlassCard>
  );
};

export const ReceiptSection = ({screen}: GroupTransactionDetailSectionsProps) => {
  const receiptUrl = screen.transaction?.receiptUrl;
  if (!receiptUrl) return null;

  return (
    <TransactionDetailGlassCard padding={12}>
      <VStack gap="$2">
        <Text variant="h5" color="$text" weight="bold" marginBottom={8}>
          Receipt
        </Text>

        <View
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: screen.isDarkMode
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            borderColor: screen.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}>
          <Image
            source={{uri: receiptUrl}}
            style={{width: '100%', height: 200}}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
      </VStack>
    </TransactionDetailGlassCard>
  );
};
