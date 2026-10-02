import {useBuddyColors, createAlphaColor} from '@ravitamil/buddy-ui';
import {Button, HStack, Text, VStack} from '@ravitamil/buddy-ui';
import {BottomSheet} from '@ravitamil/buddy-ui/overlays';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React from 'react';
import {Image} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';
import {ScrollView, View} from 'tamagui';

import type {SettlementSuggestion} from '@/types';
import type {EnhancedGroup, EnhancedGroupMember} from '@/features/groups/types';
import type {GroupDetailMemberViewModel, GroupDetailStats} from '../../types/groupDetailScreen';

const MEMBER_PALETTES = [
  {
    bgDark: ['rgba(96, 165, 250, 0.25)', 'rgba(59, 130, 246, 0.1)'] as const,
    bgLight: ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)'] as const,
    textDark: '#93C5FD',
    textLight: '#2563EB',
  },
  {
    bgDark: ['rgba(167, 139, 250, 0.25)', 'rgba(139, 92, 246, 0.1)'] as const,
    bgLight: ['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)'] as const,
    textDark: '#C4B5FD',
    textLight: '#7C3AED',
  },
  {
    bgDark: ['rgba(251, 146, 60, 0.25)', 'rgba(249, 115, 22, 0.1)'] as const,
    bgLight: ['rgba(249, 115, 22, 0.15)', 'rgba(249, 115, 22, 0.05)'] as const,
    textDark: '#FDBA74',
    textLight: '#C2410C',
  },
  {
    bgDark: ['rgba(244, 114, 182, 0.25)', 'rgba(236, 72, 153, 0.1)'] as const,
    bgLight: ['rgba(236, 72, 153, 0.15)', 'rgba(236, 72, 153, 0.05)'] as const,
    textDark: '#F472B6',
    textLight: '#BE185D',
  },
  {
    bgDark: ['rgba(52, 211, 153, 0.25)', 'rgba(16, 185, 129, 0.1)'] as const,
    bgLight: ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)'] as const,
    textDark: '#6EE7B7',
    textLight: '#059669',
  },
  {
    bgDark: ['rgba(251, 191, 36, 0.25)', 'rgba(245, 158, 11, 0.1)'] as const,
    bgLight: ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)'] as const,
    textDark: '#FCD34D',
    textLight: '#B45309',
  },
] as const;

const getMemberPalette = (name: string, isDarkMode: boolean) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % MEMBER_PALETTES.length;
  }
  const entry = MEMBER_PALETTES[hash];
  const gradient = isDarkMode ? entry.bgDark : entry.bgLight;
  return {
    gradient,
    textColor: isDarkMode ? entry.textDark : entry.textLight,
  };
};

export interface GroupMembersBottomSheetProps {
  group: EnhancedGroup;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isDarkMode: boolean;
  userId?: string;
  memberItems: GroupDetailMemberViewModel[];
  stats: GroupDetailStats;
  formatCurrency: (amount: number) => string;
  onAddMember: () => void;
  onSettleSuggestion?: (suggestion: SettlementSuggestion) => void;
  onNudgeSuggestion?: (suggestion: SettlementSuggestion) => void;
  onInviteSuggestion?: (suggestion: SettlementSuggestion) => void;
  getInitials: (name: string) => string;
}

export const GroupMembersBottomSheet: React.FC<GroupMembersBottomSheetProps> = ({
  group,
  isOpen,
  onOpenChange,
  isDarkMode,
  userId,
  memberItems,
  stats,
  formatCurrency,
  onAddMember,
  onSettleSuggestion,
  onNudgeSuggestion,
  onInviteSuggestion,
  getInitials,
}) => {
  const colors = useBuddyColors();
  const brandColor = colors.iconBrand;

  const getSettlementAction = (memberId: string) => {
    const oweSuggestion = stats.settlementSuggestions.find(
      (s) => s.fromMemberId === userId && s.toMemberId === memberId,
    );
    if (oweSuggestion) {
      return {type: 'settle' as const, suggestion: oweSuggestion};
    }

    const owedSuggestion = stats.settlementSuggestions.find(
      (s) => s.fromMemberId === memberId && s.toMemberId === userId,
    );
    if (owedSuggestion) {
      const fromMember = group.members.find((m: EnhancedGroupMember) => m.id === memberId);
      const isRegistered = Boolean(fromMember?.supabaseUserId);
      return {
        type: isRegistered ? ('nudge' as const) : ('invite' as const),
        suggestion: owedSuggestion,
      };
    }

    return null;
  };

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[75]}
      title={`Members (${group.members.length})`}>
      <VStack flex={1} gap="$3" paddingBottom="$4">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 20, gap: 10}}>
          {memberItems.map(({member, avatarUri, isCurrentUser, balance}) => {
            const palette = getMemberPalette(member.name, isDarkMode);
            const action = !isCurrentUser ? getSettlementAction(member.id) : null;
            const isPositive = balance > 0.01;
            const isNegative = balance < -0.01;
            const balanceColor = isPositive
              ? isDarkMode
                ? '#34D399'
                : '#059669'
              : isNegative
                ? isDarkMode
                  ? '#F87171'
                  : '#DC2626'
                : '$textSecondary';

            return (
              <HStack
                key={member.id}
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="$2.5"
                paddingHorizontal="$3"
                borderRadius="$4"
                backgroundColor={isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'}
                borderWidth={1}
                borderColor={
                  isCurrentUser
                    ? createAlphaColor(colors.iconBrand, 0.3)
                    : isDarkMode
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.04)'
                }>
                {/* Left: Avatar + Names */}
                <HStack alignItems="center" gap="$3" flex={1}>
                  <View
                    width={44}
                    height={44}
                    borderRadius={22}
                    overflow="hidden"
                    borderWidth={isCurrentUser ? 1.5 : 0}
                    borderColor={isCurrentUser ? brandColor : 'transparent'}
                    backgroundColor={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    justifyContent="center"
                    alignItems="center">
                    {avatarUri ? (
                      <Image
                        source={{uri: avatarUri}}
                        style={{width: '100%', height: '100%'}}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <LinearGradient
                        colors={
                          isCurrentUser
                            ? [
                                createAlphaColor(colors.iconBrand, 0.35),
                                isDarkMode
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : 'rgba(16, 185, 129, 0.08)',
                              ]
                            : palette.gradient
                        }
                        style={{
                          width: '100%',
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Text
                          variant="body2"
                          weight="bold"
                          color={isCurrentUser ? brandColor : palette.textColor}>
                          {getInitials(member.name)}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>

                  <VStack flex={1} gap="$0.5">
                    <HStack alignItems="center" gap="$1.5">
                      <Text variant="body1" weight="bold" numberOfLines={1}>
                        {member.name}
                      </Text>
                      {isCurrentUser ? (
                        <View
                          paddingHorizontal="$1.5"
                          paddingVertical={1}
                          borderRadius="$2"
                          backgroundColor={createAlphaColor(colors.iconBrand, 0.18)}>
                          <Text fontSize={10} weight="bold" color={colors.iconBrand}>
                            YOU
                          </Text>
                        </View>
                      ) : null}
                    </HStack>
                    <Text variant="caption" color="$textSecondary" numberOfLines={1}>
                      {member.email || member.phone || 'Group member'}
                    </Text>
                  </VStack>
                </HStack>

                {/* Right: Net Balance or Contextual Action */}
                <HStack alignItems="center" gap="$2">
                  <VStack alignItems="flex-end" gap="$0.5">
                    <Text variant="body2" weight="bold" color={balanceColor}>
                      {isPositive
                        ? `+${formatCurrency(balance)}`
                        : isNegative
                          ? `-${formatCurrency(Math.abs(balance))}`
                          : 'Settled'}
                    </Text>
                    <Text variant="caption" color="$textSecondary">
                      {isPositive ? 'gets back' : isNegative ? 'owes' : 'squared up'}
                    </Text>
                  </VStack>

                  {action ? (
                    <Button
                      size="small"
                      backgroundColor={
                        action.type === 'settle'
                          ? colors.primary
                          : isDarkMode
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'rgba(37, 99, 235, 0.1)'
                      }
                      borderWidth={action.type === 'settle' ? 0 : 1}
                      borderColor={
                        action.type === 'settle'
                          ? 'transparent'
                          : isDarkMode
                            ? 'rgba(96, 165, 250, 0.3)'
                            : 'rgba(37, 99, 235, 0.2)'
                      }
                      onPress={() => {
                        onOpenChange(false);
                        if (action.type === 'settle') {
                          onSettleSuggestion?.(action.suggestion);
                        } else if (action.type === 'nudge') {
                          onNudgeSuggestion?.(action.suggestion);
                        } else {
                          onInviteSuggestion?.(action.suggestion);
                        }
                      }}>
                      <Text
                        fontSize={11}
                        weight="bold"
                        color={
                          action.type === 'settle'
                            ? '$buttonPrimaryText'
                            : isDarkMode
                              ? '#93C5FD'
                              : '#2563EB'
                        }>
                        {action.type === 'settle'
                          ? 'Settle'
                          : action.type === 'nudge'
                            ? 'Nudge'
                            : 'Invite'}
                      </Text>
                    </Button>
                  ) : null}
                </HStack>
              </HStack>
            );
          })}
        </ScrollView>

        <Button
          theme="active"
          icon={<Ionicons name="person-add-outline" size={18} color="white" />}
          onPress={() => {
            onOpenChange(false);
            onAddMember();
          }}>
          <Text weight="bold" color="white">
            Add New Member
          </Text>
        </Button>
      </VStack>
    </BottomSheet>
  );
};
