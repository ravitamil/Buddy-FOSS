import {EmptyState, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  SettlementHistoryPayments,
  SettlementHistoryQuickSettle,
  SettlementHistorySummary,
  useSettlementHistoryScreen,
} from '@/features/groups';

interface SettlementHistoryScreenProps {
  groupId: string;
}

const SettlementHistoryScreen: React.FC<SettlementHistoryScreenProps> = ({groupId}) => {
  const screen = useSettlementHistoryScreen({groupId});

  if (!screen.group) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
        <CustomNavigationHeader
          title="Group Not Found"
          subtitle="Unable to load group information"
          onBackPress={screen.navigateBack}
        />
        <VStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <EmptyState
            icon="people"
            iconColor="#4ECDC4"
            title="Group Not Found"
            description="The group for this settlement history could not be found."
          />
        </VStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={`${screen.group.emoji || '👥'} ${screen.group.name}`}
        subtitle="Settlement & Payment History"
        largeTitle="Settlements"
        mode="collapsing"
        {...screen.headerProps}
        onBackPress={screen.navigateBack}
      />

      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <Animated.ScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={screen.onScroll}
          contentContainerStyle={{
            paddingTop: 80,
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}>
          <VStack gap="$4">
            <SettlementHistoryQuickSettle
              suggestions={screen.suggestions}
              accessibilityLabel={screen.suggestionsA11y}
              isDarkMode={screen.isDarkMode}
              formatCurrency={screen.formatCurrency}
              onSettle={screen.navigateSettleSuggestion}
            />
            <SettlementHistorySummary
              paymentsCount={screen.settlementTransactions.length}
              totalSettled={screen.totalSettled}
              outstandingAmount={screen.outstandingAmount}
              isDarkMode={screen.isDarkMode}
              formatCurrency={screen.formatCurrency}
            />
            <SettlementHistoryPayments
              group={screen.group}
              settlementTransactions={screen.settlementTransactions}
              accessibilityLabel={screen.paymentHistoryA11y}
              userFirstName={screen.profile?.firstName ?? undefined}
              getUserDisplayName={screen.getUserDisplayName}
              isDarkMode={screen.isDarkMode}
              formatCurrency={screen.formatCurrency}
              onRecordPayment={screen.navigateRecordPayment}
            />
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default SettlementHistoryScreen;
