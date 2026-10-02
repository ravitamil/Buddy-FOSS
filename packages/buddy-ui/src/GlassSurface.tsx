import React from 'react';
import {LinearGradient} from 'expo-linear-gradient';
import {Platform, type ViewStyle} from 'react-native';
import {YStack, type YStackProps, useTheme} from 'tamagui';

import {GlassBackdrop} from './mobile/GlassBackdrop';
import {createAlphaColor} from './theme';
import {inferIsDarkMode, resolveThemeColor} from './utils';

export interface GlassSurfaceProps {
  children: React.ReactNode;
  washColor?: string;
  backgroundAdornment?: React.ReactNode;
  testID?: string;
  height?: number;
  padding?: YStackProps['padding'];
  borderRadius?: YStackProps['borderRadius'];
  fill?: boolean;
  contentStyle?: YStackProps['style'];
  style?: YStackProps['style'];
}

export function GlassSurface({
  children,
  washColor,
  backgroundAdornment,
  testID,
  height,
  padding = 16,
  borderRadius = 20,
  fill = false,
  contentStyle,
  style,
}: GlassSurfaceProps) {
  const theme = useTheme();
  const dark = inferIsDarkMode(theme);
  const fillColor = resolveThemeColor(
    theme,
    'glassSurfaceFill',
    dark ? 'rgba(255, 255, 255, 0.012)' : 'rgba(255, 255, 255, 0.68)',
  );
  const borderColor = resolveThemeColor(
    theme,
    'glassSurfaceBorder',
    dark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(255, 255, 255, 0.90)',
  );
  const gradientColors = [
    resolveThemeColor(
      theme,
      'glassSurfaceStart',
      dark ? 'rgba(255, 255, 255, 0.075)' : 'rgba(255, 255, 255, 0.90)',
    ),
    resolveThemeColor(
      theme,
      'glassSurfaceEnd',
      dark ? 'rgba(255, 255, 255, 0.018)' : 'rgba(255, 255, 255, 0.45)',
    ),
  ] as const;
  const resolvedWashColor = resolveWashColor(theme, washColor);
  const numericRadius = typeof borderRadius === 'number' ? borderRadius : 20;
  const numericPadding = typeof padding === 'number' ? padding : 16;

  return (
    <YStack
      testID={testID}
      flex={fill ? 1 : undefined}
      borderRadius={borderRadius}
      style={[outerFrameStyle(height, dark), style]}>
      <YStack
        flex={fill ? 1 : undefined}
        padding={padding}
        borderRadius={borderRadius}
        style={innerFrameStyle(fillColor, borderColor)}>
        {Platform.OS === 'web' ? null : (
          <GlassBackdrop
            intensity={dark ? 24 : 32}
            blurReductionFactor={2}
            blurMethod={Platform.OS === 'android' ? 'none' : undefined}
            pointerEvents="none"
            style={absoluteLayerStyle}
          />
        )}
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          pointerEvents="none"
          style={absoluteLayerStyle}
        />
        <YStack flex={fill ? 1 : undefined} position="relative" style={contentStyle}>
          {resolvedWashColor ? (
            <LinearGradient
              testID={testID ? `${testID}-wash` : undefined}
              colors={[
                createAlphaColor(resolvedWashColor, 0.14),
                createAlphaColor(resolvedWashColor, 0.086),
                createAlphaColor(resolvedWashColor, 0.051),
              ]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              pointerEvents="none"
              style={washStyle(numericRadius, numericPadding)}
            />
          ) : null}
          {backgroundAdornment ? (
            <YStack pointerEvents="none" position="absolute" right={4} bottom={12} zIndex={0}>
              {backgroundAdornment}
            </YStack>
          ) : null}
          {children}
        </YStack>
      </YStack>
    </YStack>
  );
}

const resolveWashColor = (theme: unknown, color: string | undefined) =>
  color?.startsWith('$') ? resolveThemeColor(theme, color.slice(1), color) : color;

const outerFrameStyle = (height: number | undefined, dark: boolean): ViewStyle => ({
  ...(height ? {height} : {}),
  position: 'relative',
  backgroundColor: dark ? '#100c08' : '#ffffff',
  shadowColor: dark ? '#000000' : '#0F172A',
  shadowOffset: {width: 0, height: dark ? 2 : 4},
  shadowOpacity: dark ? 0.25 : 0.06,
  shadowRadius: dark ? 8 : 12,
  elevation: dark ? 1 : 2,
});

const innerFrameStyle = (backgroundColor: string, borderColor: string): ViewStyle => ({
  backgroundColor,
  borderWidth: 1,
  borderColor,
  overflow: 'hidden',
  position: 'relative',
});

const absoluteLayerStyle: ViewStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const washStyle = (borderRadius: number, padding: number): ViewStyle => ({
  ...absoluteLayerStyle,
  top: 1 - padding,
  right: 1 - padding,
  bottom: 1 - padding,
  left: 1 - padding,
  borderRadius: borderRadius - 1,
  overflow: 'hidden',
});
