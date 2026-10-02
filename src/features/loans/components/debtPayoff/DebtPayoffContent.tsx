import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {ScreenWrapper} from '@/components/ui';
import {ApplyStrategyButton, ExtraPaymentSection} from './DebtPayoffInputs';
import {DebtDistributionChart, DebtPayoffOrderCard, DebtSummaryCard} from './DebtPayoffPlanCards';
import {StrategySelection} from './DebtPayoffStrategySelection';
import type {DebtPayoffContentProps} from './debtPayoffTypes';

export function DebtPayoffContent(props: DebtPayoffContentProps) {
  return (
    <ScreenWrapper
      edges={[]}
      backgroundColor="transparent"
      padding={false}
      keyboardMode="aware-scroll"
      onScroll={props.onScroll}
      scrollViewStyle={{flex: 1, backgroundColor: 'transparent'}}
      contentContainerStyle={{flexGrow: 1, paddingTop: 118, paddingBottom: 100}}
      keyboardBottomOffset={100}>
      <VStack flex={1} padding="$4" gap="$4">
        <StrategySelection
          selectedStrategy={props.selectedStrategy}
          isDarkMode={props.isDarkMode}
          onSelectStrategy={props.setSelectedStrategy}
        />
        <DebtSummaryCard
          activeLoans={props.activeLoans}
          debtPayoffPlan={props.debtPayoffPlan}
          formatCurrency={props.formatCurrency}
        />
        <DebtDistributionChart chartData={props.chartData} isDarkMode={props.isDarkMode} />
        <DebtPayoffOrderCard
          activeLoans={props.activeLoans}
          debtPayoffPlan={props.debtPayoffPlan}
          formatCurrency={props.formatCurrency}
          isDarkMode={props.isDarkMode}
        />
        <ExtraPaymentSection
          extraPayment={props.extraPayment}
          setExtraPayment={props.setExtraPayment}
          isDarkMode={props.isDarkMode}
          currencySymbol={props.currencySymbol}
        />
        <ApplyStrategyButton
          isGenerating={props.isGenerating}
          onApplyStrategy={props.handleApplyStrategy}
        />
      </VStack>
    </ScreenWrapper>
  );
}
