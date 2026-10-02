import {Button, LoadingIndicator, VStack} from '@ravitamil/buddy-ui';
import React, {useMemo} from 'react';
import {router, useLocalSearchParams} from 'expo-router';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {useCategory, useSettings, useTransaction} from '@/context';
import {useSavingsState} from '@/features/savings';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import {budgetRoutes, useBudgetCycleModel, useBudgetState} from '@/features/budgets';
import {
  BudgetFinancialHealthCard,
  BudgetSummaryCard,
  SavingsGoalsProgressCard,
} from '@/features/budgets/components/BudgetDetailsCards';
import {BudgetDetailsEmptyState} from '@/features/budgets/components/BudgetDetailsEmptyState';
import {
  BudgetAllocationChart,
  BudgetCycleInsights,
  BudgetDetailsActions,
} from '@/features/budgets/components/BudgetDetailsSections';
import {SmartBudgetSuggestionsCard} from '@/features/budgets/components/SmartBudgetSuggestionsCard';

const BudgetDetailsScreen = () => {
  const routeParams = useLocalSearchParams<{budgetId?: string}>();
  const {activeBudget, getBudgetById, isLoading} = useBudgetState();
  const {transactions} = useTransaction();
  const {categories} = useCategory();
  const {savingsGoals} = useSavingsState();
  const {formatCurrency} = useSettings();
  const requestedBudgetId =
    typeof routeParams.budgetId === 'string' && routeParams.budgetId.length > 0
      ? routeParams.budgetId
      : null;
  const budget = requestedBudgetId
    ? (getBudgetById(requestedBudgetId) ?? activeBudget)
    : activeBudget;
  const budgetCycle = useBudgetCycleModel(budget);
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});
  const headerSubtitle = useMemo(() => budget?.name ?? 'YOUR BUDGET PLAN', [budget?.name]);

  if (isLoading && !budget) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} edges={['top', 'bottom']}>
        <VStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <LoadingIndicator size="large" accessibilityLabel="Loading budget plan" />
        </VStack>
      </ScreenContainer>
    );
  }

  if (!budget || !budgetCycle) {
    return <BudgetDetailsEmptyState onCreateBudget={() => router.replace(budgetRoutes.create())} />;
  }

  const openBudgetSetup = () => router.push(budgetRoutes.edit(budget.id));

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <CustomNavigationHeader
        title="Budget details"
        subtitle={headerSubtitle}
        onBackPress={() => router.back()}
        mode="collapsing"
        {...headerProps}
        rightElement={
          <Button
            variant="ghost"
            size="small"
            onPress={openBudgetSetup}
            accessibilityLabel="Edit budget plan">
            Edit
          </Button>
        }
      />
      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardMode="aware-scroll"
        onScroll={onScroll}
        scrollViewStyle={{flex: 1, backgroundColor: 'transparent'}}
        contentContainerStyle={{paddingBottom: 100}}>
        <VStack flex={1} padding="$4" gap="$4" paddingTop={118}>
          <BudgetFinancialHealthCard model={budgetCycle} />
          <BudgetSummaryCard model={budgetCycle} formatCurrency={formatCurrency} />
          <BudgetCycleInsights model={budgetCycle} formatCurrency={formatCurrency} />
          <BudgetAllocationChart model={budgetCycle} formatCurrency={formatCurrency} />
          <SmartBudgetSuggestionsCard
            budget={budget}
            categories={categories}
            transactions={transactions}
            savingsGoals={savingsGoals}
            formatCurrency={formatCurrency}
          />
          <SavingsGoalsProgressCard
            allocations={budgetCycle.savingsAllocations}
            formatCurrency={formatCurrency}
          />
          <BudgetDetailsActions
            onEditBudget={openBudgetSetup}
            onOpenTransactions={() => router.push('/transactions')}
          />
        </VStack>
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default BudgetDetailsScreen;
