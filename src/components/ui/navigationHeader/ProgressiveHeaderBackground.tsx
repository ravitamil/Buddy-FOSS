import React from 'react';
import {createAlphaColor} from '@ravitamil/buddy-ui';
import {LinearGradient} from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import type {NavigationHeaderModel} from './useNavigationHeaderModel';

const absoluteFillStyle = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const backgroundStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  borderWidth: 0,
  borderColor: 'transparent',
  overflow: 'hidden' as const,
};

const COMPACT_SUBTITLE_SCRIM_EXTENSION = 32;

const getHeaderScrimColors = (backgroundColor: string) =>
  [
    backgroundColor,
    createAlphaColor(backgroundColor, 0.88),
    createAlphaColor(backgroundColor, 0),
  ] as const;

interface ProgressiveHeaderBackgroundProps {
  model: NavigationHeaderModel;
  hasCompactSubtitle: boolean;
}

export function ProgressiveHeaderBackground({
  model,
  hasCompactSubtitle,
}: ProgressiveHeaderBackgroundProps) {
  if (!model.isDynamic) {
    return null;
  }

  const scrimColors = getHeaderScrimColors(model.themeBackgroundColor);
  const scrimHeight =
    model.effectiveHeaderHeight + (hasCompactSubtitle ? COMPACT_SUBTITLE_SCRIM_EXTENSION : 0);

  return (
    <Animated.View
      pointerEvents="none"
      style={[backgroundStyle, {height: scrimHeight, zIndex: 10}, model.headerBackgroundStyle]}>
      <LinearGradient
        colors={scrimColors}
        locations={[0, 0.65, 1]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={absoluteFillStyle}
      />
    </Animated.View>
  );
}
