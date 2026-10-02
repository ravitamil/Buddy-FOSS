import React from 'react';
import {Image, YStack, styled} from 'tamagui';

import {Text} from './Text';

export interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  backgroundColor?: string;
  testID?: string;
}

export function Avatar({
  name,
  uri,
  size = 48,
  backgroundColor = '$primaryMuted',
  testID,
}: AvatarProps) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?';
  return (
    <AvatarFrame
      testID={testID}
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor={backgroundColor}>
      {uri ? (
        <Image
          source={{uri}}
          width={size}
          height={size}
          accessibilityLabel={`${name} profile picture`}
        />
      ) : (
        <Text color="$iconBrand" weight="bold" fontSize={Math.max(12, size * 0.34)}>
          {initials}
        </Text>
      )}
    </AvatarFrame>
  );
}

const AvatarFrame = styled(YStack, {
  name: 'BuddyAvatar',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});
