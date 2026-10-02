import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';

import type {DebtPayoffEmptyStateProps} from './debtPayoffTypes';

export function DebtPayoffEmptyState({isDarkMode, onAddLoan, onBack}: DebtPayoffEmptyStateProps) {
  return (
    <VStack flex={1} padding="$4" justifyContent="center" alignItems="center">
      <VStack
        alignItems="center"
        padding="$6"
        maxWidth={350}
        width="100%"
        borderRadius="$4"
        backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.25)'}
        borderWidth={1}
        borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'}>
        <HStack
          width={80}
          height={80}
          borderRadius="$10"
          backgroundColor={isDarkMode ? 'rgba(79, 70, 229, 0.2)' : 'rgba(99, 102, 241, 0.15)'}
          justifyContent="center"
          alignItems="center"
          marginBottom="$6"
          borderWidth={1}
          borderColor={isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(99, 102, 241, 0.2)'}>
          <Ionicons name="card" size={40} color={isDarkMode ? '#818cf8' : '#4f46e5'} />
        </HStack>

        <Text variant="h3" color="$text" weight="bold" textAlign="center" marginBottom="$3">
          No Active Loans
        </Text>
        <Text
          variant="body1"
          color="$textSecondary"
          textAlign="center"
          marginBottom="$5"
          lineHeight={22}>
          Add your loans to start planning your debt payoff strategy
        </Text>

        <VStack
          accessibilityRole="button"
          onPress={onAddLoan}
          pressStyle={{opacity: 0.8}}
          width="100%"
          maxWidth={200}>
          <LinearGradient
            colors={
              isDarkMode ? ['#4f46e5', '#4338ca', '#3730a3'] : ['#6366f1', '#4f46e5', '#4338ca']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isDarkMode ? '#4f46e5' : '#6366f1',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}>
            <Text variant="body1" color="white" weight="bold">
              Add Loan
            </Text>
          </LinearGradient>
        </VStack>

        <VStack
          accessibilityRole="button"
          onPress={onBack}
          pressStyle={{opacity: 0.7}}
          marginTop="$5"
          paddingVertical="$2"
          alignItems="center"
          justifyContent="center">
          <Text variant="body2" color={isDarkMode ? '$color9' : '$color11'} weight="medium">
            Back to Dashboard
          </Text>
        </VStack>
      </VStack>
    </VStack>
  );
}
