import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {SubscriptionData} from '@/types/finance.types';
import {buildSubscriptionDetailReadModel} from '../../hooks/subscriptionDetailReadModels';
import {SubscriptionDetailCard} from '../SubscriptionDetailCard';
import {
  DetailRow,
  Separator,
  type SubscriptionDetailSectionProps,
  VIBRANT_GREEN,
} from './subscriptionDetailSectionPrimitives';

export function SubscriptionDetailsSection({screen}: SubscriptionDetailSectionProps) {
  const subscription = screen.subscription as SubscriptionData;
  const details = buildSubscriptionDetailReadModel(subscription);

  return (
    <SubscriptionDetailCard
      title="Subscription Details"
      icon="document-text"
      isDarkMode={screen.isDarkMode}
      accentColor="#F97316">
      <VStack gap="$3">
        <DetailRow icon="pricetag" label="Category" value={subscription.category} color="#6366F1" />
        <Separator isDarkMode={screen.isDarkMode} />
        <DetailRow
          icon="refresh"
          label="Billing Cycle"
          value={subscription.billingCycle}
          color={VIBRANT_GREEN}
        />
        <Separator isDarkMode={screen.isDarkMode} />
        <DetailRow
          icon="calendar-outline"
          label="Next Billing"
          value={details.nextBillingLabel}
          color="#F97316"
        />
        <Separator isDarkMode={screen.isDarkMode} />
        <DetailRow
          icon="card"
          label="Auto-Pay"
          value={details.autoPayLabel}
          color={details.autoPayColor}
        />
        <Separator isDarkMode={screen.isDarkMode} />
        <DetailRow
          icon="notifications"
          label="Reminders"
          value={details.reminderLabel}
          color={details.reminderColor}
        />
        {subscription.website ? (
          <>
            <Separator isDarkMode={screen.isDarkMode} />
            <DetailRow
              icon="globe"
              label="Website"
              color="#14B8A6"
              value={
                <HStack
                  accessibilityRole="link"
                  onPress={screen.handleWebsitePress}
                  pressStyle={{opacity: 0.7}}
                  alignItems="center"
                  gap="$1">
                  <Text variant="body1" color="#14B8A6" weight="bold" numberOfLines={1}>
                    {details.websiteLabel}
                  </Text>
                  <Ionicons name="open-outline" size={14} color="#14B8A6" />
                </HStack>
              }
            />
          </>
        ) : null}
      </VStack>
    </SubscriptionDetailCard>
  );
}
