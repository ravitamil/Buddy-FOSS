import {defaultBuddyBrandPalette} from '@ravitamil/buddy-ui';
import React from 'react';
import {Text, mobileControlSizes, resolveThemeColor} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack, useTheme} from 'tamagui';

type ChoiceTone = 'brand' | 'success' | 'error';

interface AddTransactionChoiceProps {
  accessibilityHint: string;
  accessibilityLabel: string;
  emoji?: string;
  flex?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  label: string;
  minWidth?: number;
  onPress: () => void;
  tone?: ChoiceTone;
}

const toneFallback = {
  brand: defaultBuddyBrandPalette.foreground,
  success: '#22c55e',
  error: '#ef4444',
} as const;

export function AddTransactionChoice({
  accessibilityHint,
  accessibilityLabel,
  emoji,
  flex,
  icon,
  isSelected,
  label,
  minWidth,
  onPress,
  tone = 'brand',
}: AddTransactionChoiceProps) {
  const theme = useTheme();
  const iconColor = resolveThemeColor(
    theme,
    tone === 'brand' ? 'iconBrand' : tone,
    toneFallback[tone],
  );

  return (
    <YStack
      accessibilityRole="button"
      accessibilityState={{selected: isSelected}}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      flex={flex}
      minWidth={minWidth}
      minHeight={mobileControlSizes.regular}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$4"
      borderWidth={isSelected ? 2 : 1}
      borderColor={isSelected ? iconColor : '$borderColor'}
      backgroundColor={isSelected ? '$backgroundPress' : '$surface'}
      onPress={onPress}
      pressStyle={{backgroundColor: '$surfacePress', scale: 0.98}}>
      <XStack alignItems="center" justifyContent="center" gap="$2">
        {icon ? <Ionicons name={icon} size={20} color={iconColor} /> : null}
        {emoji ? <Text fontSize={16}>{emoji}</Text> : null}
        <Text color="$color" weight={isSelected ? 'semibold' : 'medium'}>
          {label}
        </Text>
      </XStack>
    </YStack>
  );
}
