import {useBuddyColors} from '@ravitamil/buddy-ui';
import {EmptyState, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {GroupDetailSettlementProps} from '../GroupDetailSettlementSection';
import {GroupSettlementRow} from './GroupSettlementRow';

export const GroupSettlementStatsCard = ({
  group,
  stats,
  isDarkMode,
  formatCurrency,
}: GroupDetailSettlementProps) => {
  const statItems: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    color: string;
  }[] = [
    {
      icon: 'cart-outline',
      label: 'Spent',
      value: formatCurrency(stats.totalExpenses),
      color: isDarkMode ? '#60A5FA' : '#2563EB',
    },
    {
      icon: 'receipt-outline',
      label: 'Items',
      value: group.transactions?.length || 0,
      color: isDarkMode ? '#C084FC' : '#7C3AED',
    },
    {
      icon: 'people-outline',
      label: 'Share',
      value: formatCurrency(stats.perPersonShare),
      color: isDarkMode ? '#34D399' : '#059669',
    },
  ];

  return (
    <GlassSurface padding={12}>
      <HStack justifyContent="space-between" alignItems="center">
        {statItems.map(({icon, label, value, color}, index) => (
          <VStack
            key={label}
            flex={1}
            alignItems="center"
            borderRightWidth={index < statItems.length - 1 ? 1 : 0}
            borderRightColor={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}>
            <Ionicons name={icon} size={20} color={color} style={{marginBottom: 4}} />
            <Text variant="caption" color="$textSecondary">
              {label}
            </Text>
            <Text variant="body1" weight="bold">
              {value}
            </Text>
          </VStack>
        ))}
      </HStack>
    </GlassSurface>
  );
};

export const GroupSettlementSuggestionsCard = (props: GroupDetailSettlementProps) => {
  const {stats, onInsights} = props;
  const isEmpty = stats.settlementSuggestions.length === 0;
  const hasNoTransactions = stats.transactionCount === 0;
  const colors = useBuddyColors();
  const brandColor = colors.iconBrand;
  const primaryColor = colors.iconBrand;

  return (
    <GlassSurface padding={16}>
      <VStack gap="$3">
        <HStack justifyContent="space-between" alignItems="center">
          <HStack gap="$2" alignItems="center">
            <Ionicons name="git-network-outline" size={18} color={brandColor} />
            <Text variant="h4" weight="bold">
              Who Owes Whom
            </Text>
          </HStack>
          {!isEmpty ? (
            <HStack
              accessibilityRole="button"
              accessibilityLabel="Optimize settlements"
              onPress={onInsights}
              pressStyle={{opacity: 0.8}}
              alignItems="center"
              gap="$1">
              <Text color={primaryColor} variant="body1" weight="semibold">
                Optimize
              </Text>
              <Ionicons name="chevron-forward" size={16} color={primaryColor} />
            </HStack>
          ) : null}
        </HStack>
        {isEmpty ? (
          <EmptyState
            icon={hasNoTransactions ? 'receipt-outline' : 'checkmark-done-circle'}
            iconColor={hasNoTransactions ? brandColor : '#22C55E'}
            title={hasNoTransactions ? 'No expenses yet' : 'All Balances Settled'}
            description={
              hasNoTransactions
                ? 'Add your first expense to track balances here'
                : 'Everyone in this group is squared up!'
            }
          />
        ) : (
          <VStack gap="$2">
            {stats.settlementSuggestions.map((suggestion) => (
              <GroupSettlementRow key={suggestion.id} {...props} suggestion={suggestion} />
            ))}
          </VStack>
        )}
      </VStack>
    </GlassSurface>
  );
};
