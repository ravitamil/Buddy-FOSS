import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {View} from 'tamagui';

import {CategorySpendingChart} from '@/features/analytics/components/charts/CategorySpendingChart';
import {ComparisonMetricsChart} from '@/features/analytics/components/charts/ComparisonMetricsChart';
import {ExpenseDistributionChart} from '@/features/analytics/components/charts/ExpenseDistributionChart';
import {SettlementTimelineChart} from '@/features/analytics/components/charts/SettlementTimelineChart';
import {SpendingTrendsChart} from '@/features/analytics/components/charts/SpendingTrendsChart';

import type {AnalyticsGroupMember, AnalyticsProps} from './groupInsightsSectionTypes';

const mapGroupMembersForChart = (members: AnalyticsProps['group']['members']) =>
  members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    avatar: member.avatar,
    balance: member.balance,
    totalPaid: member.totalPaid,
    totalOwed: member.totalOwed,
    joinedAt: member.joinedAt,
    isActive: member.isActive,
    role: member.role === 'creator' ? 'creator' : 'member',
    lastActivity: member.lastActivity,
    supabaseUserId: member.supabaseUserId,
  })) as AnalyticsGroupMember[];

export const GroupInsightsAnalyticsSection: React.FC<AnalyticsProps> = ({
  group,
  groupBalance,
  userFirstName,
  getUserDisplayName,
  expenseDistributionA11y,
  spendingTrendsA11y,
  categorySpendingA11y,
  settlementTimelineA11y,
}) => (
  <VStack gap="$4">
    <Text variant="h4" color="$text" weight="bold">
      Analytics
    </Text>

    <GlassSurface padding={16}>
      <VStack gap="$3">
        <HStack alignItems="center" gap="$2">
          <Text variant="h5" weight="semibold" color="$text">
            Expense Distribution
          </Text>
        </HStack>
        <View accessible accessibilityLabel={expenseDistributionA11y}>
          <ExpenseDistributionChart
            memberBalances={groupBalance.memberBalances}
            userFirstName={userFirstName}
            getUserDisplayName={getUserDisplayName}
          />
        </View>
      </VStack>
    </GlassSurface>

    <GlassSurface padding={16}>
      <VStack gap="$3">
        <HStack alignItems="center" gap="$2">
          <Text variant="h5" weight="semibold" color="$text">
            Spending Trends
          </Text>
        </HStack>
        <View accessible accessibilityLabel={spendingTrendsA11y}>
          <SpendingTrendsChart transactions={group.transactions} />
        </View>
      </VStack>
    </GlassSurface>

    <GlassSurface padding={16}>
      <VStack gap="$3">
        <HStack alignItems="center" gap="$2">
          <Text variant="h5" weight="semibold" color="$text">
            Category Spending
          </Text>
        </HStack>
        <View accessible accessibilityLabel={categorySpendingA11y}>
          <CategorySpendingChart transactions={group.transactions} />
        </View>
      </VStack>
    </GlassSurface>

    <GlassSurface padding={16}>
      <VStack gap="$3">
        <HStack alignItems="center" gap="$2">
          <Text variant="h5" weight="semibold" color="$text">
            Settlement Timeline
          </Text>
        </HStack>
        <View accessible accessibilityLabel={settlementTimelineA11y}>
          <SettlementTimelineChart
            transactions={group.transactions.filter((transaction) => transaction.isSettlement)}
          />
        </View>
      </VStack>
    </GlassSurface>

    <GlassSurface padding={16}>
      <VStack gap="$3">
        <HStack alignItems="center" gap="$2">
          <Text variant="h5" weight="semibold" color="$text">
            Financial Insights
          </Text>
        </HStack>
        <ComparisonMetricsChart
          transactions={group.transactions}
          members={mapGroupMembersForChart(group.members)}
          groupId={group.id}
        />
      </VStack>
    </GlassSurface>
  </VStack>
);
