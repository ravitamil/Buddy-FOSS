import React, {useEffect, useRef} from 'react';
import {Animated, type ViewStyle} from 'react-native';
import {YStack, styled, type YStackProps, useTheme} from 'tamagui';

import {resolveThemeColor} from './utils';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  visible?: boolean;
  children?: React.ReactNode;
  style?: YStackProps['style'];
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  visible = true,
  children,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  const theme = useTheme();
  const shimmerColor = resolveThemeColor(theme, 'colorSecondary', '#b3bcb5');
  useEffect(() => {
    if (!visible) return undefined;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 0.85, duration: 650, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 0.45, duration: 650, useNativeDriver: true}),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, visible]);
  if (!visible) return (children ?? null) as React.ReactElement | null;
  return (
    <SkeletonFrame width={width} height={height} borderRadius={borderRadius} style={style}>
      <Animated.View style={[fillStyle, {backgroundColor: shimmerColor, opacity}]} />
    </SkeletonFrame>
  );
}

const SkeletonFrame = styled(YStack, {
  name: 'BuddySkeleton',
  backgroundColor: '$surfacePress',
  overflow: 'hidden',
});
const fillStyle: ViewStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
