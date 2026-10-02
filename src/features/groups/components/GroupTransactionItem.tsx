import {createAlphaColor, GlassSurface, Text} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import React, {memo} from 'react';
import {View, XStack, YStack} from 'tamagui';

import {isEmojiCategoryIcon} from '@/features/transactions/components/transactionDetailPresentation';
import {useTamaguiTheme} from '@/context/TamaguiThemeProvider';
import type {GroupDetailTransactionItem} from '../types/groupDetailScreen';

export interface GroupTransactionItemProps extends GroupDetailTransactionItem {
  onPress: () => void;
  formatCurrency: (amount: number) => string;
}

export const GroupTransactionItem = memo(
  ({
    description,
    subtitle,
    netAmount,
    totalAmount,
    impactType,
    impactLabel,
    category,
    isSettlement,
    settlementStatus,
    onPress,
    formatCurrency,
  }: GroupTransactionItemProps) => {
    const {isDarkMode} = useTamaguiTheme();

    const isPositive = impactType === 'lent' || impactType === 'received';
    const isNegative = impactType === 'borrowed' || impactType === 'paid';

    const statusTextColor = isPositive
      ? isDarkMode
        ? '#4ADE80'
        : '#16A34A'
      : isNegative
        ? isDarkMode
          ? '#F87171'
          : '#DC2626'
        : isDarkMode
          ? 'rgba(255, 255, 255, 0.5)'
          : 'rgba(0, 0, 0, 0.45)';

    const amountTextColor = isPositive
      ? isDarkMode
        ? '#4ADE80'
        : '#16A34A'
      : isNegative
        ? isDarkMode
          ? '#F87171'
          : '#DC2626'
        : isDarkMode
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(0, 0, 0, 0.7)';

    const amountPrefix = isPositive ? '+' : isNegative ? '-' : '';
    const displayAmount =
      isPositive || isNegative ? Math.abs(netAmount) : totalAmount > 0 ? totalAmount : 0;

    const badgeColor = isSettlement
      ? isDarkMode
        ? '#34D399'
        : '#059669'
      : category.color || (isDarkMode ? '#38BDF8' : '#0284C7');

    const badgeBg = createAlphaColor(badgeColor, isDarkMode ? 0.16 : 0.1);
    const badgeBorder = createAlphaColor(badgeColor, isDarkMode ? 0.3 : 0.2);

    return (
      <View
        accessibilityRole="button"
        accessibilityLabel={`${description}, ${impactLabel} ${formatCurrency(displayAmount)}`}
        onPress={onPress}
        marginBottom="$2"
        pressStyle={{opacity: 0.85, scale: 0.99}}>
        <GlassSurface padding="$3.5" borderRadius="$4">
          <XStack alignItems="center" gap="$3">
            {/* Category / Settlement Icon Badge */}
            <YStack
              width={42}
              height={42}
              borderRadius={21}
              alignItems="center"
              justifyContent="center"
              backgroundColor={badgeBg}
              borderWidth={1}
              borderColor={badgeBorder}
              flexShrink={0}>
              {isSettlement ? (
                <Ionicons name="swap-horizontal" size={20} color={badgeColor} />
              ) : isEmojiCategoryIcon(category.icon) ? (
                <Text
                  fontSize={20}
                  style={{
                    lineHeight: 22,
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
                      : 'receipt-outline'
                  }
                  size={20}
                  color={badgeColor}
                />
              )}
            </YStack>

            {/* Description & Subtitle */}
            <YStack flex={1} gap="$1" minWidth={0}>
              <Text color="$color" weight="semibold" variant="body1" numberOfLines={1}>
                {description}
              </Text>
              <Text color="$colorSubtitle" variant="caption" numberOfLines={1}>
                {subtitle}
              </Text>
            </YStack>

            {/* Role / Net Financial Position */}
            <YStack alignItems="flex-end" gap="$0.5" flexShrink={0}>
              <Text variant="caption" weight="medium" style={{color: statusTextColor}}>
                {impactLabel}
              </Text>
              <Text weight="bold" variant="body1" style={{color: amountTextColor}}>
                {amountPrefix}
                {formatCurrency(displayAmount)}
              </Text>

              {settlementStatus === 'settled' && !isSettlement && (
                <XStack alignItems="center" gap="$1" marginTop={2}>
                  <Ionicons
                    name="checkmark-circle"
                    size={11}
                    color={isDarkMode ? '#4ADE80' : '#16A34A'}
                  />
                  <Text variant="caption" fontSize={10} color={isDarkMode ? '#4ADE80' : '#16A34A'}>
                    Settled
                  </Text>
                </XStack>
              )}
              {settlementStatus === 'partial' && (
                <XStack alignItems="center" gap="$1" marginTop={2}>
                  <Ionicons name="time" size={11} color={isDarkMode ? '#FBBF24' : '#D97706'} />
                  <Text variant="caption" fontSize={10} color={isDarkMode ? '#FBBF24' : '#D97706'}>
                    Partial
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
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.netAmount === nextProps.netAmount &&
    prevProps.totalAmount === nextProps.totalAmount &&
    prevProps.impactType === nextProps.impactType &&
    prevProps.impactLabel === nextProps.impactLabel &&
    prevProps.date === nextProps.date &&
    prevProps.category.name === nextProps.category.name &&
    prevProps.category.icon === nextProps.category.icon &&
    prevProps.category.color === nextProps.category.color &&
    prevProps.isSettlement === nextProps.isSettlement &&
    prevProps.settlementStatus === nextProps.settlementStatus,
);
