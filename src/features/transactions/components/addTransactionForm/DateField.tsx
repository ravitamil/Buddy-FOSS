import React from 'react';
import {mobileControlSizes, Text, useBuddyColors} from '@ravitamil/buddy-ui';
import {Ionicons} from '@ravitamil/buddy-ui/icons/AppIcon';
import {XStack, YStack} from 'tamagui';

interface DateFieldProps {
  label: string;
  value: string;
  onPress: () => void;
  onClear?: () => void;
}

export function DateField({label, value, onPress, onClear}: DateFieldProps) {
  const colors = useBuddyColors();

  return (
    <YStack gap="$2">
      <XStack alignItems="center" justifyContent="space-between" gap="$2">
        <Text variant="body2" color="$color" weight="semibold">
          {label}
        </Text>
        {onClear ? (
          <YStack
            accessibilityRole="button"
            accessibilityLabel="Clear end date"
            accessibilityHint="Removes the recurrence end date"
            minWidth={mobileControlSizes.regular}
            minHeight={mobileControlSizes.regular}
            alignItems="center"
            justifyContent="center"
            onPress={onClear}
            pressStyle={{backgroundColor: '$surfacePress'}}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </YStack>
        ) : null}
      </XStack>
      <XStack
        accessibilityRole="button"
        accessibilityLabel={`Select ${label.toLowerCase()}`}
        accessibilityHint={`Opens the date picker for ${label.toLowerCase()}`}
        minHeight={mobileControlSizes.regular}
        alignItems="center"
        justifyContent="space-between"
        gap="$3"
        paddingHorizontal="$3"
        borderRadius="$3"
        borderWidth={1}
        borderColor="$inputBorder"
        backgroundColor="$inputBackground"
        onPress={onPress}
        pressStyle={{backgroundColor: '$surfacePress'}}>
        <Text color="$color" weight="medium">
          {value}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
      </XStack>
    </YStack>
  );
}
