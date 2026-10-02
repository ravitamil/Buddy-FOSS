import React from 'react';
import {Dimensions} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

import {AnalyticsGlassCard, AnalyticsPeriodSelector} from '@/features/analytics';
import type {
  PortfolioAnalyticsPeriod,
  PortfolioPerformanceData,
} from '../../hooks/usePortfolioAnalytics';

interface PerformanceSectionProps {
  selectedPeriod: PortfolioAnalyticsPeriod;
  onPeriodChange: (period: PortfolioAnalyticsPeriod) => void;
  performanceData: PortfolioPerformanceData;
}

export const PortfolioPerformanceSection = ({
  selectedPeriod,
  onPeriodChange,
  performanceData,
}: PerformanceSectionProps) => {
  return (
    <AnalyticsGlassCard title="Portfolio Performance" icon="analytics">
      <AnalyticsPeriodSelector
        periods={['1M', '3M', '6M', '1Y', 'ALL'] as const}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
      />

      {performanceData.data.length > 1 && (
        <LineChart
          data={performanceData.data.map((value, index) => ({
            value,
            label:
              performanceData.labels[index]?.length > 10
                ? `${performanceData.labels[index].substring(0, 10)}...`
                : performanceData.labels[index],
          }))}
          width={Dimensions.get('window').width - 64}
          height={250}
          color="#4ECDC4"
          curved
          yAxisLabelPrefix="$"
          noOfSections={4}
          rotateLabel={selectedPeriod !== '1M' && selectedPeriod !== '3M'}
          xAxisLabelsVerticalShift={selectedPeriod === '1M' || selectedPeriod === '3M' ? 0 : 10}
          isAnimated
        />
      )}
    </AnalyticsGlassCard>
  );
};
