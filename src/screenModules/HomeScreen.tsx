import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {ScrollView} from 'tamagui';

import {ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  HomeBudgetSection,
  HomeFinancialOverview,
  HomeGroupsSection,
  HomeHeader,
  HomeRecentTransactionsSection,
  HomeScrollTopButton,
  useHomeScreen,
} from '@/features/home';

const HomeScreen = () => {
  const model = useHomeScreen();
  const {actions} = model;

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false} scrollable={false}>
        <HomeHeader
          greetingName={model.greetingName}
          isPro={model.isPro}
          iconColor={model.iconColor}
          onProfilePress={actions.openProfile}
          onNotificationPress={actions.openNotifications}
        />

        <ScrollView
          removeClippedSubviews={false}
          ref={model.scrollViewRef}
          style={{flex: 1, backgroundColor: 'transparent'}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 120}}>
          <VStack padding="$4" paddingTop={0} gap="$4">
            <HomeFinancialOverview
              isLoading={model.isLoading}
              statCards={model.statCards}
              onAnalysePress={actions.openAnalytics}
              onAddTransactionPress={actions.addTransaction}
              onNetWorthPress={actions.openNetWorth}
            />

            <HomeBudgetSection
              isLoading={model.isLoading}
              budgetData={model.budgetData}
              formatCurrency={model.formatCurrency}
              onEditBudget={actions.editBudget}
              onViewDetails={actions.viewBudgetDetails}
              onSetupBudget={actions.setupBudget}
              onDebtPayoffPress={actions.openDebtPayoff}
              onRetirementPress={actions.openRetirement}
              onNetWorthPress={actions.openNetWorth}
            />

            <HomeGroupsSection
              isLoading={model.isLoading}
              isDarkMode={model.isDarkMode}
              linkIconColor={model.linkIconColor}
              groupCards={model.groupCards}
              onViewAll={actions.openGroups}
              onAddGroup={actions.addGroup}
            />

            <HomeRecentTransactionsSection
              isLoading={model.isLoading}
              isDarkMode={model.isDarkMode}
              linkIconColor={model.linkIconColor}
              transactions={model.transactions}
              formatCurrency={model.formatCurrency}
              onViewAll={actions.openTransactions}
              onAddTransaction={actions.addTransaction}
            />

            <HomeScrollTopButton onPress={actions.scrollToTop} />
          </VStack>
        </ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default HomeScreen;
