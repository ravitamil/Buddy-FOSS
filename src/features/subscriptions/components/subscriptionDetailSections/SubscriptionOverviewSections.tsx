import {Badge, HStack, IconTile, Text, VStack, resolveThemeColor} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {useTheme} from 'tamagui';

import type {SubscriptionData} from '@/types/finance.types';
import {buildSubscriptionDetailReadModel} from '../../hooks/subscriptionDetailReadModels';
import {SubscriptionDetailCard} from '../SubscriptionDetailCard';
import {
  type IoniconName,
  Separator,
  type SubscriptionDetailSectionProps,
} from './subscriptionDetailSectionPrimitives';

export function SubscriptionHeaderActions({screen}: SubscriptionDetailSectionProps) {
  const theme = useTheme();
  return (
    <HStack gap="$2">
      <HStack
        accessibilityRole="button"
        accessibilityLabel="Edit subscription"
        onPress={screen.handleEdit}
        pressStyle={{opacity: 0.75, scale: 0.95}}
        width={40}
        height={40}
        borderRadius="$10"
        alignItems="center"
        justifyContent="center"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$surface">
        <Ionicons name="pencil" size={18} color={resolveThemeColor(theme, 'primary', '#3b82f6')} />
      </HStack>
      <HStack
        accessibilityRole="button"
        accessibilityLabel="Share subscription"
        onPress={screen.handleShare}
        pressStyle={{opacity: 0.75, scale: 0.95}}
        width={40}
        height={40}
        borderRadius="$10"
        alignItems="center"
        justifyContent="center"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$surface">
        <Ionicons
          name="share-outline"
          size={18}
          color={resolveThemeColor(theme, 'textSecondary', '#9ca3af')}
        />
      </HStack>
    </HStack>
  );
}

export function SubscriptionOverviewSection({screen}: SubscriptionDetailSectionProps) {
  const theme = useTheme();
  const subscription = screen.subscription as SubscriptionData;
  const {nextBillingLabel} = buildSubscriptionDetailReadModel(subscription);

  const accentColor =
    subscription.color &&
    subscription.color !== '#000000' &&
    subscription.color.toLowerCase() !== '#1f2937'
      ? subscription.color
      : resolveThemeColor(theme, 'primary', '#f59e0b');

  const statusTone: 'success' | 'warning' | 'error' | 'neutral' =
    subscription.status === 'active'
      ? 'success'
      : subscription.status === 'paused'
        ? 'warning'
        : subscription.status === 'cancelled'
          ? 'error'
          : 'neutral';

  return (
    <SubscriptionDetailCard isDarkMode={screen.isDarkMode} accentColor={accentColor}>
      <VStack gap="$4">
        {/* Top row: IconTile, Title & Category, Status Badge */}
        <HStack alignItems="center" justifyContent="space-between">
          <HStack alignItems="center" gap="$3" flex={1}>
            <IconTile
              icon={(subscription.icon as IoniconName) || 'card-outline'}
              color={accentColor}
              tone="soft"
              size={52}
              iconSize={26}
              shape="rounded"
            />
            <VStack flex={1} gap="$0.5">
              <Text variant="h3" color="$text" weight="bold" numberOfLines={1}>
                {subscription.name}
              </Text>
              <HStack alignItems="center" gap="$2">
                <Text variant="caption" color="$textSecondary" weight="medium">
                  {subscription.category || 'General'}
                </Text>
                {subscription.billingCycle ? (
                  <>
                    <Text variant="caption" color="$textSecondary">
                      •
                    </Text>
                    <Text variant="caption" color="$textSecondary" textTransform="capitalize">
                      {subscription.billingCycle}
                    </Text>
                  </>
                ) : null}
              </HStack>
            </VStack>
          </HStack>
          <Badge label={subscription.status} tone={statusTone} />
        </HStack>

        {/* Hero Cost Banner */}
        <VStack
          padding="$3.5"
          borderRadius="$5"
          backgroundColor={screen.isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'}
          borderWidth={1}
          borderColor="$borderColor"
          gap="$2">
          <HStack justifyContent="space-between" alignItems="flex-end">
            <VStack gap="$1">
              <Text variant="caption" color="$textSecondary" weight="medium">
                Recurring Amount
              </Text>
              <HStack alignItems="baseline" gap="$1.5">
                <Text variant="h2" color="$text" weight="bold">
                  {screen.currency} {subscription.amount.toLocaleString()}
                </Text>
                <Text variant="body2" color="$textSecondary" weight="medium">
                  /{subscription.billingCycle}
                </Text>
              </HStack>
            </VStack>

            <VStack alignItems="flex-end" gap="$1">
              <Text variant="caption" color="$textSecondary" weight="medium">
                Next Renewal
              </Text>
              <HStack alignItems="center" gap="$1">
                <Ionicons name="calendar-outline" size={13} color={accentColor} />
                <Text variant="body2" color="$text" weight="semibold">
                  {nextBillingLabel}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </VStack>

        {/* Description if present */}
        {subscription.description ? (
          <>
            <Separator isDarkMode={screen.isDarkMode} />
            <Text variant="body2" color="$textSecondary" style={{fontStyle: 'italic'}}>
              {subscription.description}
            </Text>
          </>
        ) : null}
      </VStack>
    </SubscriptionDetailCard>
  );
}
