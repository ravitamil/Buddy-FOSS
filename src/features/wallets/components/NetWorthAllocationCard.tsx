import {
  EmptyState,
  GlassSurface,
  HStack,
  SegmentedControl,
  Text,
  VStack,
} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {useState} from 'react';
import {PieChart} from 'react-native-gifted-charts';
import {View} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {NetWorthSummary} from '@/types';
import type {NetWorthChartDatum} from '../hooks/useNetWorthScreen';

interface NetWorthAllocationCardProps {
  summary: NetWorthSummary;
  assetChartData: NetWorthChartDatum[];
  liabilityChartData: NetWorthChartDatum[];
  formatCurrency: (amount: number) => string;
  getColorForCategory: (category: string) => string;
}

export const NetWorthAllocationCard = ({
  summary,
  assetChartData,
  liabilityChartData,
  formatCurrency,
  getColorForCategory,
}: NetWorthAllocationCardProps) => {
  const {isDarkMode} = useTamaguiTheme();
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');

  const segmentedOptions = [
    {label: `Assets (${formatCurrency(summary.totalAssets)})`, value: 'assets'},
    {label: `Liabilities (${formatCurrency(summary.totalLiabilities)})`, value: 'liabilities'},
  ] as const;

  const isAssets = activeTab === 'assets';
  const currentTotal = isAssets ? summary.totalAssets : summary.totalLiabilities;
  const currentChartData = isAssets ? assetChartData : liabilityChartData;
  const currentRows = isAssets ? summary.assetBreakdown : summary.liabilityBreakdown;

  return (
    <GlassSurface borderRadius={24} padding={16} testID="net-worth-allocation-card">
      <VStack gap="$4">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" gap="$2">
            <Ionicons name="pie-chart" size={20} color="#4ECDC4" />
            <VStack>
              <Text variant="h5" color="$text" weight="bold">
                Portfolio Allocation
              </Text>
              <Text variant="caption" color="$textSecondary">
                Asset & liability distribution
              </Text>
            </VStack>
          </HStack>
        </HStack>

        {/* Segmented Switcher */}
        <SegmentedControl
          options={segmentedOptions}
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'assets' | 'liabilities')}
          selectedTone={isAssets ? 'primary' : 'info'}
          fontSize="$2"
        />

        {/* Donut Chart & Category Rows */}
        {currentRows.length > 0 && currentChartData.length > 0 ? (
          <VStack gap="$4" alignItems="center" paddingTop="$2">
            {/* Donut Chart */}
            <PieChart
              data={currentChartData}
              donut
              radius={78}
              innerRadius={54}
              backgroundColor="transparent"
              innerCircleColor={isDarkMode ? '#12161A' : '#F5F7FA'}
              centerLabelComponent={() => (
                <VStack alignItems="center" justifyContent="center">
                  <Text variant="caption" color="$textSecondary" fontSize={11}>
                    Total
                  </Text>
                  <Text variant="body2" color="$text" weight="bold" numberOfLines={1}>
                    {formatCurrency(currentTotal)}
                  </Text>
                </VStack>
              )}
              isAnimated
              animationDuration={600}
            />

            {/* Category Breakdown Rows */}
            <VStack gap="$2.5" width="100%">
              {currentRows.map((item) => {
                const categoryColor = getColorForCategory(item.category);
                return (
                  <VStack
                    key={item.category}
                    gap="$1.5"
                    paddingVertical="$1"
                    paddingHorizontal="$2">
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack alignItems="center" gap="$2">
                        <VStack
                          width={10}
                          height={10}
                          borderRadius={5}
                          backgroundColor={categoryColor}
                        />
                        <Text variant="body2" color="$text" weight="medium">
                          {item.category}
                        </Text>
                      </HStack>

                      <HStack alignItems="center" gap="$2">
                        <Text variant="caption" color="$textSecondary">
                          {item.percentage.toFixed(1)}%
                        </Text>
                        <Text variant="body2" color="$text" weight="bold">
                          {formatCurrency(item.value)}
                        </Text>
                      </HStack>
                    </HStack>

                    <View
                      height={4}
                      borderRadius={2}
                      overflow="hidden"
                      backgroundColor={
                        isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
                      }>
                      <View
                        width={`${Math.min(item.percentage, 100)}%`}
                        height="100%"
                        backgroundColor={categoryColor}
                        borderRadius={2}
                      />
                    </View>
                  </VStack>
                );
              })}
            </VStack>
          </VStack>
        ) : isAssets ? (
          <VStack paddingVertical="$4">
            <EmptyState
              icon="wallet-outline"
              iconColor="#4ECDC4"
              title="No Assets Found"
              description="Add wallets, bank accounts, or investments to see your asset breakdown."
            />
          </VStack>
        ) : (
          <VStack paddingVertical="$4">
            <EmptyState
              icon="shield-checkmark"
              iconColor="#4CAF50"
              title="Debt Free!"
              description="You have no recorded liabilities. 100% of your assets contribute directly to your net worth."
            />
          </VStack>
        )}
      </VStack>
    </GlassSurface>
  );
};
