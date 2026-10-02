import {SegmentedControl, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {RefreshControl} from 'react-native';
import Animated from 'react-native-reanimated';
import {router} from 'expo-router';

import {CustomNavigationHeader, ScreenContainer, ScreenWrapper} from '@/components/ui';
import {useProgressiveBlurHeader} from '@/hooks/useProgressiveBlurHeader';
import type {AnalyticsPeriod, AnalyticsScreenModel} from '../hooks/useAnalyticsScreen';
import {
  AnalyticsCashflowTrendSection,
  AnalyticsCategoryBreakdownSection,
  AnalyticsEmptyState,
  AnalyticsFinancialHealthSection,
  AnalyticsOverviewSection,
  AnalyticsTopExpensesSection,
} from './sections';

export interface AnalyticsScreenSectionsProps {
  screen: AnalyticsScreenModel;
}

const PERIOD_OPTIONS = [
  {label: 'Week', value: 'week'},
  {label: 'Month', value: 'month'},
  {label: '3 Months', value: 'quarter'},
  {label: 'Year', value: 'year'},
] as const;

export const AnalyticsScreenSections: React.FC<AnalyticsScreenSectionsProps> = ({screen}) => {
  const {onScroll, headerProps} = useProgressiveBlurHeader({headerHeight: 75});

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
      <CustomNavigationHeader
        title="Financial Analytics"
        subtitle="Cash flow & spending insights"
        onBackPress={() => router.back()}
        mode="collapsing"
        {...headerProps}
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
          contentContainerStyle={{paddingTop: 108, paddingBottom: 60}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={screen.refreshing}
              onRefresh={screen.onRefresh}
              tintColor={screen.isDarkMode ? '#ffffff' : '#000000'}
            />
          }>
          <VStack flex={1} padding="$4" gap="$4">
            {/* Period Segmented Control */}
            <SegmentedControl
              options={PERIOD_OPTIONS}
              value={screen.selectedPeriod}
              onValueChange={(val) => screen.setSelectedPeriod(val as AnalyticsPeriod)}
              selectedTone="primary"
            />

            {/* Zero-data empty state or populated analytics sections */}
            {screen.transactionCount === 0 ? (
              <AnalyticsEmptyState period={screen.selectedPeriod} />
            ) : (
              <>
                <AnalyticsOverviewSection screen={screen} />
                <AnalyticsCashflowTrendSection screen={screen} />
                <AnalyticsCategoryBreakdownSection screen={screen} />
                <AnalyticsFinancialHealthSection screen={screen} />
                <AnalyticsTopExpensesSection screen={screen} />
              </>
            )}
          </VStack>
        </Animated.ScrollView>
      </ScreenWrapper>
    </ScreenContainer>
  );
};
