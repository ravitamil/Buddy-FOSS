import {Button, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {QuickSettleProps} from './settlementHistoryTypes';
import {firstName} from './settlementHistoryUtils';

export const SettlementHistoryQuickSettle: React.FC<QuickSettleProps> = ({
  suggestions,
  accessibilityLabel,
  isDarkMode,
  formatCurrency,
  onSettle,
}) => {
  if (!suggestions.length) return null;

  return (
    <VStack
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="These payments help settle outstanding debts">
      <GlassSurface borderRadius={18} padding="$4">
        <VStack gap="$3">
          <HStack alignItems="center" gap="$2">
            <Ionicons name="flash" size={18} color={isDarkMode ? '#FBBF24' : '#F59E0B'} />
            <Text variant="body1" color="$color" weight="bold">
              Suggested Payments
            </Text>
          </HStack>
          {suggestions.map((suggestion) => (
            <HStack
              key={suggestion.id}
              justifyContent="space-between"
              alignItems="center"
              padding="$3"
              borderRadius="$3"
              borderWidth={1}
              borderColor={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
              backgroundColor={isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}>
              <VStack flex={1} gap="$1">
                <HStack alignItems="center" gap="$1.5">
                  <Text variant="body2" color="$color" weight="semibold">
                    {firstName(suggestion.fromMemberName)}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={13}
                    color={isDarkMode ? '#94A3B8' : '#64748B'}
                  />
                  <Text variant="body2" color="$color" weight="semibold">
                    {firstName(suggestion.toMemberName)}
                  </Text>
                </HStack>
                <Text variant="body1" color={isDarkMode ? '#4ADE80' : '#16A34A'} weight="bold">
                  {formatCurrency(suggestion.amount)}
                </Text>
              </VStack>
              <Button
                size="small"
                variant="primary"
                onPress={() => onSettle(suggestion)}
                accessibilityLabel={`Settle payment from ${firstName(suggestion.fromMemberName)} to ${firstName(suggestion.toMemberName)}`}>
                Settle
              </Button>
            </HStack>
          ))}
        </VStack>
      </GlassSurface>
    </VStack>
  );
};
