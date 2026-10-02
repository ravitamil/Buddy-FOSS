import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';

interface AnalyticsEmptyStateProps {
  period: string;
}

export const AnalyticsEmptyState: React.FC<AnalyticsEmptyStateProps> = ({period}) => {
  const {isDarkMode} = useTamaguiTheme();

  return (
    <GlassSurface padding="$6" borderRadius={24}>
      <VStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$4">
        <VStack
          width={64}
          height={64}
          borderRadius={32}
          backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}
          alignItems="center"
          justifyContent="center">
          <Ionicons name="bar-chart-outline" size={32} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        </VStack>

        <VStack alignItems="center" gap="$1">
          <Text variant="h5" color="$text" weight="bold" textAlign="center">
            No Transactions Recorded
          </Text>
          <Text variant="body2" color="$textSecondary" textAlign="center" maxWidth={280}>
            There are no transactions recorded for this {period}. Record an expense or select a
            different time range to view insights.
          </Text>
        </VStack>

        <HStack
          alignItems="center"
          gap="$2"
          marginTop="$2"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$8"
          backgroundColor={isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'}>
          <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
          <Text variant="caption" color="$blue10" weight="medium">
            Switch period above to explore past data
          </Text>
        </HStack>
      </VStack>
    </GlassSurface>
  );
};
