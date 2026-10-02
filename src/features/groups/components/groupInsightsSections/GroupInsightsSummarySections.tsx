import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {View} from 'tamagui';

import {colorToken} from '@/utils/themeColors';
import {GroupInsightsModeButton} from './GroupInsightsSectionShared';
import type {ModeToggleProps, SummaryProps} from './groupInsightsSectionTypes';

export const GroupInsightsSummary: React.FC<SummaryProps> = ({
  groupBalance,
  isDarkMode,
  formatCurrency,
  accessibilityLabel,
}) => (
  <View accessible accessibilityLabel={accessibilityLabel}>
    <GlassSurface style={{marginBottom: 16}} padding={20}>
      <VStack gap="$4">
        <Text variant="h4" color="$text" weight="bold">
          Group Summary
        </Text>

        <HStack justifyContent="space-between" alignItems="center">
          <VStack alignItems="center" flex={1}>
            <Text variant="h3" color={isDarkMode ? '#4ECDC4' : '#22a39e'} weight="bold">
              {formatCurrency(groupBalance.totalExpenses)}
            </Text>
            <Text variant="caption" color="$textSecondary" textAlign="center">
              Total Expenses
            </Text>
          </VStack>

          <View
            style={{
              width: 1,
              height: '100%',
              backgroundColor: isDarkMode ? colorToken('gray4') : colorToken('gray3'),
            }}
          />

          <VStack alignItems="center" flex={1}>
            <Text variant="h3" color={isDarkMode ? '#FFB347' : '#e07b20'} weight="bold">
              {groupBalance.settlementSuggestions.length}
            </Text>
            <Text variant="caption" color="$textSecondary" textAlign="center">
              Pending Settlements
            </Text>
          </VStack>

          <View
            style={{
              width: 1,
              height: '100%',
              backgroundColor: isDarkMode ? colorToken('gray4') : colorToken('gray3'),
            }}
          />

          <VStack alignItems="center" flex={1}>
            <Text variant="h3" color={isDarkMode ? '#66BB6A' : '#388E3C'} weight="bold">
              {formatCurrency(groupBalance.averageExpensePerMember)}
            </Text>
            <Text variant="caption" color="$textSecondary" textAlign="center">
              Avg per Member
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </GlassSurface>
  </View>
);

export const GroupInsightsModeToggle: React.FC<ModeToggleProps> = ({
  viewMode,
  debtsCount,
  membersCount,
  isDarkMode,
  onChange,
}) => (
  <VStack gap="$3" marginBottom="$4">
    <View
      style={{
        borderRadius: 16,
        padding: 4,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      }}>
      <HStack gap="$1">
        <GroupInsightsModeButton
          mode="debts"
          label="Settlements"
          detail={`(${debtsCount})`}
          icon="swap-horizontal"
          isDarkMode={isDarkMode}
          selected={viewMode === 'debts'}
          onPress={() => onChange('debts')}
          accessibilityLabel={`Show settlements (${debtsCount})`}
        />
        <GroupInsightsModeButton
          mode="members"
          label="Members"
          detail={`(${membersCount})`}
          icon="people"
          isDarkMode={isDarkMode}
          selected={viewMode === 'members'}
          onPress={() => onChange('members')}
          accessibilityLabel={`Show members (${membersCount})`}
        />
        <GroupInsightsModeButton
          mode="analytics"
          label="Analytics"
          detail="Charts"
          icon="analytics"
          isDarkMode={isDarkMode}
          selected={viewMode === 'analytics'}
          onPress={() => onChange('analytics')}
          accessibilityLabel="Show analytics charts"
        />
      </HStack>
    </View>
  </VStack>
);
