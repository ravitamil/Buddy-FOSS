import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {GlassSurface} from '@ravitamil/buddy-ui';
import React, {useCallback} from 'react';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import {ProfilePicture} from '@/components/ui';
import {useSettings} from '@/context';
import type {MemberBalance} from '@/utils/groupBalanceUtils.optimized';
import {renderOptimization} from '@/utils/performanceUtils';
import {getInitials, formatUserDisplayName} from '@/utils/userUtils';
import type {GroupInsightsDebt} from '../hooks/useGroupInsightsScreen';

interface DisplayNameProps {
  userFirstName?: string;
  getUserDisplayName?: () => string;
}

interface DebtCardProps extends DisplayNameProps {
  debt: GroupInsightsDebt;
  onSettle: () => void;
  isDarkMode: boolean;
}

interface MemberSummaryCardProps extends DisplayNameProps {
  member: MemberBalance;
  avatar?: string;
  onViewDetails: () => void;
  isDarkMode: boolean;
}

const useSafeDisplayName = ({userFirstName, getUserDisplayName}: DisplayNameProps) => {
  return useCallback(
    (name: string): string => {
      try {
        return formatUserDisplayName(name, userFirstName, undefined, getUserDisplayName);
      } catch {
        return name;
      }
    },
    [getUserDisplayName, userFirstName],
  );
};

export const GroupInsightsDebtCard: React.ComponentType<DebtCardProps> =
  renderOptimization.customMemo(
    ({debt, onSettle, isDarkMode, userFirstName, getUserDisplayName}) => {
      const {formatCurrency} = useSettings();
      const getDisplayName = useSafeDisplayName({userFirstName, getUserDisplayName});
      const accentColor = isDarkMode ? '#4ECDC4' : '#22a39e';

      return (
        <GlassSurface style={{marginBottom: 12}} padding={16}>
          <VStack gap="$4">
            <HStack alignItems="center" justifyContent="space-between" gap="$3">
              <HStack alignItems="center" gap="$3" flex={1}>
                <ProfilePicture
                  size={44}
                  imageUri={debt.fromAvatar}
                  initialsText={getInitials(getDisplayName(debt.fromMember.memberName))}
                  editable={false}
                  fallbackVariant="initials"
                  fallbackColors={['#ef4444', '#f87171']}
                />
                <VStack flex={1} minWidth={0}>
                  <Text variant="body2" color="$text" weight="semibold" numberOfLines={1}>
                    {getDisplayName(debt.fromMember.memberName)}
                  </Text>
                  <Text variant="caption" color="$textSecondary">
                    owes
                  </Text>
                </VStack>
              </HStack>

              <VStack alignItems="center" gap="$1">
                <Text variant="h5" color="$text" weight="bold">
                  {formatCurrency(debt.amount)}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={accentColor} />
              </VStack>

              <HStack alignItems="center" gap="$3" flex={1} justifyContent="flex-end">
                <VStack alignItems="flex-end" flex={1} minWidth={0}>
                  <Text
                    variant="body2"
                    color="$text"
                    weight="semibold"
                    textAlign="right"
                    numberOfLines={1}>
                    {getDisplayName(debt.toMember.memberName)}
                  </Text>
                  <Text variant="caption" color="$textSecondary" textAlign="right">
                    receives
                  </Text>
                </VStack>
                <ProfilePicture
                  size={44}
                  imageUri={debt.toAvatar}
                  initialsText={getInitials(getDisplayName(debt.toMember.memberName))}
                  editable={false}
                  fallbackVariant="initials"
                  fallbackColors={['#22c55e', '#4ade80']}
                />
              </HStack>
            </HStack>

            <View
              onPress={onSettle}
              pressStyle={{opacity: 0.75}}
              backgroundColor={isDarkMode ? 'rgba(78, 205, 196, 0.18)' : 'rgba(34, 163, 158, 0.85)'}
              paddingVertical={14}
              borderRadius={14}
              alignItems="center"
              borderWidth={1}
              borderColor={isDarkMode ? 'rgba(78, 205, 196, 0.35)' : 'rgba(34, 163, 158, 0.4)'}
              accessibilityRole="button"
              accessibilityLabel={`Settle ${formatCurrency(debt.amount)} from ${getDisplayName(debt.fromMember.memberName)} to ${getDisplayName(debt.toMember.memberName)}`}>
              <HStack alignItems="center" gap="$2">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={isDarkMode ? '#4ECDC4' : '#fff'}
                />
                <Text variant="body1" color={isDarkMode ? '#4ECDC4' : '#fff'} weight="bold">
                  Mark as Settled
                </Text>
              </HStack>
            </View>
          </VStack>
        </GlassSurface>
      );
    },
    (prevProps, nextProps) =>
      prevProps.debt.amount === nextProps.debt.amount &&
      prevProps.debt.fromMember.memberId === nextProps.debt.fromMember.memberId &&
      prevProps.debt.toMember.memberId === nextProps.debt.toMember.memberId &&
      prevProps.debt.fromAvatar === nextProps.debt.fromAvatar &&
      prevProps.debt.toAvatar === nextProps.debt.toAvatar &&
      prevProps.isDarkMode === nextProps.isDarkMode &&
      prevProps.userFirstName === nextProps.userFirstName,
  );

export const GroupInsightsMemberSummaryCard: React.ComponentType<MemberSummaryCardProps> =
  renderOptimization.customMemo(
    ({member, avatar, onViewDetails, isDarkMode, userFirstName, getUserDisplayName}) => {
      const {formatCurrency} = useSettings();
      const getDisplayName = useSafeDisplayName({userFirstName, getUserDisplayName});
      const balanceColor =
        member.balance > 1
          ? isDarkMode
            ? '$green6'
            : '$green5'
          : member.balance < -1
            ? isDarkMode
              ? '$red6'
              : '$red5'
            : '$textSecondary';
      const balanceIcon =
        member.balance > 1 ? 'trending-up' : member.balance < -1 ? 'trending-down' : 'remove';
      const balanceLabel =
        member.balance > 1 ? 'is owed' : member.balance < -1 ? 'owes' : 'settled';

      return (
        <View
          onPress={onViewDetails}
          pressStyle={{opacity: 0.7}}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${getDisplayName(member.memberName)}`}>
          <GlassSurface style={{marginBottom: 8}} padding={12}>
            <HStack alignItems="center" justifyContent="space-between">
              <HStack alignItems="center" gap="$3" flex={1}>
                <ProfilePicture
                  size={32}
                  imageUri={avatar}
                  initialsText={getInitials(getDisplayName(member.memberName))}
                  editable={false}
                  fallbackVariant="initials"
                  fallbackColors={
                    member.balance > 1
                      ? ['#22c55e', '#4ade80']
                      : member.balance < -1
                        ? ['#ef4444', '#f87171']
                        : ['#8e8e93', '#aeaeb2']
                  }
                />

                <VStack flex={1}>
                  <Text variant="body2" color="$text" weight="medium">
                    {getDisplayName(member.memberName)}
                  </Text>
                  <HStack alignItems="center" gap="$1">
                    <Ionicons name={balanceIcon} size={12} color={balanceColor} />
                    <Text variant="caption" color="$textSecondary">
                      {balanceLabel}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              <VStack alignItems="flex-end">
                <Text variant="body2" color={balanceColor} weight="bold">
                  {formatCurrency(Math.abs(member.balance))}
                </Text>
                <Text variant="caption" color="$textSecondary">
                  {member.percentageOfTotalExpenses.toFixed(0)}% of total
                </Text>
              </VStack>
            </HStack>
          </GlassSurface>
        </View>
      );
    },
    (prevProps, nextProps) =>
      prevProps.member.memberId === nextProps.member.memberId &&
      prevProps.member.balance === nextProps.member.balance &&
      prevProps.member.percentageOfTotalExpenses === nextProps.member.percentageOfTotalExpenses &&
      prevProps.avatar === nextProps.avatar &&
      prevProps.isDarkMode === nextProps.isDarkMode &&
      prevProps.userFirstName === nextProps.userFirstName,
  );
