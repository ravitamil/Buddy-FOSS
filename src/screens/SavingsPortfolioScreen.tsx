import {Button, MetricCard, Text as AppText} from '@ravitamil/buddy-ui';
import React, {useCallback, useState} from 'react';
import {RefreshControl} from 'react-native';
import {router, useFocusEffect} from 'expo-router';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {ScrollView as TamaguiScrollView, XStack, YStack} from 'tamagui';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '../components/ui';
import {useInvestment, useSettings, useAuth} from '../context';
import {useTamaguiTheme} from '../context/TamaguiThemeProvider';
import {useAlert} from '../hooks/useAlert';
import {useProgressiveBlurHeader} from '../hooks/useProgressiveBlurHeader';
import {useFinancialSummary} from '@/features/analytics';
import {useSavingsState} from '@/features/savings';
import {
  ExportPortfolioSheet,
  PortfolioCategoryCard,
  QuickActionsCard,
  SavingsGoalsAllocationCard,
  SavingsPortfolioEmptyState,
  WealthDistributionCard,
} from '@/features/savings';

export default function SavingsPortfolioScreen() {
  const {isDarkMode} = useTamaguiTheme();
  const {showAlert} = useAlert();
  const {savingsGoals} = useSavingsState();
  const {user} = useAuth();
  const financialSummary = useFinancialSummary(user?.uid ?? '');
  const {investments, investmentCategories} = useInvestment();
  const {formatCurrency} = useSettings();
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});
  const [refreshing, setRefreshing] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);

  useFocusEffect(useCallback(() => {}, []));

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleRetirementPress = () => {
    const existingRetirementPlan = savingsGoals.find((goal) => goal.isRetirementGoal);
    router.push(
      existingRetirementPlan ? `/savings/${existingRetirementPlan.id}` : '/retirement-planning',
    );
  };

  const handleExportOption = (format: 'pdf' | 'csv') => {
    setShowExportSheet(false);
    showAlert({
      title: 'Export Feature',
      message: `Export as ${format.toUpperCase()} functionality would be implemented here.`,
      actions: [{text: 'OK'}],
    });
  };

  const totalPortfolioValue = investments.reduce(
    (sum, investment) => sum + (investment.currentPrice || 0) * (investment.quantity || 0),
    0,
  );
  const totalPortfolioInvested = investments.reduce(
    (sum, investment) => sum + (investment.purchasePrice || 0) * (investment.quantity || 0),
    0,
  );
  const totalPortfolioReturns = totalPortfolioValue - totalPortfolioInvested;
  const portfolioReturnPercentage =
    totalPortfolioInvested > 0 ? (totalPortfolioReturns / totalPortfolioInvested) * 100 : 0;
  const totalSavingsValue = financialSummary.totalIncome - financialSummary.totalExpenses;
  const totalWealth = totalSavingsValue + totalPortfolioValue;
  const totalGoalTargets = savingsGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
  const overallProgress = totalWealth > 0 ? (totalSavingsValue / totalWealth) * 100 : 0;
  const savingsToInvestmentRatio =
    totalPortfolioValue > 0 ? (totalSavingsValue / totalPortfolioValue) * 100 : 0;
  const investmentToSavingsRatio =
    totalSavingsValue > 0 ? (totalPortfolioValue / totalSavingsValue) * 100 : 0;
  const categoriesWithInvestments = investmentCategories
    .map((category) => ({
      category,
      investments: investments.filter(
        (investment) => investment.categoryId === category.id && (investment.isActive ?? true),
      ),
    }))
    .filter((item) => item.investments.length > 0);
  const showEmptyState = investments.length === 0 && savingsGoals.length === 0;

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Savings Portfolio"
        subtitle="Track your investments & savings"
        mode="collapsing"
        {...headerProps}
        rightElement={
          <HeaderAddButton isDarkMode={isDarkMode} onPress={() => router.push('/add-investment')} />
        }
      />
      <ScreenWrapper edges={[]} backgroundColor="transparent" padding={false}>
        <TamaguiScrollView
          style={{flex: 1, backgroundColor: 'transparent'}}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDarkMode ? '#fff' : '#000'}
            />
          }>
          <YStack flex={1} padding="$4" gap="$4" paddingTop={118}>
            <XStack gap="$2" marginTop="$4">
              <MetricCard
                title="Total Wealth"
                value={formatCurrency(totalWealth)}
                icon="trending-up"
                trend={`${portfolioReturnPercentage >= 0 ? '+' : ''}${portfolioReturnPercentage.toFixed(1)}%`}
                tone={portfolioReturnPercentage >= 0 ? 'positive' : 'negative'}
                onPress={() => router.push('/portfolio-analytics')}
              />
              <MetricCard
                title="Savings Goals"
                value={formatCurrency(totalSavingsValue)}
                icon="checkmark-circle"
                trend={`${overallProgress.toFixed(1)}% progress`}
                tone="positive"
                onPress={() => router.push('/savings-goals')}
              />
            </XStack>

            <QuickActionsCard
              onAnalysePress={() => router.push('/portfolio-analytics')}
              onInvestmentsPress={() => router.push('/investment-research')}
              onRetirementPress={handleRetirementPress}
            />

            <WealthDistributionCard
              totalSavingsGoals={totalSavingsValue}
              totalInvestments={totalPortfolioValue}
              totalWealth={totalWealth}
              savingsToInvestmentRatio={savingsToInvestmentRatio}
              investmentToSavingsRatio={investmentToSavingsRatio}
            />

            {showEmptyState ? (
              <SavingsPortfolioEmptyState onAddInvestment={() => router.push('/add-investment')} />
            ) : (
              <YStack gap="$3" marginTop="$6">
                <AppText variant="h4" color="$text" weight="bold" futuristic glow>
                  Asset Allocation
                </AppText>
                {savingsGoals.length > 0 && (
                  <SavingsGoalsAllocationCard
                    goalCount={savingsGoals.length}
                    totalSavingsGoals={totalSavingsValue}
                    totalGoalTargets={totalGoalTargets}
                    overallProgress={overallProgress}
                    onPress={() => router.push('/savings-goals')}
                  />
                )}
                {categoriesWithInvestments.map(({category, investments: categoryInvestments}) => (
                  <PortfolioCategoryCard
                    key={category.id}
                    category={category}
                    investments={categoryInvestments}
                    totalValue={totalPortfolioValue}
                    onPress={() => router.push(`/portfolio-category/${category.id}`)}
                  />
                ))}
              </YStack>
            )}
          </YStack>
        </TamaguiScrollView>
      </ScreenWrapper>

      <ExportPortfolioSheet
        open={showExportSheet}
        onOpenChange={setShowExportSheet}
        onExportOption={handleExportOption}
      />
    </ScreenContainer>
  );
}

const HeaderAddButton = ({onPress}: {isDarkMode?: boolean; onPress: () => void}) => (
  <Button
    onPress={onPress}
    variant="ghost"
    accessibilityLabel="Add investment"
    minWidth={44}
    height={44}
    padding={0}
    alignItems="center"
    justifyContent="center">
    <Ionicons name="add" size={24} color="$iconBrand" />
  </Button>
);
