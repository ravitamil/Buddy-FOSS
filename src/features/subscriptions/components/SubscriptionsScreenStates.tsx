import {EmptyState, Skeleton} from '@ravitamil/buddy-ui';
import {VStack} from '@ravitamil/buddy-ui';
import React from 'react';

interface SubscriptionsLoadingStateProps {
  topPadding?: number;
}

export function SubscriptionsLoadingState({topPadding = 120}: SubscriptionsLoadingStateProps) {
  return (
    <VStack flex={1} padding="$4" gap="$4" paddingTop={topPadding}>
      <Skeleton width="100%" height={180} />
      <Skeleton width="100%" height={180} />
      <Skeleton width="100%" height={180} />
    </VStack>
  );
}

interface SubscriptionsEmptyStateProps {
  onAddSubscription: () => void;
}

export function SubscriptionsEmptyState({onAddSubscription}: SubscriptionsEmptyStateProps) {
  return (
    <VStack flex={1} justifyContent="center" alignItems="center" gap="$4">
      <EmptyState
        icon="calendar"
        iconColor="#8B5CF6"
        iconAccessibilityLabel="Add subscription"
        onIconPress={onAddSubscription}
        title="No Subscriptions Yet"
        description="Track your recurring subscriptions and never miss a payment"
      />
    </VStack>
  );
}
