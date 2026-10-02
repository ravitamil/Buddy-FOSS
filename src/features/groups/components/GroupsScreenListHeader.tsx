import {GlassSurface, SearchField, Text, VStack} from '@ravitamil/buddy-ui';
import React, {useMemo} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';
import {StyleSheet} from 'react-native';
import {View, XStack, YStack} from 'tamagui';

import type {GroupsScreenOverallStats} from '../hooks/useGroupsScreen';

interface GroupsScreenListHeaderProps {
  groupCount: number;
  isDarkMode: boolean;
  overallStats: GroupsScreenOverallStats;
  searchQuery: string;
  isSearchOpen?: boolean;
  formatCurrency: (amount: number) => string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export const GroupsScreenListHeader: React.FC<GroupsScreenListHeaderProps> = ({
  groupCount,
  isDarkMode,
  overallStats,
  searchQuery,
  isSearchOpen = false,
  formatCurrency,
  onSearchChange,
  onClearSearch,
}) => {
  const shouldShowSearch = isSearchOpen;

  return (
    <VStack gap="$3" paddingBottom="$3">
      {shouldShowSearch && groupCount > 0 && (
        <VStack gap="$2" marginBottom="$1">
          <SearchField
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search groups..."
            onClear={onClearSearch}
            autoFocus
          />
        </VStack>
      )}

      {groupCount > 0 && (
        <GroupsScreenOverallBalanceCard
          groupCount={groupCount}
          isDarkMode={isDarkMode}
          overallStats={overallStats}
          formatCurrency={formatCurrency}
        />
      )}
    </VStack>
  );
};

interface OverallBalanceCardProps {
  groupCount: number;
  isDarkMode: boolean;
  overallStats: GroupsScreenOverallStats;
  formatCurrency: (amount: number) => string;
}

const GroupsScreenOverallBalanceCard: React.FC<OverallBalanceCardProps> = ({
  groupCount,
  isDarkMode,
  overallStats,
  formatCurrency,
}) => {
  const netWorth = overallStats.owedToYou - overallStats.youOwe;
  const isActuallySettled = overallStats.owedToYou < 0.01 && overallStats.youOwe < 0.01;
  const isBalanced = !isActuallySettled && Math.abs(netWorth) < 0.01;
  const isPositive = netWorth > 0.01;

  const accentColor = isActuallySettled
    ? isDarkMode
      ? '#34D399'
      : '#059669'
    : isBalanced
      ? isDarkMode
        ? '#60A5FA'
        : '#2563EB'
      : isPositive
        ? isDarkMode
          ? '#4ADE80'
          : '#16A34A'
        : isDarkMode
          ? '#F87171'
          : '#DC2626';

  const accentBorder = isActuallySettled
    ? isDarkMode
      ? 'rgba(52, 211, 153, 0.3)'
      : 'rgba(5, 150, 105, 0.2)'
    : isBalanced
      ? isDarkMode
        ? 'rgba(96, 165, 250, 0.3)'
        : 'rgba(37, 99, 235, 0.2)'
      : isPositive
        ? isDarkMode
          ? 'rgba(74, 222, 128, 0.3)'
          : 'rgba(22, 163, 74, 0.2)'
        : isDarkMode
          ? 'rgba(248, 113, 113, 0.3)'
          : 'rgba(220, 38, 38, 0.2)';

  const statusLabel = isActuallySettled
    ? 'All Settled'
    : isBalanced
      ? 'Balanced'
      : isPositive
        ? `+${formatCurrency(netWorth)}`
        : `-${formatCurrency(Math.abs(netWorth))}`;

  const statusSubtitle = isActuallySettled
    ? 'No pending dues across your groups'
    : isBalanced
      ? 'Incoming and outgoing dues are equal'
      : isPositive
        ? 'Total amount you will collect'
        : 'Total amount you need to pay';

  const gradientColors = useMemo(() => {
    if (isActuallySettled) {
      return isDarkMode
        ? (['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.08)', 'transparent'] as const)
        : (['rgba(209, 250, 229, 0.85)', 'rgba(236, 253, 245, 0.35)', 'transparent'] as const);
    }
    if (isPositive) {
      return isDarkMode
        ? (['rgba(34, 197, 94, 0.22)', 'rgba(16, 185, 129, 0.08)', 'transparent'] as const)
        : (['rgba(220, 252, 231, 0.85)', 'rgba(240, 253, 244, 0.35)', 'transparent'] as const);
    }
    if (isBalanced) {
      return isDarkMode
        ? (['rgba(59, 130, 246, 0.22)', 'rgba(99, 102, 241, 0.08)', 'transparent'] as const)
        : (['rgba(219, 234, 254, 0.85)', 'rgba(239, 246, 255, 0.35)', 'transparent'] as const);
    }
    return isDarkMode
      ? (['rgba(239, 68, 68, 0.22)', 'rgba(244, 63, 94, 0.08)', 'transparent'] as const)
      : (['rgba(254, 226, 226, 0.85)', 'rgba(254, 242, 242, 0.35)', 'transparent'] as const);
  }, [isActuallySettled, isBalanced, isDarkMode, isPositive]);

  const badgeBg = isActuallySettled
    ? isDarkMode
      ? 'rgba(16, 185, 129, 0.18)'
      : '#D1FAE5'
    : isPositive
      ? isDarkMode
        ? 'rgba(34, 197, 94, 0.18)'
        : '#DCFCE7'
      : isBalanced
        ? isDarkMode
          ? 'rgba(59, 130, 246, 0.18)'
          : '#DBEAFE'
        : isDarkMode
          ? 'rgba(239, 68, 68, 0.18)'
          : '#FEE2E2';

  const iconCircleBg = isActuallySettled
    ? isDarkMode
      ? 'rgba(16, 185, 129, 0.2)'
      : '#D1FAE5'
    : isPositive
      ? isDarkMode
        ? 'rgba(34, 197, 94, 0.2)'
        : '#ECFDF5'
      : isBalanced
        ? isDarkMode
          ? 'rgba(59, 130, 246, 0.2)'
          : '#EFF6FF'
        : isDarkMode
          ? 'rgba(239, 68, 68, 0.2)'
          : '#FEF2F2';

  return (
    <GlassSurface
      borderRadius={20}
      padding={0}
      style={{
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: accentBorder,
      }}>
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      <YStack padding="$4" gap="$3.5">
        {/* Top Eyebrow Row */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$1.5">
            <Ionicons name="pie-chart-outline" size={14} color={accentColor} />
            <Text
              variant="caption"
              color="$textSecondary"
              weight="bold"
              style={{textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11}}>
              Overall Balance
            </Text>
          </XStack>

          {/* Status Pill Badge */}
          <XStack
            alignItems="center"
            gap="$1"
            paddingHorizontal="$2.5"
            paddingVertical="$1"
            borderRadius="$10"
            borderWidth={1}
            borderColor={accentBorder}
            backgroundColor={badgeBg}>
            <Ionicons
              name={
                isActuallySettled
                  ? 'checkmark-circle'
                  : isBalanced
                    ? 'swap-horizontal'
                    : isPositive
                      ? 'arrow-up-circle'
                      : 'arrow-down-circle'
              }
              size={13}
              color={accentColor}
            />
            <Text variant="caption" weight="bold" fontSize={11} color={accentColor}>
              {isActuallySettled
                ? 'Settled'
                : isBalanced
                  ? 'Balanced'
                  : isPositive
                    ? 'In Credit'
                    : 'Payment Due'}
            </Text>
          </XStack>
        </XStack>

        {/* Hero Metric Row */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap="$1" flex={1}>
            <Text variant="h2" weight="bold" color={accentColor} fontSize={30} lineHeight={34}>
              {statusLabel}
            </Text>
            <Text variant="caption" color="$textSecondary" fontSize={12} weight="medium">
              {statusSubtitle}
            </Text>
          </YStack>

          <View
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor={iconCircleBg}
            borderWidth={1}
            borderColor={accentBorder}
            justifyContent="center"
            alignItems="center">
            <Ionicons
              name={
                isActuallySettled
                  ? 'checkmark-done'
                  : isBalanced
                    ? 'swap-horizontal'
                    : isPositive
                      ? 'trending-up'
                      : 'trending-down'
              }
              size={24}
              color={accentColor}
            />
          </View>
        </XStack>

        {/* Bottom Section */}
        {isActuallySettled ? (
          <XStack
            alignItems="center"
            gap="$1.5"
            paddingTop="$1"
            borderTopWidth={1}
            borderTopColor={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}>
            <Ionicons name="sparkles" size={12} color={accentColor} />
            <Text variant="caption" color="$textSecondary" fontSize={11} weight="medium">
              All {groupCount} {groupCount === 1 ? 'group is' : 'groups are'} balanced and up to
              date
            </Text>
          </XStack>
        ) : (
          <YStack gap="$2" paddingTop="$1">
            <View
              height={1}
              backgroundColor={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
            />
            <XStack justifyContent="space-between" alignItems="center" paddingTop="$0.5">
              <XStack
                alignItems="center"
                gap="$1.5"
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                borderRadius="$6"
                backgroundColor={
                  isDarkMode ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)'
                }>
                <Ionicons name="arrow-down" size={12} color={isDarkMode ? '#4ADE80' : '#16A34A'} />
                <Text variant="caption" color="$textSecondary" weight="medium" fontSize={11}>
                  Collect:{' '}
                  <Text color={isDarkMode ? '#4ADE80' : '#16A34A'} weight="bold">
                    {formatCurrency(overallStats.owedToYou)}
                  </Text>
                </Text>
              </XStack>

              <XStack
                alignItems="center"
                gap="$1.5"
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                borderRadius="$6"
                backgroundColor={
                  isDarkMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)'
                }>
                <Ionicons name="arrow-up" size={12} color={isDarkMode ? '#F87171' : '#DC2626'} />
                <Text variant="caption" color="$textSecondary" weight="medium" fontSize={11}>
                  Pay:{' '}
                  <Text color={isDarkMode ? '#F87171' : '#DC2626'} weight="bold">
                    {formatCurrency(overallStats.youOwe)}
                  </Text>
                </Text>
              </XStack>
            </XStack>
          </YStack>
        )}
      </YStack>
    </GlassSurface>
  );
};
