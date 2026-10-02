import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import {SettlementHistoryStatItem} from './SettlementHistoryStatItem';
import type {SummaryProps} from './settlementHistoryTypes';

export const SettlementHistorySummary: React.FC<SummaryProps> = ({
  paymentsCount,
  totalSettled,
  outstandingAmount,
  isDarkMode,
  formatCurrency,
}) => (
  <GlassSurface borderRadius={18} padding="$4">
    <VStack gap="$3">
      <HStack alignItems="center" gap="$2">
        <Ionicons name="stats-chart" size={18} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
        <Text variant="body1" color="$color" weight="bold">
          Settlement Summary
        </Text>
      </HStack>

      <HStack justifyContent="space-around" gap="$2">
        <SettlementHistoryStatItem
          icon="receipt"
          iconColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
          iconBackgroundColor={isDarkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)'}
          label="Payments"
          value={paymentsCount}
        />
        <SettlementHistoryStatItem
          icon="checkmark-circle"
          iconColor={isDarkMode ? '#4ADE80' : '#22C55E'}
          iconBackgroundColor={isDarkMode ? 'rgba(74, 222, 128, 0.15)' : 'rgba(34, 197, 94, 0.1)'}
          label="Settled"
          value={formatCurrency(totalSettled)}
          valueColor={isDarkMode ? '#4ADE80' : '#22C55E'}
        />
        <SettlementHistoryStatItem
          icon="alert-circle"
          iconColor={isDarkMode ? '#F87171' : '#EF4444'}
          iconBackgroundColor={isDarkMode ? 'rgba(248, 113, 113, 0.15)' : 'rgba(239, 68, 68, 0.1)'}
          label="Outstanding"
          value={formatCurrency(outstandingAmount)}
          valueColor={isDarkMode ? '#F87171' : '#EF4444'}
        />
      </HStack>
    </VStack>
  </GlassSurface>
);
