import {createAlphaColor, GlassSurface, Text} from '@ravitamil/buddy-ui';
import React, {memo} from 'react';
import {View, XStack, YStack, useTheme} from 'tamagui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {LinearGradient} from 'expo-linear-gradient';
import {isEmojiCategoryIcon} from './transactionDetailPresentation';

export interface TransactionItemProps {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: {
    name: string;
    icon: string;
    color: string;
  };
  groupName?: string | null;
  onPress: () => void;
  formatCurrency: (amount: number) => string;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  groupEmoji?: string;
  settlementStatus?: 'settled' | 'unsettled' | 'partial';
}

const getFrequencyLabel = (frequency?: string) => {
  if (!frequency) return 'Repeat';
  const f = frequency.toLowerCase();
  if (f === 'daily') return 'Daily';
  if (f === 'weekly') return 'Weekly';
  if (f === 'monthly') return 'Monthly';
  if (f === 'yearly') return 'Yearly';
  return 'Recurring';
};

export const TransactionItem = memo(
  ({
    description,
    amount,
    date,
    type,
    category,
    groupName,
    onPress,
    formatCurrency,
    isRecurring,
    recurrenceFrequency,
    groupEmoji,
    settlementStatus,
  }: TransactionItemProps) => {
    const theme = useTheme();
    const isIncome = type === 'income' || amount > 0;
    const isExpense = type === 'expense' || amount < 0;

    const isSettlement = category.name === 'Settlement';
    const rawCategoryColor = category.color?.trim();
    const resolvedTokenColor =
      rawCategoryColor && rawCategoryColor.startsWith('$')
        ? String(theme[rawCategoryColor.slice(1) as keyof typeof theme]?.val ?? '')
        : undefined;
    const categoryColor =
      (resolvedTokenColor && !resolvedTokenColor.startsWith('$')
        ? resolvedTokenColor
        : undefined) ??
      (rawCategoryColor && !rawCategoryColor.startsWith('$') ? rawCategoryColor : undefined) ??
      (isIncome ? '#10B981' : '#F43F5E');

    const settlementBg =
      settlementStatus === 'settled'
        ? '$badgeSettledBg'
        : settlementStatus === 'partial'
          ? '$badgeWarningBg'
          : '$badgeDangerBg';

    const settlementTextColor =
      settlementStatus === 'settled'
        ? '$badgeSettledText'
        : settlementStatus === 'partial'
          ? '$badgeWarningText'
          : '$badgeDangerText';

    const settlementIcon =
      settlementStatus === 'settled'
        ? 'checkmark-circle'
        : settlementStatus === 'partial'
          ? 'time'
          : 'alert-circle';

    return (
      <View
        accessibilityRole="button"
        accessibilityLabel={`Open ${description} transaction, ${formatCurrency(Math.abs(amount))}`}
        onPress={onPress}
        marginBottom="$2.5"
        pressStyle={{scale: 0.98, opacity: 0.92}}>
        <GlassSurface
          borderRadius={18}
          padding="$3.5"
          washColor={
            isIncome ? 'rgba(34, 197, 94, 0.04)' : isExpense ? 'rgba(239, 68, 68, 0.04)' : undefined
          }>
          <XStack alignItems="center" gap="$3">
            {/* Squircle Avatar with Category Color Gradient */}
            <View
              width={44}
              height={44}
              borderRadius={13}
              overflow="hidden"
              borderWidth={1}
              borderColor={createAlphaColor(categoryColor, 0.25)}
              alignItems="center"
              justifyContent="center">
              <LinearGradient
                colors={[categoryColor, createAlphaColor(categoryColor, 0.75)]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {isSettlement ? (
                  <Ionicons name="swap-horizontal" size={22} color="#FFFFFF" />
                ) : isEmojiCategoryIcon(category.icon) ? (
                  <Text
                    fontSize={20}
                    style={{
                      lineHeight: 24,
                      textAlign: 'center',
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}>
                    {category.icon}
                  </Text>
                ) : (
                  <Ionicons
                    name={
                      category.icon && category.icon in Ionicons.glyphMap
                        ? (category.icon as keyof typeof Ionicons.glyphMap)
                        : isIncome
                          ? 'arrow-down'
                          : 'arrow-up'
                    }
                    size={20}
                    color="#FFFFFF"
                  />
                )}
              </LinearGradient>
            </View>

            {/* Description & Subtitle Metadata */}
            <YStack flex={1} gap="$1" justifyContent="center">
              <Text color="$color" weight="semibold" variant="body1" numberOfLines={1}>
                {description}
              </Text>

              <XStack alignItems="center" gap="$1.5" flexWrap="wrap">
                <Text color="$colorSubtitle" variant="caption">
                  {category.name}
                </Text>

                {groupName && (
                  <>
                    <Text color="$colorSubtitle" variant="caption">
                      •
                    </Text>
                    <XStack
                      alignItems="center"
                      backgroundColor="$surfacePress"
                      borderColor="$borderColor"
                      borderRadius="$3"
                      borderWidth={1}
                      paddingHorizontal="$1.5"
                      paddingVertical={1}>
                      <Text color="$colorSubtitle" variant="caption" weight="medium">
                        {groupEmoji ? `${groupEmoji} ${groupName}` : groupName}
                      </Text>
                    </XStack>
                  </>
                )}

                <Text color="$colorSubtitle" variant="caption">
                  •
                </Text>

                <Text color="$colorSubtitle" variant="caption">
                  {date}
                </Text>

                {isRecurring && (
                  <XStack
                    alignItems="center"
                    backgroundColor="$surfacePress"
                    paddingHorizontal="$1.5"
                    paddingVertical={1}
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor="$borderColor"
                    gap="$1">
                    <Ionicons
                      name="repeat"
                      size={10}
                      color={String(theme.colorSubtitle?.val ?? '#94A3B8')}
                    />
                    <Text variant="caption" color="$colorSubtitle">
                      {getFrequencyLabel(recurrenceFrequency)}
                    </Text>
                  </XStack>
                )}
              </XStack>
            </YStack>

            {/* Amount & Status Badge */}
            <YStack alignItems="flex-end" gap="$1" justifyContent="center">
              <Text color={isIncome ? '$badgeSuccessText' : '$color'} weight="bold" variant="body1">
                {isIncome ? '+' : isExpense ? '-' : ''}
                {formatCurrency(Math.abs(amount))}
              </Text>

              {settlementStatus && (
                <XStack
                  alignItems="center"
                  backgroundColor={settlementBg}
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  gap="$1"
                  paddingHorizontal="$1.5"
                  paddingVertical={1}>
                  <Ionicons
                    name={settlementIcon}
                    size={11}
                    color={String(
                      settlementStatus === 'settled'
                        ? (theme.badgeSettledText?.val ?? '#34D399')
                        : (theme.badgeDangerText?.val ?? '#F87171'),
                    )}
                  />
                  <Text variant="caption" color={settlementTextColor} weight="medium">
                    {settlementStatus.charAt(0).toUpperCase() + settlementStatus.slice(1)}
                  </Text>
                </XStack>
              )}
            </YStack>
          </XStack>
        </GlassSurface>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.description === nextProps.description &&
    prevProps.amount === nextProps.amount &&
    prevProps.date === nextProps.date &&
    prevProps.type === nextProps.type &&
    prevProps.category.name === nextProps.category.name &&
    prevProps.category.icon === nextProps.category.icon &&
    prevProps.category.color === nextProps.category.color &&
    prevProps.groupName === nextProps.groupName &&
    prevProps.isRecurring === nextProps.isRecurring &&
    prevProps.recurrenceFrequency === nextProps.recurrenceFrequency &&
    prevProps.groupEmoji === nextProps.groupEmoji &&
    prevProps.settlementStatus === nextProps.settlementStatus &&
    prevProps.formatCurrency === nextProps.formatCurrency,
);
