import React from 'react';
import {YStack} from 'tamagui';

import {IconTile} from './IconTile';
import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';

export interface EmptyStateProps {
  description: string;
  icon: keyof typeof Ionicons.glyphMap | React.ReactElement;
  iconColor: string;
  iconAccessibilityLabel?: string;
  maxTextWidth?: number;
  onIconPress?: () => void;
  title: string;
  action?: React.ReactNode;
}

export function EmptyState({
  description,
  icon,
  iconAccessibilityLabel,
  iconColor,
  maxTextWidth = 260,
  onIconPress,
  title,
  action,
}: EmptyStateProps) {
  return (
    <YStack alignItems="center" gap="$3">
      <YStack
        accessible={Boolean(onIconPress)}
        accessibilityRole={onIconPress ? 'button' : undefined}
        accessibilityLabel={onIconPress ? iconAccessibilityLabel : undefined}
        onPress={onIconPress}
        pressStyle={onIconPress ? {opacity: 0.7} : undefined}
        width={80}
        height={80}
        alignItems="center"
        justifyContent="center">
        <IconTile icon={icon} color={iconColor} size={80} iconSize={36} tone="soft" />
      </YStack>
      <YStack alignItems="center" gap="$2" maxWidth={maxTextWidth}>
        <Text variant="h4" color="$text" weight="bold" textAlign="center">
          {title}
        </Text>
        <Text variant="body1" color="$textSecondary" textAlign="center" lineHeight={22}>
          {description}
        </Text>
      </YStack>
      {action}
    </YStack>
  );
}
