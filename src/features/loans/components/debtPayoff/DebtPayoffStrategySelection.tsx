import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {DebtPayoffStrategy} from '@/types/debt.types';
import {STRATEGIES} from './debtPayoffConstants';
import {SectionTitle} from './DebtPayoffPrimitives';

export function StrategySelection({
  selectedStrategy,
  isDarkMode,
  onSelectStrategy,
}: {
  selectedStrategy: DebtPayoffStrategy;
  isDarkMode: boolean;
  onSelectStrategy: (strategy: DebtPayoffStrategy) => void;
}) {
  return (
    <GlassSurface>
      <VStack gap="$4">
        <SectionTitle
          icon="options"
          title="Payoff Strategy"
          color={isDarkMode ? '#4ECDC4' : '#2A9D8F'}
        />
        <VStack gap="$3">
          {STRATEGIES.map((strategy) => {
            const selected = selectedStrategy === strategy.id;
            return (
              <VStack
                key={strategy.id}
                accessibilityRole="button"
                accessibilityState={{selected}}
                onPress={() => onSelectStrategy(strategy.id)}
                pressStyle={{opacity: 0.7}}
                padding="$4"
                borderRadius="$3"
                backgroundColor={
                  selected
                    ? isDarkMode
                      ? 'rgba(78, 205, 196, 0.2)'
                      : 'rgba(78, 205, 196, 0.1)'
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)'
                }
                borderWidth={1}
                borderColor={
                  selected
                    ? '#4ECDC4'
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)'
                }>
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack alignItems="center" gap="$3">
                    <Ionicons
                      name={strategy.icon}
                      size={20}
                      color={selected ? '#4ECDC4' : isDarkMode ? '#aaa' : '#666'}
                    />
                    <VStack>
                      <Text variant="body1" color="$text" weight="semibold">
                        {strategy.name}
                      </Text>
                      <Text variant="caption" color="$textSecondary">
                        {strategy.description}
                      </Text>
                    </VStack>
                  </HStack>
                  {selected && <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />}
                </HStack>
              </VStack>
            );
          })}
        </VStack>
      </VStack>
    </GlassSurface>
  );
}
