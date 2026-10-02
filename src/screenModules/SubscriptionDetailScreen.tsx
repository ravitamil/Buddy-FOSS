import {Button, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import Animated from 'react-native-reanimated';

import {CustomNavigationHeader, ScreenContainer} from '@/components/ui';
import {
  SubscriptionAnalyticsSection,
  SubscriptionDetailsSection,
  SubscriptionHeaderActions,
  SubscriptionOverviewSection,
  SubscriptionPaymentHistorySection,
  SubscriptionPaymentSheets,
  SubscriptionQuickActionsSection,
  useSubscriptionDetailScreen,
} from '@/features/subscriptions';

interface SubscriptionDetailScreenProps {
  subscriptionId: string;
}

export default function SubscriptionDetailScreen({subscriptionId}: SubscriptionDetailScreenProps) {
  const screen = useSubscriptionDetailScreen({subscriptionId});

  if (screen.loading) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
        <VStack flex={1} alignItems="center" justifyContent="center">
          <Text variant="h4" color="$text">
            Loading Subscription Details...
          </Text>
        </VStack>
      </ScreenContainer>
    );
  }

  if (!screen.subscription) {
    return (
      <ScreenContainer dotSize={2} dotSpacing={18} ignoreBottomSafeArea>
        <VStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text variant="h4" color="$text" textAlign="center">
            Subscription Not Found
          </Text>
          <Button onPress={screen.handleBack}>Go Back</Button>
        </VStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer dotSize={2} dotSpacing={18} edges={['bottom']}>
      <CustomNavigationHeader
        title={screen.subscription.name}
        subtitle="Subscription Details"
        mode="collapsing"
        onBackPress={screen.handleBack}
        rightElement={<SubscriptionHeaderActions screen={screen} />}
        {...screen.headerProps}
      />
      <Animated.ScrollView
        onScroll={screen.onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 118, paddingBottom: 100}}>
        <VStack flex={1} padding="$4" gap="$4">
          <SubscriptionOverviewSection screen={screen} />
          <SubscriptionQuickActionsSection screen={screen} />
          <SubscriptionAnalyticsSection screen={screen} />
          <SubscriptionDetailsSection screen={screen} />
          <SubscriptionPaymentHistorySection screen={screen} />
        </VStack>
      </Animated.ScrollView>
      <SubscriptionPaymentSheets screen={screen} />
    </ScreenContainer>
  );
}
