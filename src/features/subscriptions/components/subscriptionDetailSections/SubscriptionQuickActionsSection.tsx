import {ActionGrid} from '@ravitamil/buddy-ui';
import React from 'react';

import type {SubscriptionData} from '@/types/finance.types';
import {SubscriptionDetailCard} from '../SubscriptionDetailCard';
import {type SubscriptionDetailSectionProps} from './subscriptionDetailSectionPrimitives';

export function SubscriptionQuickActionsSection({screen}: SubscriptionDetailSectionProps) {
  const subscription = screen.subscription as SubscriptionData;

  return (
    <SubscriptionDetailCard
      title="Quick Actions"
      icon="flash"
      isDarkMode={screen.isDarkMode}
      accentColor="#8B5CF6">
      <ActionGrid
        primaryActions={[
          {
            label: 'Mark Paid',
            icon: 'checkmark-circle',
            backgroundColor: '$success',
            disabled: subscription.status !== 'active',
            onPress: screen.handleMarkAsPaid,
          },
          {
            label: subscription.status === 'active' ? 'Pause' : 'Resume',
            icon: subscription.status === 'active' ? 'pause' : 'play',
            backgroundColor: subscription.status === 'active' ? '$warning' : '$buttonPrimary',
            onPress: screen.handlePauseResume,
          },
        ]}
        secondaryAction={{
          label: 'Delete Subscription',
          icon: 'trash',
          backgroundColor: '$error',
          onPress: screen.handleDeleteSubscription,
        }}
      />
    </SubscriptionDetailCard>
  );
}
