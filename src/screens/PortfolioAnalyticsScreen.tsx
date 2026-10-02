import {Button, VStack} from '@ravitamil/buddy-ui';
import React, {useState} from 'react';
import {RefreshControl} from 'react-native';
import Animated, {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import {GlassBackdrop} from '@ravitamil/buddy-ui/mobile';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useRouter} from 'expo-router';

import {useInvestment, useSettings} from '../context';
import {useAlert} from '../hooks/useAlert';
import {useTamaguiTheme} from '../context/TamaguiThemeProvider';
import {ScreenContainer, CustomNavigationHeader} from '../components/ui';
import {ScreenWrapper} from '../components/ui/ScreenWrapper';
import {useSavingsState} from '@/features/savings';
import {
  AssetAllocationSection,
  BenchmarkComparisonSection,
  PerformerSection,
  PortfolioOverviewSection,
  PortfolioPerformanceSection,
  RebalancingRecommendationsSection,
  RiskAnalysisSection,
  usePortfolioAnalytics,
  type PortfolioAnalyticsPeriod,
} from '../features/investments';

export default function PortfolioAnalyticsScreen() {
  const router = useRouter();
  const {showAlert} = useAlert();
  const {investments} = useInvestment();
  const {savingsGoals} = useSavingsState();
  const {formatCurrency} = useSettings();
  const {isDarkMode} = useTamaguiTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PortfolioAnalyticsPeriod>('3M');
  const scrollY = useSharedValue(0);

  const {
    portfolioMetrics,
    benchmarkComparisons,
    rebalancingRecommendations,
    portfolioStats,
    performanceData,
    categoryChartData,
  } = usePortfolioAnalytics({
    investments,
    savingsGoals,
    selectedPeriod,
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleExportPress = () => {
    showAlert({
      title: 'Export Feature',
      message: 'Export as PDF/CSV functionality would be implemented here.',
      actions: [{text: 'OK', style: 'default'}],
    });
  };

  const handleRebalancePress = () => {
    showAlert({
      title: 'Rebalancing',
      message: 'Rebalancing feature would be implemented here',
      actions: [{text: 'OK', style: 'default'}],
    });
  };

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Portfolio Analytics"
        subtitle="Detailed investment insights"
        onBackPress={() => router.back()}
        mode="collapsing"
        scrollY={scrollY}
        enableProgressiveBlur
        rightElement={
          <Button onPress={handleExportPress} variant="ghost" padding="$0" minWidth={0}>
            <GlassBackdrop
              intensity={80}
              tint={isDarkMode ? 'dark' : 'light'}
              style={{
                borderRadius: 22,
                overflow: 'hidden',
              }}>
              <LinearGradient
                colors={
                  isDarkMode
                    ? ['rgba(34, 197, 94, 0.3)', 'rgba(22, 163, 74, 0.5)']
                    : ['rgba(34, 197, 94, 0.2)', 'rgba(22, 163, 74, 0.3)']
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="document-text" size={24} color="white" />
              </LinearGradient>
            </GlassBackdrop>
          </Button>
        }
      />

      <ScreenWrapper
        edges={[]}
        backgroundColor="transparent"
        padding={false}
        keyboardAvoiding={false}
        scrollable={false}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={{flex: 1, backgroundColor: 'transparent'}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingTop: 118, paddingBottom: 100}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDarkMode ? '#fff' : '#000'}
            />
          }>
          <VStack flex={1} padding="$4" gap="$4">
            <PortfolioOverviewSection
              portfolioStats={portfolioStats}
              portfolioMetrics={portfolioMetrics}
              formatCurrency={formatCurrency}
            />

            <PortfolioPerformanceSection
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              performanceData={performanceData}
            />

            <AssetAllocationSection
              categoryChartData={categoryChartData}
              categoryBreakdown={portfolioStats.categoryBreakdown}
              formatCurrency={formatCurrency}
            />

            <RiskAnalysisSection portfolioMetrics={portfolioMetrics} />

            <BenchmarkComparisonSection comparisons={benchmarkComparisons} />

            <RebalancingRecommendationsSection
              recommendations={rebalancingRecommendations}
              formatCurrency={formatCurrency}
              onRebalancePress={handleRebalancePress}
            />

            <PerformerSection
              title="Top Performers"
              icon="trophy"
              investments={portfolioStats.topPerformers}
              color="#4CAF50"
              formatCurrency={formatCurrency}
              positive
            />

            {portfolioStats.worstPerformers[0]?.returnPercentage < 0 && (
              <PerformerSection
                title="Needs Attention"
                icon="warning"
                investments={portfolioStats.worstPerformers.filter(
                  (investment) => investment.returnPercentage < 0,
                )}
                color="#FF5722"
                formatCurrency={formatCurrency}
              />
            )}
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
}
