import React from 'react';
import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {
  DebtPayoffContent,
  DebtPayoffEmptyState,
  DebtPayoffSyncStatus,
  useDebtPayoffScreen,
} from '@/features/loans';

const DebtPayoffScreen = () => {
  const screen = useDebtPayoffScreen();

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Debt Payoff"
        onBackPress={screen.handleBack}
        rightElement={
          screen.activeLoans.length > 0 ? (
            <DebtPayoffSyncStatus status={screen.lastSyncStatus} />
          ) : undefined
        }
        mode="collapsing"
        {...screen.headerProps}
      />

      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardAvoiding={false}
        scrollable={false}>
        {screen.activeLoans.length === 0 ? (
          <DebtPayoffEmptyState
            isDarkMode={screen.isDarkMode}
            onAddLoan={screen.handleAddLoan}
            onBack={screen.handleBack}
          />
        ) : (
          <DebtPayoffContent
            activeLoans={screen.activeLoans}
            chartData={screen.chartData}
            currencySymbol={screen.currencySymbol}
            debtPayoffPlan={screen.debtPayoffPlan}
            extraPayment={screen.extraPayment}
            formatCurrency={screen.formatCurrency}
            isDarkMode={screen.isDarkMode}
            isGenerating={screen.isGenerating}
            onScroll={screen.onScroll}
            selectedStrategy={screen.selectedStrategy}
            handleApplyStrategy={screen.handleApplyStrategy}
            setExtraPayment={screen.setExtraPayment}
            setSelectedStrategy={screen.setSelectedStrategy}
          />
        )}
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default DebtPayoffScreen;
