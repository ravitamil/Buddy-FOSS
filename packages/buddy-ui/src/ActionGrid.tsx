import React from 'react';
import {XStack, YStack} from 'tamagui';

import {Button, type ButtonProps, type ButtonVariant} from './Button';
import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';

export interface ActionGridItem {
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap | React.ReactElement;
  label: string;
  onPress: () => void;
  tone?: ButtonVariant;
  backgroundColor?: string;
  foregroundColor?: string;
  pressStyle?: ButtonProps['pressStyle'];
}

export interface ActionGridProps {
  primaryActions: readonly [ActionGridItem, ActionGridItem];
  secondaryAction: ActionGridItem;
}

export function ActionGrid({primaryActions, secondaryAction}: ActionGridProps) {
  return (
    <YStack gap="$3">
      <XStack gap="$3">
        {primaryActions.map((action, index) => (
          <ActionButton key={`action-grid-${action.label || index}`} action={action} />
        ))}
      </XStack>
      <ActionButton action={secondaryAction} />
    </YStack>
  );
}

function ActionButton({action}: {action: ActionGridItem}) {
  const foregroundColor = action.foregroundColor ?? 'white';
  const icon = React.isValidElement(action.icon) ? (
    action.icon
  ) : (
    <Ionicons name={action.icon} size={16} color={foregroundColor} />
  );

  return (
    <Button
      flex={1}
      size="medium"
      variant={action.tone ?? 'primary'}
      backgroundColor={action.backgroundColor}
      disabled={action.disabled}
      onPress={action.onPress}
      pressStyle={action.pressStyle}
      leftIcon={icon}>
      <Text color={foregroundColor} weight="medium" fontSize="$3">
        {action.label}
      </Text>
    </Button>
  );
}
