/**
 * Design Token Mapping Utility
 *
 * This utility provides a centralized mapping from hardcoded values to Tamagui design tokens.
 * It helps maintain consistency and makes it easier to migrate from hardcoded styles.
 */

import {GetThemeValueForKey} from '@tamagui/core';

// Common hardcoded color mappings to Tamagui tokens
export const colorTokenMap = {
  // Green colors
  '#10b981': '$green6',
  '#dcfce7': '$green2',
  '#22c55e': '$green6',
  '#16a34a': '$green7',
  '#4CAF50': '$green6',
  '#34C759': '$green6',
  '#30d158': '$green6',

  // Blue colors
  '#3b82f6': '$blue6',
  '#2563eb': '$blue7',
  '#1d4ed8': '$blue8',
  '#007AFF': '$blue6',
  '#0A84FF': '$blue6',

  // Red colors
  '#ef4444': '$red6',
  '#dc2626': '$red7',
  '#b91c1c': '$red8',
  '#FF3B30': '$red6',
  '#FF453A': '$red6',
  '#FF6B6B': '$red5',

  // Gray colors
  '#ffffff': '$white',
  '#000000': '$black',
  '#f9fafb': '$gray1',
  '#f3f4f6': '$gray2',
  '#e5e7eb': '$gray3',
  '#d1d5db': '$gray4',
  '#9ca3af': '$gray5',
  '#6b7280': '$gray6',
  '#4b5563': '$gray7',
  '#374151': '$gray8',
  '#1f2937': '$gray9',
  '#111827': '$gray10',
  '#f0f0f0': '$gray2',
  '#e0e0e0': '$gray3',

  // Purple colors
  '#5856D6': '$purple6',
  '#4A47C4': '$purple7',
  '#3D3AB2': '$purple8',

  // Orange/Yellow colors
  '#F59E0B': '$warning6',
  '#FF9500': '$warning6',
  '#FF9F0A': '$warning6',

  // Teal colors
  '#4ECDC4': '$blue5',
  '#44A08D': '$green7',

  // Other colors
  '#2196F3': '$blue6',
  '#EF4444': '$red6',
} as const;

// Spacing token mappings (in pixels to Tamagui space tokens)
export const spacingTokenMap = {
  4: '$1',
  8: '$2',
  12: '$3',
  16: '$4',
  20: '$5',
  24: '$6',
  28: '$7',
  32: '$8',
  40: '$9',
  48: '$10',
  56: '$11',
  64: '$12',
} as const;

// Border radius mappings
export const borderRadiusTokenMap = {
  4: '$1',
  6: '$2',
  8: '$3',
  12: '$4',
  16: '$5',
  20: '$6',
  24: '$7',
  28: '$8',
} as const;

// Font size mappings (in pixels to Tamagui size tokens)
export const fontSizeTokenMap = {
  11: '$1',
  12: '$2',
  13: '$3',
  14: '$4',
  16: '$5',
  18: '$6',
  20: '$7',
  22: '$8',
  30: '$9',
  42: '$10',
} as const;

// Helper functions for token conversion
export const getColorToken = (hardcodedColor: string): string => {
  return colorTokenMap[hardcodedColor as keyof typeof colorTokenMap] || hardcodedColor;
};

export const getSpacingToken = (pixels: number): string => {
  return spacingTokenMap[pixels as keyof typeof spacingTokenMap] || `${pixels}px`;
};

export const getBorderRadiusToken = (pixels: number): string => {
  return borderRadiusTokenMap[pixels as keyof typeof borderRadiusTokenMap] || `${pixels}px`;
};

export const getFontSizeToken = (pixels: number): string => {
  return fontSizeTokenMap[pixels as keyof typeof fontSizeTokenMap] || `${pixels}px`;
};

// Theme-aware color helpers
export const getThemeAwareColor = (
  lightColor: string,
  darkColor: string,
  isDarkMode: boolean,
): string => {
  const color = isDarkMode ? darkColor : lightColor;
  return getColorToken(color);
};

// Common semantic color mappings
export const semanticColors = {
  success: '$green6',
  warning: '$warning6',
  error: '$red6',
  info: '$blue6',
  primary: '$brand7',
  secondary: '$purple6',
} as const;

// Button color mappings
export const buttonColors = {
  primary: {
    background: '$buttonPrimary',
    backgroundHover: '$buttonPrimaryHover',
    backgroundPress: '$buttonPrimaryPress',
    text: '$buttonPrimaryText',
  },
  secondary: {
    background: '$buttonSecondary',
    backgroundHover: '$buttonSecondaryHover',
    backgroundPress: '$buttonSecondaryPress',
    text: '$buttonSecondaryText',
    border: '$buttonSecondaryBorder',
  },
} as const;

// Text color mappings
export const textColors = {
  primary: '$text',
  secondary: '$textSecondary',
  tertiary: '$textTertiary',
  disabled: '$textDisabled',
} as const;

// Icon color mappings
export const iconColors = {
  primary: '$iconPrimary',
  secondary: '$iconSecondary',
  tertiary: '$iconTertiary',
  brand: '$iconBrand',
  onPrimary: '$iconOnPrimary',
} as const;

// Tab bar color mappings
export const tabBarColors = {
  active: '$tabActive',
  inactive: '$tabInactive',
  background: '$tabBarBackground',
  border: '$tabBarBorder',
} as const;

// Accent color mappings
export const accentColors = {
  blue: '$accentBlue',
  blueMuted: '$accentBlueMuted',
} as const;

// Input focus color mappings
export const inputFocusColors = {
  border: '$inputFocusBorder',
  shadow: '$inputFocusShadow',
} as const;
