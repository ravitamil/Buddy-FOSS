import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {PaymentRecord} from '@/types/loan.types';
import type {SubscriptionData} from '@/types/finance.types';
import {SubscriptionDetailCard} from './SubscriptionDetailCard';
import type {UseSubscriptionDetailScreenResult} from '../hooks/useSubscriptionDetailScreen';
import {getVisibleSubscriptionPayments} from '../hooks/subscriptionDetailReadModels';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SubscriptionPaymentHistorySectionProps {
  screen: UseSubscriptionDetailScreenResult;
}

function PaymentStatusIcon({payment}: {payment: PaymentRecord}) {
  const color =
    payment.status === 'PAID'
      ? '#22C55E'
      : payment.status === 'PENDING'
        ? '#EAB308'
        : payment.status === 'FAILED'
          ? '#EF4444'
          : '#6B7280';
  const icon: IoniconName =
    payment.status === 'PAID'
      ? 'checkmark'
      : payment.status === 'PENDING'
        ? 'time'
        : payment.status === 'FAILED'
          ? 'close'
          : 'help';

  return (
    <VStack
      width={40}
      height={40}
      borderRadius={20}
      alignItems="center"
      justifyContent="center"
      backgroundColor={`${color}20`}>
      <Ionicons name={icon} size={20} color={color} />
    </VStack>
  );
}

export function SubscriptionPaymentHistorySection({
  screen,
}: SubscriptionPaymentHistorySectionProps) {
  const subscription = screen.subscription as SubscriptionData;
  const visiblePayments = getVisibleSubscriptionPayments(
    subscription.paymentHistory,
    screen.showPaymentHistory,
  );

  return (
    <SubscriptionDetailCard
      title="Payment History"
      icon="time"
      isDarkMode={screen.isDarkMode}
      accentColor="#22C55E">
      <VStack gap="$4">
        <HStack justifyContent="space-between" alignItems="center">
          <Text variant="body1" color="$textSecondary">
            Recent payments
          </Text>
          <HStack
            accessibilityRole="button"
            accessibilityState={{expanded: screen.showPaymentHistory}}
            onPress={() => screen.setShowPaymentHistory(!screen.showPaymentHistory)}
            pressStyle={{opacity: 0.7}}>
            <HStack alignItems="center" gap="$1">
              <Text variant="body2" color="#3B82F6" weight="bold">
                {screen.showPaymentHistory ? 'Hide' : 'Show All'}
              </Text>
              <Ionicons
                name={screen.showPaymentHistory ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#3B82F6"
              />
            </HStack>
          </HStack>
        </HStack>
        {visiblePayments.length > 0 ? (
          <VStack gap="$2">
            {visiblePayments.map((payment, index) => (
              <VStack
                key={payment.id}
                accessibilityRole="button"
                accessibilityLabel="Open payment actions"
                onLongPress={() => screen.handlePaymentAction(payment)}>
                <VStack>
                  <HStack justifyContent="space-between" alignItems="center" paddingVertical="$3">
                    <HStack alignItems="center" gap="$3">
                      <PaymentStatusIcon payment={payment} />
                      <VStack gap="$1">
                        <Text variant="body1" color="$text" weight="bold">
                          {new Date(payment.date).toLocaleDateString()}
                        </Text>
                        <Text variant="body2" color="$textSecondary">
                          {payment.method || 'Manual Payment'}
                        </Text>
                        {payment.note ? (
                          <Text variant="caption" color="$textSecondary">
                            {payment.note}
                          </Text>
                        ) : null}
                      </VStack>
                    </HStack>
                    <VStack alignItems="flex-end" gap="$1">
                      <Text
                        variant="body1"
                        color={
                          payment.status === 'PAID'
                            ? '#22C55E'
                            : payment.status === 'PENDING'
                              ? '#EAB308'
                              : payment.status === 'FAILED'
                                ? '#EF4444'
                                : '#6B7280'
                        }
                        weight="bold">
                        {screen.currency} {payment.amount}
                      </Text>
                      <Text variant="caption" color="$textSecondary" textTransform="capitalize">
                        {payment.status}
                      </Text>
                    </VStack>
                  </HStack>
                  {index < visiblePayments.length - 1 ? (
                    <VStack
                      height={1}
                      backgroundColor={
                        screen.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                      }
                      marginLeft={55}
                    />
                  ) : null}
                </VStack>
              </VStack>
            ))}
          </VStack>
        ) : (
          <VStack alignItems="center" gap="$3" padding="$6">
            <VStack
              width={80}
              height={80}
              borderRadius={40}
              alignItems="center"
              justifyContent="center"
              backgroundColor="#6B728010">
              <Ionicons name="receipt-outline" size={40} color="#6B7280" />
            </VStack>
            <VStack alignItems="center" gap="$1">
              <Text variant="body1" color="$textSecondary" textAlign="center" weight="medium">
                No payment history yet
              </Text>
              <Text variant="caption" color="$textSecondary" textAlign="center">
                Payments will appear here once recorded
              </Text>
            </VStack>
          </VStack>
        )}
      </VStack>
    </SubscriptionDetailCard>
  );
}
