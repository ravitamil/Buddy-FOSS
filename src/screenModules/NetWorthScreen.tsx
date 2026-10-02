import {VStack} from '@ravitamil/buddy-ui';
import React, {useCallback, useState} from 'react';
import {RefreshControl} from 'react-native';
import Animated, {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import {router} from 'expo-router';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import {
  NetWorthAllocationCard,
  NetWorthHeroCard,
  NetWorthHoldingsCard,
  NetWorthProjectionCard,
  NetWorthQuickActionsCard,
  useNetWorthScreen,
} from '@/features/wallets';

const NetWorthScreen = () => {
  const {isDarkMode} = useTamaguiTheme();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const {
    selectedPeriod,
    setSelectedPeriod,
    formatCurrency,
    netWorthSummary,
    assets,
    liabilities,
    netWorthHistoryData,
    assetBreakdownData,
    liabilityBreakdownData,
    getColorForCategory,
    projectedTarget,
    projectedGrowth,
    projectedGrowthPercentage,
    debtHealth,
  } = useNetWorthScreen();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title="Net Worth"
        subtitle="Track your financial health"
        onBackPress={() => router.back()}
        mode="collapsing"
        scrollY={scrollY}
        enableProgressiveBlur
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
          contentContainerStyle={{paddingTop: 118, paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDarkMode ? '#fff' : '#000'}
            />
          }>
          <VStack flex={1} padding="$4" gap="$4">
            {/* 1. Hero Card */}
            <NetWorthHeroCard
              summary={netWorthSummary}
              formatCurrency={formatCurrency}
              assetCount={assets.length}
              liabilityCount={liabilities.length}
              debtHealth={debtHealth}
            />

            {/* 2. Quick Actions */}
            <NetWorthQuickActionsCard />

            {/* 3. Projection Card */}
            <NetWorthProjectionCard
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              historyData={netWorthHistoryData}
              projectedTarget={projectedTarget}
              projectedGrowth={projectedGrowth}
              projectedGrowthPercentage={projectedGrowthPercentage}
              formatCurrency={formatCurrency}
            />

            {/* 4. Portfolio Allocation Card */}
            <NetWorthAllocationCard
              summary={netWorthSummary}
              assetChartData={assetBreakdownData}
              liabilityChartData={liabilityBreakdownData}
              formatCurrency={formatCurrency}
              getColorForCategory={getColorForCategory}
            />

            {/* 5. Holdings & Accounts Card */}
            <NetWorthHoldingsCard
              assets={assets}
              liabilities={liabilities}
              formatCurrency={formatCurrency}
            />
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
};

export default NetWorthScreen;
