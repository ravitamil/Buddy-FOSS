import {createAlphaColor, GlassSurface, Text} from '@ravitamil/buddy-ui';
import React, {memo} from 'react';
import {View, XStack, YStack, useTheme} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';

export interface GroupCardProps {
  id: string;
  name: string;
  members: number;
  totalAmount?: number;
  yourShare: number;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  color: string;
  lastActivityDate?: Date;
  onPress?: () => void;
  onAddExpense?: () => void;
  onMore?: () => void;
  formatCurrency: (amount: number) => string;
}

export const GroupCard = memo(
  ({
    name,
    members,
    icon,
    emoji,
    color,
    onPress,
    onAddExpense,
    formatCurrency,
    yourShare,
  }: GroupCardProps) => {
    const theme = useTheme();

    const isSettled = Math.abs(yourShare) < 0.01;
    const isOwed = yourShare > 0.01;

    const balanceBg = isSettled ? '$badgeSettledBg' : isOwed ? '$badgeSuccessBg' : '$badgeDangerBg';

    const balanceTextColor = isSettled
      ? '$badgeSettledText'
      : isOwed
        ? '$badgeSuccessText'
        : '$badgeDangerText';

    const balanceIconColor = isSettled
      ? String(theme.badgeSettledText?.val ?? '#34D399')
      : isOwed
        ? String(theme.badgeSuccessText?.val ?? '#4ADE80')
        : String(theme.badgeDangerText?.val ?? '#F87171');

    return (
      <GlassSurface
        borderRadius={18}
        padding="$3.5"
        washColor={
          isSettled ? undefined : isOwed ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.04)'
        }>
        <XStack alignItems="center" gap="$3">
          {/* Main clickable area: Avatar + Info */}
          <XStack
            flex={1}
            alignItems="center"
            gap="$3"
            accessibilityRole="button"
            accessibilityLabel={`Open ${name} group`}
            onPress={onPress}
            pressStyle={{scale: 0.98, opacity: 0.95}}
            transition="quick">
            {/* Avatar / Icon */}
            <View
              width={46}
              height={46}
              borderRadius={14}
              overflow="hidden"
              borderWidth={1}
              borderColor={color ? createAlphaColor(color, 0.25) : 'transparent'}>
              <LinearGradient
                colors={[
                  color && typeof color === 'string' && color.trim() ? color.trim() : '#4ECDC4',
                  createAlphaColor(
                    color && typeof color === 'string' && color.trim() ? color.trim() : '#4ECDC4',
                    0.8,
                  ),
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {emoji ? (
                  <Text
                    style={{
                      fontSize: 22,
                      textAlign: 'center',
                      lineHeight: 26,
                      includeFontPadding: false,
                    }}>
                    {emoji}
                  </Text>
                ) : (
                  <Ionicons
                    name={icon || 'people'}
                    size={22}
                    color="white"
                    style={{
                      textShadowColor: 'rgba(0, 0, 0, 0.25)',
                      textShadowOffset: {width: 0, height: 1},
                      textShadowRadius: 2,
                    }}
                  />
                )}
              </LinearGradient>
            </View>

            {/* Info & Meta */}
            <YStack flex={1} gap="$1.5" justifyContent="center">
              <XStack alignItems="center" justifyContent="space-between" gap="$2">
                <Text
                  color="$text"
                  weight="bold"
                  variant="body1"
                  fontSize={16}
                  numberOfLines={1}
                  style={{flexShrink: 1}}>
                  {name}
                </Text>
              </XStack>

              {/* Badges / Subtitle row */}
              <XStack alignItems="center" gap="$2" flexWrap="wrap">
                {/* Member count pill */}
                <XStack
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  borderRadius="$6"
                  backgroundColor="$badgeNeutralBg">
                  <Ionicons
                    name="people-outline"
                    size={11}
                    color={String(
                      theme.iconSecondary?.val ?? theme.textSecondary?.val ?? '#9CA3AF',
                    )}
                  />
                  <Text color="$textSecondary" variant="caption" weight="medium" fontSize={11}>
                    {members} {members === 1 ? 'member' : 'members'}
                  </Text>
                </XStack>

                {/* Balance status pill */}
                <XStack
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  borderRadius="$6"
                  backgroundColor={balanceBg}>
                  <Ionicons
                    name={
                      isSettled
                        ? 'checkmark-circle-outline'
                        : isOwed
                          ? 'arrow-down-circle-outline'
                          : 'arrow-up-circle-outline'
                    }
                    size={11}
                    color={balanceIconColor}
                  />
                  <Text variant="caption" weight="bold" fontSize={11} color={balanceTextColor}>
                    {isSettled
                      ? 'Settled up'
                      : isOwed
                        ? `+${formatCurrency(yourShare)}`
                        : `-${formatCurrency(Math.abs(yourShare))}`}
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </XStack>

          {/* Quick Add Expense Action - separate touch target */}
          {onAddExpense && (
            <View
              accessibilityRole="button"
              accessibilityLabel={`Add expense to ${name}`}
              onPress={onAddExpense}
              pressStyle={{scale: 0.9, opacity: 0.75}}
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor="$actionBlueBg"
              borderWidth={1}
              borderColor="$actionBlueBorder"
              justifyContent="center"
              alignItems="center">
              <Ionicons
                name="add"
                size={20}
                color={String(theme.actionBlueIcon?.val ?? theme.accentBlue?.val ?? '#2563EB')}
              />
            </View>
          )}
        </XStack>
      </GlassSurface>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to optimize re-renders
    return (
      prevProps.id === nextProps.id &&
      prevProps.name === nextProps.name &&
      prevProps.members === nextProps.members &&
      prevProps.totalAmount === nextProps.totalAmount &&
      prevProps.icon === nextProps.icon &&
      prevProps.emoji === nextProps.emoji &&
      prevProps.color === nextProps.color &&
      prevProps.yourShare === nextProps.yourShare &&
      prevProps.onAddExpense === nextProps.onAddExpense
    );
  },
);
