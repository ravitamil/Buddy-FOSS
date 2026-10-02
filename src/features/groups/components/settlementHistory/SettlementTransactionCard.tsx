import {GlassSurface, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';
import {View} from 'tamagui';

import {formatUserDisplayName} from '@/utils/userUtils';

import type {SettlementTransactionCardProps} from './settlementHistoryTypes';
import {getSettledDebts} from './settlementHistoryUtils';

export const SettlementTransactionCard: React.FC<SettlementTransactionCardProps> = ({
  group,
  transaction,
  userFirstName,
  getUserDisplayName,
  isDarkMode,
  formatCurrency,
}) => {
  const paidByMember = group.members.find((member) => member.id === transaction.paidBy);
  const receivedByMember = transaction.receivedBy?.[0]
    ? group.members.find((member) => member.id === transaction.receivedBy?.[0])
    : null;
  const settledDebts = getSettledDebts(group, transaction);
  const payerName = paidByMember
    ? formatUserDisplayName(paidByMember.name, userFirstName, undefined, getUserDisplayName)
    : 'Unknown';
  const receiverName = receivedByMember
    ? formatUserDisplayName(receivedByMember.name, userFirstName, undefined, getUserDisplayName)
    : 'Unknown';

  return (
    <GlassSurface borderRadius={18} padding="$3.5">
      <VStack gap="$3">
        <HStack
          alignItems="center"
          justifyContent="space-between"
          accessible
          accessibilityRole="text"
          accessibilityLabel={`Payment of ${formatCurrency(Math.abs(transaction.amount))} from ${payerName}${receivedByMember ? ` to ${receiverName}` : ''} on ${new Date(transaction.date).toLocaleDateString()}.`}>
          <HStack alignItems="center" gap="$3" flex={1}>
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            </LinearGradient>

            <VStack flex={1} gap="$0.5">
              <HStack alignItems="center" gap="$1.5">
                <Text variant="body1" color="$color" weight="bold" numberOfLines={1}>
                  {payerName}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={13}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
                <Text variant="body1" color="$color" weight="bold" numberOfLines={1}>
                  {receiverName}
                </Text>
              </HStack>
              <Text variant="caption" color="$textSecondary">
                {new Date(transaction.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </VStack>
          </HStack>

          <Text variant="body1" color={isDarkMode ? '#4ADE80' : '#16A34A'} weight="bold">
            {formatCurrency(Math.abs(transaction.amount))}
          </Text>
        </HStack>

        {settledDebts.length > 0 ? (
          <VStack
            gap="$2"
            padding="$2.5"
            borderRadius="$3"
            backgroundColor={isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}
            borderWidth={1}
            borderColor={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}>
            <Text variant="caption" color="$textSecondary" weight="semibold">
              Resolved Expenses ({settledDebts.length})
            </Text>

            <VStack gap="$1.5">
              {settledDebts.map((debt, index) => (
                <View
                  key={`${debt.description}-${index}`}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`Resolved debt ${formatCurrency(debt.amount)} for ${debt.description}`}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text variant="caption" color="$color" numberOfLines={1} flex={1}>
                      {debt.description}
                    </Text>
                    <Text
                      variant="caption"
                      color={isDarkMode ? '#4ADE80' : '#16A34A'}
                      weight="semibold">
                      {formatCurrency(debt.amount)}
                    </Text>
                  </HStack>
                </View>
              ))}
            </VStack>
          </VStack>
        ) : null}
      </VStack>
    </GlassSurface>
  );
};
