import {Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  GroupInsightsAnalyticsSection,
  GroupInsightsDebtsSection,
  GroupInsightsMembersSection,
  GroupInsightsModeToggle,
  GroupInsightsSkeleton,
  GroupInsightsSummary,
  useGroupInsightsScreen,
} from '@/features/groups';

interface GroupInsightsScreenProps {
  groupId: string;
}

const GroupInsightsScreen = ({groupId}: GroupInsightsScreenProps) => {
  const {
    group,
    groupBalance,
    debtList,
    memberAvatars,
    viewMode,
    isLoading,
    isDarkMode,
    userFirstName,
    getUserDisplayName,
    formatCurrency,
    headerProps,
    onScroll,
    summaryStatsA11yLabel,
    expenseDistributionA11y,
    spendingTrendsA11y,
    categorySpendingA11y,
    settlementTimelineA11y,
    setViewMode,
    handleSettleDebt,
    handleViewMemberDetails,
    navigateBack,
  } = useGroupInsightsScreen({groupId});

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={group ? `${group.emoji || '👥'} ${group.name} Insights` : 'Group Insights'}
        subtitle={group ? 'Get your group insights here' : 'Loading group insights...'}
        largeTitle={group ? `${group.name} Insights` : 'Group Insights'}
        mode="collapsing"
        {...headerProps}
        onBackPress={navigateBack}
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <Animated.ScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 118,
            paddingHorizontal: 16,
            paddingBottom: 100,
            flexGrow: 1,
          }}
          scrollEventThrottle={16}
          onScroll={onScroll}>
          {isLoading ? (
            <VStack flex={1}>
              <GroupInsightsSkeleton />
            </VStack>
          ) : !group || !groupBalance ? (
            <VStack flex={1} alignItems="center" justifyContent="center" height={300}>
              <Text variant="body1" color="$textSecondary">
                Group not found or no data available
              </Text>
            </VStack>
          ) : (
            <VStack gap="$4">
              <GroupInsightsSummary
                groupBalance={groupBalance}
                isDarkMode={isDarkMode}
                formatCurrency={formatCurrency}
                accessibilityLabel={summaryStatsA11yLabel}
              />

              <GroupInsightsModeToggle
                viewMode={viewMode}
                debtsCount={debtList.length}
                membersCount={groupBalance.memberBalances.length}
                isDarkMode={isDarkMode}
                onChange={setViewMode}
              />

              {viewMode === 'debts' ? (
                <GroupInsightsDebtsSection
                  group={group}
                  debtList={debtList}
                  isDarkMode={isDarkMode}
                  userFirstName={userFirstName}
                  getUserDisplayName={getUserDisplayName}
                  onSettleDebt={handleSettleDebt}
                />
              ) : viewMode === 'members' ? (
                <GroupInsightsMembersSection
                  memberBalances={groupBalance.memberBalances}
                  memberAvatars={memberAvatars}
                  isDarkMode={isDarkMode}
                  userFirstName={userFirstName}
                  getUserDisplayName={getUserDisplayName}
                  onViewMemberDetails={handleViewMemberDetails}
                />
              ) : (
                <GroupInsightsAnalyticsSection
                  group={group}
                  groupBalance={groupBalance}
                  userFirstName={userFirstName}
                  getUserDisplayName={getUserDisplayName}
                  expenseDistributionA11y={expenseDistributionA11y}
                  spendingTrendsA11y={spendingTrendsA11y}
                  categorySpendingA11y={categorySpendingA11y}
                  settlementTimelineA11y={settlementTimelineA11y}
                />
              )}

              <VStack height={20} />
            </VStack>
          )}
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default GroupInsightsScreen;
