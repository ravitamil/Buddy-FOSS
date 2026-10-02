import React from 'react';
import {Dimensions} from 'react-native';
import {View} from '@tamagui/core';
import {LinearGradient} from 'expo-linear-gradient';
import {useTheme} from 'tamagui';
import {
  createDotLayout,
  resolveDottedBackgroundTheme,
  type GradientColors,
} from './dottedBackgroundModel';
import {inferIsDarkMode} from './utils/themeMode';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export interface DottedBackgroundOptions {
  dotSize?: number;
  dotSpacing?: number;
  dotColor?: string;
  gradientColors?: GradientColors;
  gradientStart?: {x: number; y: number};
  gradientEnd?: {x: number; y: number};
}

export interface DottedBackgroundLayerProps extends DottedBackgroundOptions {
  gradientStyle: React.ComponentProps<typeof LinearGradient>['style'];
  dotContainerStyle?: React.ComponentProps<typeof View>['style'];
  dotBorderRadius?: number;
}

export const DottedBackgroundLayer = ({
  dotSize = 2,
  dotSpacing = 20,
  dotColor,
  gradientColors,
  gradientStart = {x: 0, y: 0},
  gradientEnd = {x: 1, y: 1},
  gradientStyle,
  dotContainerStyle,
  dotBorderRadius,
}: DottedBackgroundLayerProps) => {
  const theme = useTheme();
  const isDarkMode = inferIsDarkMode(theme);
  const resolvedTheme = resolveDottedBackgroundTheme(isDarkMode, dotColor, gradientColors);
  const dots = createDotLayout({
    width: screenWidth,
    height: screenHeight,
    dotSize,
    dotSpacing,
  });

  return (
    <LinearGradient
      colors={resolvedTheme.gradientColors}
      start={gradientStart}
      end={gradientEnd}
      style={gradientStyle}>
      <View style={dotContainerStyle}>
        {dots.map((dot) => (
          <View
            key={dot.key}
            style={{
              position: 'absolute',
              left: dot.x,
              top: dot.y,
              width: dotSize,
              height: dotSize,
              backgroundColor: resolvedTheme.dotColor,
              borderRadius: dotBorderRadius ?? dotSize / 2,
            }}
          />
        ))}
      </View>
    </LinearGradient>
  );
};
