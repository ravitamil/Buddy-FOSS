import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Image, Pressable} from 'react-native';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

import type {Category, Transaction} from '@/types';
import type {TransactionDetailIcon} from '../hooks/useTransactionDetailScreenModel';
import {
  getTransactionAmountColor,
  getTransactionTypeLabel,
  isEmojiCategoryIcon,
} from './transactionDetailPresentation';

interface TransactionOverviewCardProps {
  transaction: Transaction;
  category?: Category;
  transactionIcon: TransactionDetailIcon;
  isDarkMode: boolean;
  formatCurrency: (amount: number) => string;
}

interface TransactionInformationCardProps {
  transaction: Transaction;
  category?: Category;
  walletName?: string;
  groupName?: string;
  isLoanPayment?: boolean;
  isSubscriptionPayment?: boolean;
  isGroupTransaction?: boolean;
  isDarkMode: boolean;
  onNavigateToSource?: () => void;
}

export function TransactionOverviewCard({
  transaction,
  category,
  transactionIcon,
  formatCurrency,
}: TransactionOverviewCardProps) {
  const isIncome = transaction.type === 'income' || transaction.amount > 0;
  const absAmount = Math.abs(transaction.amount);
  const formattedAmount = `${isIncome ? '+' : '-'}${formatCurrency(absAmount)}`;
  const amountColor = getTransactionAmountColor(transaction.amount);

  const receipts = [
    ...(transaction.receiptUrl ? [transaction.receiptUrl] : []),
    ...(transaction.receiptUrls ?? []),
  ].filter((url, index, arr) => arr.indexOf(url) === index);

  return (
    <GlassSurface borderRadius={20} padding="$4.5">
      <VStack gap="$4">
        {/* Top Header: Avatar + Title */}
        <HStack alignItems="center" gap="$3.5">
          <YStack
            width={52}
            height={52}
            borderRadius={16}
            backgroundColor={isIncome ? '$badgeSuccessBg' : '$badgeDangerBg'}
            borderWidth={1}
            borderColor={isIncome ? '$badgeSuccessBorder' : '$badgeDangerBorder'}
            alignItems="center"
            justifyContent="center">
            {category && isEmojiCategoryIcon(category.icon) ? (
              <Text fontSize={24}>{category.icon}</Text>
            ) : (
              <Ionicons
                name={transactionIcon.name}
                size={26}
                color={isIncome ? '$badgeSuccessText' : '$badgeDangerText'}
              />
            )}
          </YStack>

          <VStack flex={1} gap="$0.5">
            <Text variant="h3" color="$color" weight="bold" numberOfLines={2}>
              {transaction.description || 'Untitled Transaction'}
            </Text>
            <Text variant="caption" color="$colorSubtitle">
              {new Date(transaction.date).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </VStack>
        </HStack>

        {/* Hero Amount Display */}
        <VStack
          paddingVertical="$3"
          paddingHorizontal="$4"
          borderRadius={14}
          backgroundColor="$surfacePress"
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          gap="$1">
          <Text variant="caption" color="$colorSubtitle" weight="medium">
            {isIncome ? 'TOTAL RECEIVED' : 'TOTAL SPENT'}
          </Text>
          <Text fontSize={34} color={amountColor} weight="bold" letterSpacing={-0.5}>
            {formattedAmount}
          </Text>
        </VStack>

        {/* Tags / Pills Row */}
        <XStack gap="$2" flexWrap="wrap" alignItems="center">
          {/* Category Pill */}
          {category && (
            <XStack
              alignItems="center"
              gap="$1.5"
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius="$10"
              backgroundColor="$surface"
              borderWidth={1}
              borderColor="$borderColor">
              <CategoryIcon icon={category.icon} size={14} />
              <Text variant="caption" color="$color" weight="semibold">
                {category.name}
              </Text>
            </XStack>
          )}

          {/* Type Badge */}
          <XStack
            alignItems="center"
            gap="$1"
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            borderRadius="$10"
            backgroundColor={isIncome ? '$badgeSuccessBg' : '$badgeDangerBg'}
            borderWidth={1}
            borderColor={isIncome ? '$badgeSuccessBorder' : '$badgeDangerBorder'}>
            <Ionicons
              name={isIncome ? 'arrow-down' : 'arrow-up'}
              size={12}
              color={isIncome ? '$badgeSuccessText' : '$badgeDangerText'}
            />
            <Text
              variant="caption"
              color={isIncome ? '$badgeSuccessText' : '$badgeDangerText'}
              weight="bold">
              {getTransactionTypeLabel(transaction.type)}
            </Text>
          </XStack>

          {/* Recurring Indicator */}
          {transaction.isRecurring && (
            <XStack
              alignItems="center"
              gap="$1"
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius="$10"
              backgroundColor="$surface"
              borderWidth={1}
              borderColor="$borderColor">
              <Ionicons name="repeat" size={12} color="$accentBlue" />
              <Text variant="caption" color="$accentBlue" weight="semibold">
                {transaction.recurrenceFrequency ?? 'Recurring'}
              </Text>
            </XStack>
          )}
        </XStack>

        {/* Notes Callout */}
        {Boolean(transaction.notes?.trim()) && (
          <VStack
            padding="$3"
            borderRadius={12}
            backgroundColor="$surface"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$1">
            <XStack alignItems="center" gap="$1.5">
              <Ionicons name="document-text-outline" size={14} color="$colorSubtitle" />
              <Text variant="caption" color="$colorSubtitle" weight="semibold">
                Notes
              </Text>
            </XStack>
            <Text variant="body2" color="$color">
              {transaction.notes}
            </Text>
          </VStack>
        )}

        {/* Receipts Previews */}
        {receipts.length > 0 && (
          <VStack gap="$2">
            <XStack alignItems="center" gap="$1.5">
              <Ionicons name="receipt-outline" size={14} color="$colorSubtitle" />
              <Text variant="caption" color="$colorSubtitle" weight="semibold">
                Receipts ({receipts.length})
              </Text>
            </XStack>
            <XStack gap="$2" flexWrap="wrap">
              {receipts.map((uri, idx) => (
                <YStack
                  key={uri + idx}
                  width={72}
                  height={72}
                  borderRadius={10}
                  overflow="hidden"
                  borderWidth={1}
                  borderColor="$borderColor">
                  <Image
                    source={{uri}}
                    style={{width: '100%', height: '100%'}}
                    resizeMode="cover"
                  />
                </YStack>
              ))}
            </XStack>
          </VStack>
        )}
      </VStack>
    </GlassSurface>
  );
}

function CategoryIcon({icon, size = 16}: {icon: string; size?: number}) {
  if (isEmojiCategoryIcon(icon)) {
    return <Text fontSize={size}>{icon}</Text>;
  }

  return (
    <Ionicons
      name={(icon in Ionicons.glyphMap ? icon : 'pricetag') as keyof typeof Ionicons.glyphMap}
      size={size}
      color="$color"
    />
  );
}

export function TransactionInformationCard({
  transaction,
  category,
  walletName,
  groupName,
  isLoanPayment,
  isSubscriptionPayment,
  isGroupTransaction,
  onNavigateToSource,
}: TransactionInformationCardProps) {
  const formattedTime = new Date(transaction.date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <GlassSurface borderRadius={20} padding="$4.5">
      <VStack gap="$3">
        <Text variant="h5" color="$color" weight="bold">
          Transaction Details
        </Text>

        <DetailRow label="Date" value={new Date(transaction.date).toLocaleDateString()} />
        <DetailRow label="Time" value={formattedTime} />
        <DetailRow label="Category" value={category?.name ?? 'Uncategorized'} />
        <DetailRow label="Wallet" value={walletName ?? 'Default Account'} />

        {/* Linked Feature Row */}
        {isLoanPayment ? (
          <HStack justifyContent="space-between" alignItems="center">
            <Text variant="body2" color="$colorSubtitle">
              Source
            </Text>
            <Pressable onPress={onNavigateToSource} hitSlop={8}>
              <XStack alignItems="center" gap="$1">
                <Text variant="body2" color="$primary" weight="semibold">
                  Loan EMI Payment
                </Text>
                <Ionicons name="chevron-forward" size={14} color="$primary" />
              </XStack>
            </Pressable>
          </HStack>
        ) : isGroupTransaction && groupName ? (
          <HStack justifyContent="space-between" alignItems="center">
            <Text variant="body2" color="$colorSubtitle">
              Group
            </Text>
            <Pressable onPress={onNavigateToSource} hitSlop={8}>
              <XStack alignItems="center" gap="$1">
                <Text variant="body2" color="$primary" weight="semibold">
                  {groupName}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="$primary" />
              </XStack>
            </Pressable>
          </HStack>
        ) : isSubscriptionPayment ? (
          <HStack justifyContent="space-between" alignItems="center">
            <Text variant="body2" color="$colorSubtitle">
              Source
            </Text>
            <Pressable onPress={onNavigateToSource} hitSlop={8}>
              <XStack alignItems="center" gap="$1">
                <Text variant="body2" color="$primary" weight="semibold">
                  Subscription Payment
                </Text>
                <Ionicons name="chevron-forward" size={14} color="$primary" />
              </XStack>
            </Pressable>
          </HStack>
        ) : null}

        {/* Recurrence Details */}
        {transaction.isRecurring && (
          <>
            <DetailRow
              label="Frequency"
              value={transaction.recurrenceFrequency ?? 'Monthly'}
              valueWeight="semibold"
            />
            {transaction.recurrenceEndDate && (
              <DetailRow
                label="End Date"
                value={new Date(transaction.recurrenceEndDate).toLocaleDateString()}
              />
            )}
            {transaction.nextOccurrenceDate && (
              <DetailRow
                label="Next Occurrence"
                value={new Date(transaction.nextOccurrenceDate).toLocaleDateString()}
              />
            )}
          </>
        )}
      </VStack>
    </GlassSurface>
  );
}

function DetailRow({
  label,
  value,
  valueColor = '$color',
  valueWeight,
}: {
  label: string;
  value?: string;
  valueColor?: string;
  valueWeight?: 'semibold' | 'bold';
}) {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text variant="body2" color="$colorSubtitle">
        {label}
      </Text>
      <Text variant="body2" color={valueColor} weight={valueWeight ?? 'medium'}>
        {value ?? '—'}
      </Text>
    </HStack>
  );
}
