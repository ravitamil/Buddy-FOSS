import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {SubscriptionData} from '@/types/finance.types';
import {SubscriptionDetailCard} from '../SubscriptionDetailCard';
import {
  Separator,
  type SubscriptionDetailSectionProps,
  VIBRANT_GREEN,
} from './subscriptionDetailSectionPrimitives';

export function SubscriptionAnalyticsSection({screen}: SubscriptionDetailSectionProps) {
  const subscription = screen.subscription as SubscriptionData;
  const analytics = screen.analytics;
  if (!analytics) return null;

  const nextBillingColor = analytics.daysUntilNext <= 3 ? '#FF6B6B' : '#4ECDC4';

  return (
    <SubscriptionDetailCard
      title="Analytics Overview"
      icon="bar-chart"
      isDarkMode={screen.isDarkMode}
      accentColor="#9C27B0">
      <VStack gap="$4">
        <HStack gap="$4">
          <VStack flex={1} alignItems="center" gap="$2">
            <HStack alignItems="center" gap="$2">
              <Ionicons name="calendar" size={20} color={nextBillingColor} />
              <Text variant="body2" color="$textSecondary" weight="medium">
                Days Until Next
              </Text>
            </HStack>
            <Text variant="h4" color={nextBillingColor} weight="bold">
              {analytics.daysUntilNext > 0 ? analytics.daysUntilNext : 'Overdue'}
            </Text>
            <Text variant="caption" color="$textSecondary">
              {new Date(subscription.nextBilling).toLocaleDateString()}
            </Text>
          </VStack>
          <VStack
            width={1}
            height={60}
            backgroundColor={screen.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          />
          <VStack flex={1} alignItems="center" gap="$2">
            <HStack alignItems="center" gap="$2">
              <Ionicons name="trending-up" size={20} color="#9C27B0" />
              <Text variant="body2" color="$textSecondary" weight="medium">
                Yearly Cost
              </Text>
            </HStack>
            <Text variant="h4" color="#9C27B0" weight="bold">
              {screen.currency} {analytics.yearlyCost.toLocaleString()}
            </Text>
            <Text variant="caption" color="$textSecondary">
              {analytics.paymentCount} payments
            </Text>
          </VStack>
        </HStack>
        {analytics.totalPaid > 0 ? (
          <>
            <Separator isDarkMode={screen.isDarkMode} />
            <VStack alignItems="center" gap="$2">
              <HStack alignItems="center" gap="$2">
                <Ionicons name="checkmark-circle" size={20} color={VIBRANT_GREEN} />
                <Text variant="body2" color="$textSecondary" weight="medium">
                  Total Paid
                </Text>
              </HStack>
              <Text variant="h4" color={VIBRANT_GREEN} weight="bold">
                {screen.currency} {analytics.totalPaid.toLocaleString()}
              </Text>
              <VStack
                accessibilityRole="button"
                onPress={() => screen.setShowPaymentHistory(true)}
                pressStyle={{opacity: 0.7}}>
                <Text variant="caption" color="#6366F1">
                  Avg: {screen.currency} {analytics.avgPayment.toFixed(0)} - View History
                </Text>
              </VStack>
            </VStack>
          </>
        ) : null}
      </VStack>
    </SubscriptionDetailCard>
  );
}
