import {useBuddyColors} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import type {GroupDetailBalanceProps} from '../GroupDetailBalanceSection';

export const GroupBalanceSummaryCard = ({
  stats,
  balanceViewModel,
  isDarkMode,
  formatCurrency,
  onInsights,
}: GroupDetailBalanceProps) => {
  const colors = useBuddyColors();
  const brandIconColor = colors.iconBrand;
  if (stats.transactionCount === 0) {
    return (
      <GlassSurface style={{overflow: 'hidden'}} padding={16}>
        <HStack alignItems="center" gap="$4">
          <View
            width={50}
            height={50}
            borderRadius={25}
            backgroundColor={colors.primaryMuted}
            justifyContent="center"
            alignItems="center">
            <Ionicons name="wallet-outline" size={28} color={brandIconColor} />
          </View>
          <VStack flex={1}>
            <Text variant="h6" color="$text" weight="bold">
              Your Balance
            </Text>
            <Text variant="body2" color="$textSecondary">
              Add your first expense to track balances
            </Text>
          </VStack>
        </HStack>
      </GlassSurface>
    );
  }

  const balanceColor = balanceViewModel.isActuallySettled
    ? '$text'
    : balanceViewModel.isBalanced
      ? '$blue5'
      : balanceViewModel.isPositive
        ? '$green5'
        : '$red5';
  return (
    <GlassSurface style={{overflow: 'hidden'}} padding={0}>
      <LinearGradient
        colors={
          balanceViewModel.isActuallySettled
            ? [isDarkMode ? 'rgba(75, 85, 99, 0.1)' : 'rgba(209, 213, 219, 0.2)', 'transparent']
            : balanceViewModel.isBalanced
              ? ['rgba(59, 130, 246, 0.15)', 'transparent']
              : [
                  balanceViewModel.isPositive
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  'transparent',
                ]
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={{position: 'absolute', width: '100%', height: '100%'}}
      />
      <VStack padding="$4" gap="$4">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack gap="$1">
            <Text variant="body2" color="$textSecondary" weight="medium">
              Your Balance
            </Text>
            <Text variant="h2" weight="bold" color={balanceColor}>
              {balanceViewModel.isActuallySettled
                ? 'Settled'
                : balanceViewModel.isBalanced
                  ? 'Balanced'
                  : formatCurrency(Math.abs(stats.currentUserBalance))}
            </Text>
            {!balanceViewModel.isActuallySettled ? (
              <Text variant="caption" color="$textSecondary">
                {balanceViewModel.isBalanced
                  ? `Collect ${formatCurrency(balanceViewModel.owedAmount)} - Pay ${formatCurrency(balanceViewModel.oweAmount)}`
                  : `${balanceViewModel.isPositive ? 'you are owed' : 'you owe'} in total`}
              </Text>
            ) : null}
          </VStack>
          <View
            width={50}
            height={50}
            borderRadius={25}
            backgroundColor={
              balanceViewModel.isPositive
                ? isDarkMode
                  ? 'rgba(34, 197, 94, 0.2)'
                  : '#ecfdf5'
                : isDarkMode
                  ? 'rgba(239, 68, 68, 0.2)'
                  : '#fef2f2'
            }
            justifyContent="center"
            alignItems="center">
            <Ionicons
              name={
                balanceViewModel.isActuallySettled
                  ? 'checkmark-circle'
                  : balanceViewModel.isBalanced
                    ? 'swap-horizontal'
                    : balanceViewModel.isPositive
                      ? 'arrow-up'
                      : 'arrow-down'
              }
              size={28}
              color={
                balanceViewModel.isActuallySettled || balanceViewModel.isPositive
                  ? isDarkMode
                    ? '#4ADE80'
                    : '#22c55e'
                  : balanceViewModel.isBalanced
                    ? isDarkMode
                      ? '#60A5FA'
                      : '#3b82f6'
                    : isDarkMode
                      ? '#F87171'
                      : '#ef4444'
              }
            />
          </View>
        </HStack>
        <View
          height={1}
          backgroundColor={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
        />
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" gap="$2">
            <Text variant="caption" color="$textSecondary" weight="medium">
              You paid{' '}
              <Text color="$text" weight="bold">
                {formatCurrency(balanceViewModel.totalPaidByCurrentUser)}
              </Text>
            </Text>
            <Text variant="caption" color="$textSecondary" opacity={0.5}>
              |
            </Text>
            <Text variant="caption" color="$textSecondary" weight="medium">
              Share{' '}
              <Text color="$text" weight="bold">
                {formatCurrency(balanceViewModel.currentUserShare)}
              </Text>
            </Text>
          </HStack>
          {balanceViewModel.shouldShowSettleCta ? (
            <View
              accessibilityRole="button"
              onPress={onInsights}
              pressStyle={{opacity: 0.8}}
              backgroundColor={isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'}
              paddingHorizontal={16}
              paddingVertical={8}
              borderRadius={20}
              borderWidth={1}
              borderColor={isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}>
              <Text variant="body2" weight="bold" color={isDarkMode ? '#F87171' : '#dc2626'}>
                Settle Up
              </Text>
            </View>
          ) : null}
        </HStack>
      </VStack>
    </GlassSurface>
  );
};
