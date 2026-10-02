import React from 'react';
import {XStack, YStack, styled} from 'tamagui';

import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';

export interface ListItemProps {
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  showChevron?: boolean;
  testID?: string;
}

export function ListItem({
  title,
  description,
  leading,
  trailing,
  onPress,
  disabled = false,
  showChevron = Boolean(onPress),
  testID,
}: ListItemProps) {
  return (
    <ListItemFrame
      testID={testID}
      onPress={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      accessibilityState={{disabled}}>
      {leading}
      <YStack flex={1} gap="$1">
        <Text color="$text" weight="semibold">
          {title}
        </Text>
        {description ? (
          <Text color="$textSecondary" variant="body2">
            {description}
          </Text>
        ) : null}
      </YStack>
      {trailing}
      {showChevron ? (
        <ThemedIonicon name="chevron-forward" size={20} color="$textSecondary" />
      ) : null}
    </ListItemFrame>
  );
}

const ListItemFrame = styled(XStack, {
  name: 'BuddyListItem',
  minHeight: 56,
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$4',
  pressStyle: {backgroundColor: '$surfacePress', scale: 0.99},
  disabledStyle: {opacity: 0.55},
});

const ThemedIonicon = styled(Ionicons, {}, {accept: {color: 'color'} as const});
