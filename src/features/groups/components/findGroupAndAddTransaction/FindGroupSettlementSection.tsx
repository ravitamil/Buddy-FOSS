import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';

import type {UseFindGroupAndAddTransactionScreenResult} from '../../hooks/useFindGroupAndAddTransactionScreen';
import {FindGroupGlassCard} from './FindGroupGlassCard';

export const FindGroupSettlementSection = ({
  screen,
}: {
  screen: UseFindGroupAndAddTransactionScreenResult;
}) => {
  const payableMembers =
    screen.selectedGroup?.members.filter((member) => member.id !== screen.paidBy) ?? [];
  return (
    <VStack gap="$2">
      <Text variant="body1" color="$text" weight="semibold">
        Settle To
      </Text>
      <Text variant="caption" color="$textSecondary" marginBottom="$2">
        Select one member you want to settle with
      </Text>
      <FindGroupGlassCard padding={8}>
        <VStack gap="$2">
          {payableMembers.map((member, index) => {
            const debtAmount =
              screen.getMemberDebts().find((debt) => debt.creditorId === member.id)?.amount ?? 0;
            const isSelected = screen.receivedBy.includes(member.id);
            return (
              <HStack
                key={`recipient-${member.id}-${index}`}
                onPress={() => screen.handleRecipientSelection(member.id)}
                pressStyle={{opacity: 0.8}}
                alignItems="center"
                padding="$3"
                borderRadius="$2"
                backgroundColor={
                  isSelected
                    ? screen.isDarkMode
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(34, 197, 94, 0.1)'
                    : screen.isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)'
                }
                borderWidth={1}
                borderColor={
                  isSelected
                    ? screen.isDarkMode
                      ? 'rgba(34, 197, 94, 0.5)'
                      : 'rgba(34, 197, 94, 0.3)'
                    : 'transparent'
                }
                accessibilityRole="checkbox"
                accessibilityState={{checked: isSelected}}
                accessibilityLabel={`${member.name}${debtAmount > 0 ? ` owes ${screen.settingsFormatCurrencyExact(debtAmount)}` : ''}`}
                testID={`recipient-${member.id}`}
                accessibilityActions={[{name: 'activate'}]}
                onAccessibilityAction={({nativeEvent}) => {
                  if (nativeEvent.actionName === 'activate') {
                    screen.handleRecipientSelection(member.id);
                  }
                }}>
                <HStack
                  width={24}
                  height={24}
                  borderRadius="$6"
                  backgroundColor={
                    isSelected
                      ? '#22c55e'
                      : screen.isDarkMode
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(0, 0, 0, 0.1)'
                  }
                  justifyContent="center"
                  alignItems="center"
                  marginRight="$3">
                  {isSelected ? <Ionicons name="checkmark" size={16} color="white" /> : null}
                </HStack>
                <VStack flex={1}>
                  <Text
                    variant="body2"
                    color={isSelected ? '$text' : '$textSecondary'}
                    weight="medium">
                    {member.name}
                  </Text>
                  <Text
                    variant="caption"
                    color={debtAmount > 0 && isSelected ? '$green5' : '$textSecondary'}>
                    {debtAmount > 0
                      ? `${screen.settingsFormatCurrencyExact(debtAmount)} owed`
                      : 'No debt'}
                  </Text>
                </VStack>
              </HStack>
            );
          })}
          {payableMembers.length === 0 ? (
            <Text variant="body2" color="$textSecondary" textAlign="center" padding="$4">
              No members available to settle with
            </Text>
          ) : null}
        </VStack>
      </FindGroupGlassCard>
    </VStack>
  );
};
