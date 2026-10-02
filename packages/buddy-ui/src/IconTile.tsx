import React from 'react';
import {YStack} from 'tamagui';

import {Ionicons} from './icons/AppIcon';
import {Text} from './Text';
import {createAlphaColor} from './theme';

export type IconTileShape = 'circle' | 'rounded';
export type IconTileTone = 'solid' | 'soft';

export interface IconTileProps {
  color: string;
  icon: keyof typeof Ionicons.glyphMap | React.ReactElement;
  badge?: string;
  iconSize?: number;
  shape?: IconTileShape;
  size?: number;
  testID?: string;
  tone?: IconTileTone;
}

export function IconTile({
  badge,
  color,
  icon,
  iconSize = 24,
  shape = 'circle',
  size = 48,
  testID,
  tone = 'solid',
}: IconTileProps) {
  const soft = tone === 'soft';

  return (
    <YStack
      accessible={false}
      testID={testID}
      width={size}
      height={size}
      borderRadius={shape === 'circle' ? size / 2 : '$3'}
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      backgroundColor={soft ? createAlphaColor(color, 0.16) : color}
      borderWidth={soft ? 1 : 0}
      borderColor={soft ? createAlphaColor(color, 0.28) : undefined}
      pointerEvents="none">
      {React.isValidElement(icon) ? (
        icon
      ) : (
        <Ionicons name={icon} size={iconSize} color={soft ? color : 'white'} />
      )}
      {badge ? (
        <YStack
          position="absolute"
          top={-4}
          right={-4}
          width={16}
          height={16}
          borderRadius={8}
          backgroundColor="$error"
          alignItems="center"
          justifyContent="center">
          <Text variant="caption" color="$semanticOnColor" fontSize={10} weight="bold">
            {badge}
          </Text>
        </YStack>
      ) : null}
    </YStack>
  );
}
