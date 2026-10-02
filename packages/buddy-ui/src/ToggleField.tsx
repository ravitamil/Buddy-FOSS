import React from 'react';
import {XStack, YStack} from 'tamagui';

import {Switch, type SwitchSize, type SwitchTone} from './Switch';
import {Text} from './Text';

export interface ToggleFieldProps {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  leading?: React.ReactNode;
  size?: SwitchSize;
  tone?: SwitchTone;
  testID?: string;
}

export function ToggleField({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  leading,
  size,
  tone,
  testID,
}: ToggleFieldProps) {
  const handleToggle = React.useCallback(() => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  }, [checked, disabled, onCheckedChange]);

  return (
    <XStack
      minHeight={48}
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
      onPress={handleToggle}
      pressStyle={{opacity: 0.85}}>
      {leading}
      <YStack flex={1} gap="$1">
        <Text variant="body1" color="$text" weight="semibold">
          {title}
        </Text>
        {description ? (
          <Text variant="caption" color="$textSecondary">
            {description}
          </Text>
        ) : null}
      </YStack>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        size={size}
        tone={tone}
        accessibilityLabel={title}
        testID={testID}
      />
    </XStack>
  );
}
