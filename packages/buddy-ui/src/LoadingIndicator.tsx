import React from 'react';
import {Spinner, YStack, type YStackProps} from 'tamagui';

import {Text} from './Text';

export interface LoadingIndicatorProps {
  visible?: boolean;
  size?: 'small' | 'large';
  color?: React.ComponentProps<typeof Spinner>['color'];
  label?: string;
  accessibilityLabel?: string;
  style?: YStackProps['style'];
}

export function LoadingIndicator({
  visible = true,
  size = 'small',
  color = '$primary',
  label,
  accessibilityLabel,
  style,
}: LoadingIndicatorProps) {
  if (!visible) return null;
  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      gap="$2"
      style={style}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? label ?? 'Loading'}>
      <Spinner size={size} color={color} />
      {label ? (
        <Text variant="body2" color="$textSecondary">
          {label}
        </Text>
      ) : null}
    </YStack>
  );
}
