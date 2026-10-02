import {
  Badge,
  GlassSurface,
  HStack,
  IconTile,
  Text,
  VStack,
  resolveThemeColor,
} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {ComponentProps, memo, useMemo} from 'react';
import {View, XStack, useTheme} from 'tamagui';

import type {SubscriptionData} from '@/types/finance.types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface SubscriptionsScreenListItemProps {
  formatCurrency: (amount: number) => string;
  isDarkMode: boolean;
  onViewSubscription: (subscriptionId: string) => void;
  subscription: SubscriptionData;
}

export const SubscriptionsScreenListItem = memo(function SubscriptionsScreenListItem({
  formatCurrency,
  onViewSubscription,
  subscription,
}: SubscriptionsScreenListItemProps) {
  const theme = useTheme();
  const daysUntilRenewal = useMemo(
    () => getDaysUntilRenewal(subscription.nextBilling),
    [subscription.nextBilling],
  );
  const isRenewalSoon = daysUntilRenewal >= 0 && daysUntilRenewal <= 7;
  const isActive = subscription.status === 'active';

  const resolvedColor = useMemo(() => {
    if (
      !subscription.color ||
      subscription.color === '#000000' ||
      subscription.color.toLowerCase() === '#1f2937' ||
      subscription.color.toLowerCase() === '#111827'
    ) {
      return resolveThemeColor(theme, 'primary', '#f59e0b');
    }
    return subscription.color;
  }, [subscription.color, theme]);

  const statusTone =
    subscription.status === 'active'
      ? 'success'
      : subscription.status === 'paused'
        ? 'warning'
        : 'neutral';

  const displayWebsite = useMemo(() => {
    if (!subscription.website) return null;
    return subscription.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }, [subscription.website]);

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={`View ${subscription.name} subscription`}
      onPress={() => onViewSubscription(subscription.id)}
      pressStyle={{opacity: 0.9}}>
      <GlassSurface padding={18} borderRadius={20} style={{marginBottom: 12}}>
        <VStack gap="$3.5">
          {/* Header */}
          <HStack alignItems="center" justifyContent="space-between" gap="$3">
            <HStack alignItems="center" gap="$3" flex={1}>
              <IconTile
                icon={(subscription.icon as IoniconName) || 'calendar-outline'}
                color={resolvedColor}
                tone="soft"
                size={44}
                iconSize={22}
                shape="rounded"
              />
              <VStack flex={1} gap="$0.5">
                <Text variant="h5" color="$text" weight="bold" numberOfLines={1}>
                  {subscription.name}
                </Text>
                <Text variant="caption" color="$textSecondary" numberOfLines={1}>
                  {subscription.category || 'Subscription'}
                </Text>
              </VStack>
            </HStack>

            <HStack alignItems="center" gap="$2">
              <Badge label={subscription.status.toUpperCase()} tone={statusTone} />
              <Ionicons
                name="chevron-forward"
                size={18}
                color={resolveThemeColor(theme, 'textSecondary', '#9ca3af')}
              />
            </HStack>
          </HStack>

          {/* Billing & Renewal summary banner */}
          <HStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$3.5"
            paddingVertical="$3"
            borderRadius={14}
            backgroundColor="$surfaceHover"
            borderWidth={1}
            borderColor="$borderColor">
            <VStack flex={1} gap="$1">
              <HStack alignItems="baseline" gap="$1.5">
                <Text variant="h4" color="$text" weight="bold">
                  {formatCurrency(subscription.amount)}
                </Text>
                <Text variant="caption" color="$textSecondary" weight="medium">
                  / {subscription.billingCycle}
                </Text>
              </HStack>

              <XStack alignItems="center" gap="$1" marginTop={2}>
                <Ionicons
                  name={isRenewalSoon ? 'time' : 'calendar-outline'}
                  size={13}
                  color={
                    isRenewalSoon && isActive
                      ? resolveThemeColor(theme, 'warning', '#f59e0b')
                      : resolveThemeColor(theme, 'textSecondary', '#9ca3af')
                  }
                />
                <Text
                  variant="caption"
                  color={isRenewalSoon && isActive ? '$warning' : '$textSecondary'}
                  weight={isRenewalSoon && isActive ? 'semibold' : 'normal'}>
                  {getRenewalLabel(
                    subscription.nextBilling,
                    daysUntilRenewal,
                    isActive,
                    isRenewalSoon,
                  )}
                </Text>
              </XStack>
            </VStack>

            {displayWebsite ? (
              <XStack
                alignItems="center"
                gap="$1.5"
                paddingHorizontal="$2.5"
                paddingVertical="$1.5"
                borderRadius={12}
                backgroundColor="$surface"
                borderWidth={1}
                borderColor="$borderColor">
                <Ionicons
                  name="globe-outline"
                  size={12}
                  color={resolveThemeColor(theme, 'textSecondary', '#9ca3af')}
                />
                <Text
                  variant="caption"
                  color="$text"
                  fontSize={11}
                  weight="medium"
                  numberOfLines={1}>
                  {displayWebsite}
                </Text>
              </XStack>
            ) : null}
          </HStack>

          {/* Optional description */}
          {subscription.description ? (
            <XStack
              alignItems="center"
              gap="$1.5"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius={10}
              backgroundColor="$surfaceHover">
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={resolveThemeColor(theme, 'textSecondary', '#9ca3af')}
              />
              <Text
                variant="caption"
                color="$textSecondary"
                fontSize={12}
                numberOfLines={2}
                flex={1}>
                {subscription.description}
              </Text>
            </XStack>
          ) : null}
        </VStack>
      </GlassSurface>
    </View>
  );
}, areSubscriptionItemsEqual);

function getDaysUntilRenewal(nextBilling: string) {
  const renewalDate = new Date(nextBilling);
  const today = new Date();
  const diffTime = renewalDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getRenewalLabel(
  nextBilling: string,
  daysUntilRenewal: number,
  isActive: boolean,
  isRenewalSoon: boolean,
) {
  if (!isActive) return 'Not active';
  if (isRenewalSoon) return `Renews in ${daysUntilRenewal} days`;
  return `Next: ${new Date(nextBilling).toLocaleDateString()}`;
}

function areSubscriptionItemsEqual(
  prevProps: SubscriptionsScreenListItemProps,
  nextProps: SubscriptionsScreenListItemProps,
) {
  return (
    prevProps.subscription.id === nextProps.subscription.id &&
    prevProps.subscription.name === nextProps.subscription.name &&
    prevProps.subscription.status === nextProps.subscription.status &&
    prevProps.subscription.amount === nextProps.subscription.amount &&
    prevProps.subscription.billingCycle === nextProps.subscription.billingCycle &&
    prevProps.subscription.nextBilling === nextProps.subscription.nextBilling &&
    prevProps.subscription.category === nextProps.subscription.category &&
    prevProps.subscription.website === nextProps.subscription.website &&
    prevProps.subscription.description === nextProps.subscription.description &&
    prevProps.isDarkMode === nextProps.isDarkMode
  );
}
