import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {PieChart} from 'react-native-gifted-charts';
import {useWindowDimensions} from 'tamagui';

import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

export interface PieBreakdownChartItem {
  value: number;
  color: string;
  text: string;
  label: string;
  percentage: string;
}

interface PieBreakdownChartProps {
  data: PieBreakdownChartItem[];
  title: string;
  formatCurrency: (amount: number) => string;
}

export const PIE_BREAKDOWN_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

export const PieBreakdownChart = ({data, title, formatCurrency}: PieBreakdownChartProps) => {
  const {isDarkMode} = useTamaguiTheme();
  const {width: screenWidth} = useWindowDimensions();
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <VStack gap="$4">
      <VStack alignItems="center">
        <PieChart
          data={data}
          radius={Math.min(screenWidth * 0.25, 100)}
          innerRadius={40}
          centerLabelComponent={() => (
            <VStack alignItems="center">
              <Text variant="caption" style={{color: '#888', fontSize: 11}} weight="medium">
                Total
              </Text>
              <Text variant="body2" style={{color: '#222', fontWeight: 'bold', fontSize: 12}}>
                {formatCurrency(totalValue)}
              </Text>
            </VStack>
          )}
          showText
          textColor={isDarkMode ? '#FFFFFF' : '#000000'}
          textSize={10}
          strokeWidth={2}
          strokeColor={isDarkMode ? '#1A1A1A' : '#FFFFFF'}
          showValuesAsLabels={false}
          showTextBackground={false}
          labelsPosition="outward"
        />
      </VStack>

      <VStack gap="$2">
        <Text variant="body2" color="$text" weight="semibold" textAlign="center">
          {title}
        </Text>
        <VStack gap="$1">
          {data.map((item, index) => (
            <HStack
              key={`${item.label}-${index}`}
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal="$2">
              <HStack alignItems="center" gap="$2" flex={1}>
                <VStack width={12} height={12} borderRadius={6} backgroundColor={item.color} />
                <Text variant="caption" color="$text" numberOfLines={1} flex={1}>
                  {item.label}
                </Text>
              </HStack>
              <HStack alignItems="center" gap="$2">
                <Text variant="caption" color="$textSecondary">
                  {item.percentage}%
                </Text>
                <Text
                  variant="caption"
                  color="$text"
                  weight="medium"
                  minWidth={60}
                  textAlign="right">
                  {formatCurrency(item.value)}
                </Text>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
};
