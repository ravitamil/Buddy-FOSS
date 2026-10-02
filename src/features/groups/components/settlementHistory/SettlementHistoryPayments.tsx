import {Button, GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import {SettlementTransactionCard} from './SettlementTransactionCard';
import type {HistoryProps} from './settlementHistoryTypes';

export const SettlementHistoryPayments: React.FC<HistoryProps> = ({
  group,
  settlementTransactions,
  accessibilityLabel,
  userFirstName,
  getUserDisplayName,
  isDarkMode,
  formatCurrency,
  onRecordPayment,
}) => (
  <VStack
    accessible
    accessibilityLabel={accessibilityLabel}
    accessibilityHint="Previous settlement payments">
    <VStack gap="$3">
      <HStack alignItems="center" gap="$2">
        <Ionicons
          name="time"
          size={18}
          color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}
        />
        <Text variant="body1" color="$color" weight="bold">
          Payment History
        </Text>
      </HStack>

      {settlementTransactions.length > 0 ? (
        <VStack gap="$3">
          {settlementTransactions.map((transaction) => (
            <SettlementTransactionCard
              key={transaction.id}
              group={group}
              transaction={transaction}
              userFirstName={userFirstName}
              getUserDisplayName={getUserDisplayName}
              isDarkMode={isDarkMode}
              formatCurrency={formatCurrency}
            />
          ))}
        </VStack>
      ) : (
        <GlassSurface borderRadius={18} padding="$6">
          <VStack alignItems="center" gap="$4">
            <View
              width={64}
              height={64}
              borderRadius={32}
              backgroundColor={isDarkMode ? 'rgba(74, 222, 128, 0.12)' : 'rgba(34, 197, 94, 0.08)'}
              justifyContent="center"
              alignItems="center">
              <Ionicons
                name="receipt-outline"
                size={32}
                color={isDarkMode ? '#4ADE80' : '#22C55E'}
              />
            </View>
            <VStack alignItems="center" gap="$1">
              <Text variant="body1" color="$color" weight="bold" textAlign="center">
                No Settlements Yet
              </Text>
              <Text variant="body2" color="$textSecondary" textAlign="center">
                Payments made to settle debts will appear here
              </Text>
            </VStack>

            <Button
              variant="primary"
              size="medium"
              onPress={onRecordPayment}
              accessibilityLabel="Record payment">
              Record Payment
            </Button>
          </VStack>
        </GlassSurface>
      )}
    </VStack>
  </VStack>
);
