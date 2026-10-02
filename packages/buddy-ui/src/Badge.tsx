import React from 'react';
import {XStack, styled} from 'tamagui';

import {Text} from './Text';

export interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
  onPress?: () => void;
  testID?: string;
}

export function Badge({label, tone = 'neutral', onPress, testID}: BadgeProps) {
  return (
    <BadgeFrame
      testID={testID}
      badgeTone={tone}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}>
      <Text
        variant="caption"
        weight="bold"
        color={
          tone === 'neutral'
            ? '$text'
            : tone === 'brand'
              ? '$buttonPrimaryText'
              : '$semanticOnColor'
        }>
        {label}
      </Text>
    </BadgeFrame>
  );
}

const BadgeFrame = styled(XStack, {
  name: 'BuddyBadge',
  minHeight: 24,
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$8',
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    badgeTone: {
      neutral: {
        backgroundColor: '$glassSurfaceFill',
        borderWidth: 1,
        borderColor: '$glassSurfaceBorder',
      },
      brand: {backgroundColor: '$primary'},
      success: {backgroundColor: '$success'},
      warning: {backgroundColor: '$warning'},
      error: {backgroundColor: '$error'},
      info: {backgroundColor: '$info'},
    },
  } as const,
});
