import {GlassSurface, HStack, Text} from '@ravitamil/buddy-ui';
import React from 'react';
import {useTheme} from 'tamagui';
import {PieChart} from 'react-native-gifted-charts';

import type {TransactionAnalyticsDatum} from '../types';

interface TransactionAnalyticsCardProps {
  data: TransactionAnalyticsDatum[];
  isDarkMode: boolean;
  isVisible: boolean;
}

export function TransactionAnalyticsCard({
  data,
  isDarkMode,
  isVisible,
}: TransactionAnalyticsCardProps) {
  const theme = useTheme();

  if (!isVisible || data.length === 0) {
    return null;
  }

  const textColor = String(theme.color?.val ?? (isDarkMode ? '#FFFFFF' : '#000000'));
  const strokeColor = String(theme.borderColor?.val ?? (isDarkMode ? '#1E293B' : '#E2E8F0'));

  return (
    <GlassSurface padding={16} borderRadius={18}>
      <HStack justifyContent="space-between" alignItems="center" marginBottom={16}>
        <Text variant="h5" color="$color" weight="bold">
          Expense Distribution
        </Text>
      </HStack>
      <PieChart
        data={data}
        radius={90}
        showText
        textColor={textColor}
        textSize={12}
        strokeWidth={2}
        strokeColor={strokeColor}
        backgroundColor="transparent"
      />
    </GlassSurface>
  );
}
