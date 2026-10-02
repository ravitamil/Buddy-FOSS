import {useBuddyColors, createAlphaColor} from '@ravitamil/buddy-ui';
import {HStack, Text, VStack} from '@ravitamil/buddy-ui';
import React from 'react';
import Animated from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {View} from 'tamagui';

import type {SettlementSuggestion} from '@/types';
import type {GroupDetailSettlementProps} from '../GroupDetailSettlementSection';

const getCurrentMemberId = (
  suggestion: SettlementSuggestion,
  props: GroupDetailSettlementProps,
) => {
  const normalizedName = props.currentUserDisplayName.toLowerCase().trim();
  return (
    props.group.members.find((member) => member.supabaseUserId === props.userId)?.id ||
    props.group.members.find((member) => member.name.toLowerCase().trim() === normalizedName)?.id ||
    (suggestion.fromMemberName.toLowerCase().trim() === normalizedName
      ? suggestion.fromMemberId
      : suggestion.toMemberName.toLowerCase().trim() === normalizedName
        ? suggestion.toMemberId
        : undefined)
  );
};

const MemberAvatar = ({
  name,
  isCurrentUser,
  profilePictureUri,
  isDarkMode,
  getInitials,
}: {
  name: string;
  isCurrentUser: boolean;
  profilePictureUri?: string;
  isDarkMode: boolean;
  getInitials: (name: string) => string;
}) => {
  const colors = useBuddyColors();
  return (
    <View
      width={32}
      height={32}
      borderRadius={16}
      padding={1}
      borderWidth={1}
      borderColor={isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'}
      overflow="hidden">
      <View
        flex={1}
        borderRadius={15}
        overflow="hidden"
        justifyContent="center"
        alignItems="center">
        {isCurrentUser && profilePictureUri ? (
          <Animated.Image
            source={{uri: profilePictureUri}}
            style={{width: '100%', height: '100%'}}
          />
        ) : (
          <LinearGradient
            colors={
              isCurrentUser
                ? [
                    createAlphaColor(colors.iconBrand, 0.25),
                    isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                  ]
                : [
                    isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  ]
            }
            style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Text variant="caption" weight="bold" color={isCurrentUser ? '$iconBrand' : '$text'}>
              {getInitials(name)}
            </Text>
          </LinearGradient>
        )}
      </View>
    </View>
  );
};

export const GroupSettlementRow = ({
  suggestion,
  ...props
}: GroupDetailSettlementProps & {suggestion: SettlementSuggestion}) => {
  const currentUserMemberId = getCurrentMemberId(suggestion, props);
  const currentName = props.currentUserDisplayName.toLowerCase().trim();
  const isUserCreditor =
    suggestion.toMemberId === currentUserMemberId ||
    suggestion.toMemberName.toLowerCase().trim() === currentName;
  const isUserDebtor =
    suggestion.fromMemberId === currentUserMemberId ||
    suggestion.fromMemberName.toLowerCase().trim() === currentName;
  const fromMember = props.group.members.find((member) => member.id === suggestion.fromMemberId);
  const isBuddyUser = Boolean(fromMember?.supabaseUserId);

  const amountColor = isUserDebtor ? '$red5' : isUserCreditor ? '$green5' : '$text';
  const actionButtonColor = props.isDarkMode ? '#93C5FD' : '#2563EB';
  const actionButtonStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: props.isDarkMode ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: props.isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.2)',
  };

  const settlePrimaryBg = useBuddyColors().primary;

  return (
    <VStack
      gap="$3"
      padding="$3"
      backgroundColor={props.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
      borderRadius="$3">
      <HStack justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" gap="$3" flex={1}>
          <HStack alignItems="center" gap="$2">
            <MemberAvatar
              name={suggestion.fromMemberName}
              isCurrentUser={isUserDebtor}
              profilePictureUri={props.profilePictureUri}
              isDarkMode={props.isDarkMode}
              getInitials={props.getInitials}
            />
            <Ionicons
              name="arrow-forward-outline"
              size={14}
              color={props.isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.35)'}
            />
            <MemberAvatar
              name={suggestion.toMemberName}
              isCurrentUser={isUserCreditor}
              profilePictureUri={props.profilePictureUri}
              isDarkMode={props.isDarkMode}
              getInitials={props.getInitials}
            />
          </HStack>
          <Text variant="body2" weight="medium" style={{flexShrink: 1}} numberOfLines={1}>
            {isUserDebtor ? 'You owe' : `${suggestion.fromMemberName.split(' ')[0]} owes`}{' '}
            <Text weight="bold">
              {isUserCreditor ? 'You' : suggestion.toMemberName.split(' ')[0]}
            </Text>
          </Text>
        </HStack>
        <Text variant="h5" weight="bold" color={amountColor}>
          {props.formatCurrency(suggestion.amount)}
        </Text>
      </HStack>
      <HStack gap="$2" justifyContent="flex-end" alignItems="center">
        {isUserCreditor ? (
          <HStack
            accessibilityRole="button"
            disabled={props.nudging[suggestion.id]}
            pressStyle={{opacity: 0.8}}
            {...actionButtonStyle}
            onPress={() =>
              isBuddyUser
                ? props.onNudgeSuggestion(suggestion)
                : props.onInviteSuggestion(suggestion)
            }>
            <Ionicons
              name={isBuddyUser ? 'notifications-outline' : 'share-outline'}
              size={14}
              color={actionButtonColor}
              style={{marginRight: 4}}
            />
            <Text variant="caption" weight="bold" color={actionButtonColor}>
              {isBuddyUser && props.nudging[suggestion.id]
                ? '...'
                : isBuddyUser
                  ? 'Nudge'
                  : 'Invite'}
            </Text>
          </HStack>
        ) : null}
        {isUserDebtor || isUserCreditor ? (
          <View
            accessibilityRole="button"
            pressStyle={{opacity: 0.8}}
            backgroundColor={settlePrimaryBg}
            paddingVertical={7}
            paddingHorizontal={16}
            borderRadius={20}
            style={{
              shadowColor: settlePrimaryBg,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => props.onSettleSuggestion(suggestion)}>
            <Text variant="caption" color="$buttonPrimaryText" weight="bold">
              Settle
            </Text>
          </View>
        ) : null}
      </HStack>
    </VStack>
  );
};
