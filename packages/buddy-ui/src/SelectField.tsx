import React from 'react';
import {XStack, YStack, styled} from 'tamagui';

import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';

export interface SelectFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  leading?: React.ReactNode;
  compact?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function SelectField({
  label,
  value,
  placeholder,
  onPress,
  leading,
  compact = false,
  disabled = false,
  testID,
}: SelectFieldProps) {
  const displayValue = value || placeholder;

  return (
    <SelectFrame
      testID={testID}
      compact={compact}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={value ? {text: value} : undefined}
      accessibilityState={{disabled}}>
      <XStack alignItems="center" gap="$2" flex={1}>
        {leading}
        <YStack flex={1} gap="$0.5">
          <Text color="$textSecondary" variant="caption" numberOfLines={1}>
            {label}
          </Text>
          {displayValue ? (
            <Text color={value ? '$text' : '$placeholderColor'} weight="medium" numberOfLines={1}>
              {displayValue}
            </Text>
          ) : (
            <Text color="$placeholderColor" weight="medium" numberOfLines={1}>
              --
            </Text>
          )}
        </YStack>
      </XStack>
      <ThemedChevron name="chevron-down" size={18} color="$textSecondary" />
    </SelectFrame>
  );
}

const SelectFrame = styled(XStack, {
  name: 'BuddySelectField',
  minHeight: 56,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
  paddingHorizontal: '$3',
  paddingVertical: '$2.5',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$surface',
  pressStyle: {backgroundColor: '$surfacePress', scale: 0.99},
  disabledStyle: {opacity: 0.5},
  variants: {
    compact: {true: {backgroundColor: 'transparent', borderRadius: '$2', minHeight: 44}, false: {}},
  } as const,
});

const ThemedChevron = styled(Ionicons, {}, {accept: {color: 'color'} as const});
