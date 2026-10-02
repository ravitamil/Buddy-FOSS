import {animations as cssAnimations} from '@tamagui/config/v5-css';
/* eslint-disable development-quality/enforce-tamagui-usage -- this file defines the design tokens */
import {defaultConfig} from '@tamagui/config/v5';
import {animations as reanimatedAnimations} from '@tamagui/config/v5-reanimated';
import {createFont} from '@tamagui/core';
import {createTamagui, createTokens, isWeb} from 'tamagui';

import {createBuddyUIThemes, type BuddyUIThemeOptions} from '../theme/createBuddyUIThemes';

// SF Pro Display font configuration
// Font family names should match the actual font file names (without extension) when embedded via expo-font plugin
const sfProDisplayFont = createFont({
  family: 'SFPRODISPLAYREGULAR', // Base font family name - matches the font file name without extension
  face: {
    100: {normal: 'SFPRODISPLAYREGULAR'},
    200: {normal: 'SFPRODISPLAYREGULAR'},
    300: {normal: 'SFPRODISPLAYREGULAR'},
    400: {normal: 'SFPRODISPLAYREGULAR'},
    500: {normal: 'SFPRODISPLAYMEDIUM'},
    600: {normal: 'SFPRODISPLAYMEDIUM'},
    700: {normal: 'SFPRODISPLAYBOLD'},
    800: {normal: 'SFPRODISPLAYBOLD'},
    900: {normal: 'SFPRODISPLAYBOLD'},
  },
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 30,
    10: 42,
    11: 52,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 124,
  },
  lineHeight: {
    1: 17,
    2: 18,
    3: 19,
    4: 20,
    5: 22,
    6: 24,
    7: 26,
    8: 28,
    9: 36,
    10: 48,
    11: 58,
    12: 68,
    13: 78,
    14: 98,
    15: 120,
    16: 130,
  },
  weight: {
    1: '100',
    2: '200',
    3: '300',
    4: '400',
    5: '500',
    6: '600',
    7: '700',
    8: '800',
    9: '900',
  },
  letterSpacing: {
    1: 0,
    2: -0.015,
    3: -0.017,
    4: -0.019,
    5: -0.021,
    6: -0.025,
    7: -0.031,
    8: -0.034,
    9: -0.04,
    10: -0.042,
    11: -0.044,
    12: -0.046,
    13: -0.048,
    14: -0.05,
    15: -0.052,
    16: -0.054,
  },
});

// Create safe area tokens that will be dynamically updated
const createSafeAreaTokens = () => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

// Create comprehensive color tokens
const colorTokens = createTokens({
  color: {
    // Blue scale
    blue1: '#eff6ff',
    blue2: '#dbeafe',
    blue3: '#bfdbfe',
    blue4: '#93c5fd',
    blue5: '#60a5fa',
    blue6: '#3b82f6',
    blue7: '#2563eb',
    blue8: '#1d4ed8',
    blue9: '#1e40af',
    blue10: '#100C08', // Smokey Fog Black
    blue11: '#1e40af',
    blue12: '#172554',

    // Gray scale
    gray1: '#f9fafb',
    gray2: '#f3f4f6',
    gray3: '#e5e7eb',
    gray4: '#d1d5db',
    gray5: '#9ca3af',
    gray6: '#6b7280',
    gray7: '#4b5563',
    gray8: '#374151',
    gray9: '#1f2937',
    gray10: '#111827',
    gray11: '#0a0a0a', // Neutral deep gray (was #0f172a)
    gray12: '#100C08', // Smokey Fog Black (was #020617)

    // Red scale
    red1: '#fef2f2',
    red2: '#fee2e2',
    red3: '#fecaca',
    red4: '#fca5a5',
    red5: '#f87171',
    red6: '#ef4444',
    red7: '#dc2626',
    red8: '#b91c1c',
    red9: '#991b1b',
    red10: '#7f1d1d',
    red11: '#7f1d1d',
    red12: '#450a0a',

    // Green scale
    green1: '#f0fdf4',
    green2: '#dcfce7',
    green3: '#bbf7d0',
    green4: '#86efac',
    green5: '#4ade80',
    green6: '#22c55e',
    green7: '#16a34a',
    green8: '#15803d',
    green9: '#166534',
    green10: '#34c759',
    green11: '#30d158',
    green12: '#052e16',

    // Additional colors
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',

    // App-specific color tokens
    // Primary brand colors (Imperial Coin Gold)
    brand1: '#fffdf5',
    brand2: '#fdf8e2',
    brand3: '#faedb8',
    brand4: '#f8e18c',
    brand5: '#f6c31a',
    brand6: '#f7c615',
    brand7: '#dfad1e',
    brand8: '#b88b12',
    brand9: '#996800',
    brand10: '#6e4900',
    brand11: '#452d00',
    brand12: '#1a1303',

    // Neutral colors for buttons and UI
    neutral1: '#f9fafb',
    neutral2: '#f3f4f6',
    neutral3: '#e5e7eb',
    neutral4: '#d1d5db',
    neutral5: '#9ca3af',
    neutral6: '#6b7280',
    neutral7: '#4b5563',
    neutral8: '#374151',
    neutral9: '#1f2937',
    neutral10: '#111827',

    // Semantic colors
    success1: '#f0fdf4',
    success2: '#dcfce7',
    success3: '#bbf7d0',
    success4: '#86efac',
    success5: '#4ade80',
    success6: '#22c55e',
    success7: '#16a34a',
    success8: '#15803d',
    success9: '#166534',

    warning1: '#fffbeb',
    warning2: '#fef3c7',
    warning3: '#fde68a',
    warning4: '#fcd34d',
    warning5: '#fbbf24',
    warning6: '#f59e0b',
    warning7: '#d97706',
    warning8: '#b45309',
    warning9: '#92400e',

    error1: '#fef2f2',
    error2: '#fee2e2',
    error3: '#fecaca',
    error4: '#fca5a5',
    error5: '#f87171',
    error6: '#ef4444',
    error7: '#dc2626',
    error8: '#b91c1c',
    error9: '#991b1b',
  },
});

export type CreateBuddyUIConfigOptions = BuddyUIThemeOptions;

const mergeTheme = <Base extends object, Override extends object>(
  base: Base,
  override: Override,
) => ({
  ...base,
  ...override,
});

export const createBuddyUIConfig = (options: CreateBuddyUIConfigOptions = {}) => {
  const mobileThemes = createBuddyUIThemes(options);

  return createTamagui({
    ...defaultConfig,
    settings: {
      ...defaultConfig.settings,
      styleCompat: 'react-native',
      defaultPosition: 'relative',
      onlyAllowShorthands: false,
    },
    fonts: {
      ...defaultConfig.fonts,
      heading: sfProDisplayFont,
      body: sfProDisplayFont,
    },
    tokens: {
      ...defaultConfig.tokens,
      ...colorTokens,
      safeArea: createSafeAreaTokens(),
    },
    animations: isWeb
      ? cssAnimations
      : {
          ...reanimatedAnimations,
          // Restrained native animation presets for touch feedback and overlays
          bouncy: {
            type: 'spring',
            damping: 10,
            mass: 0.9,
            stiffness: 100,
          },
          lazy: {
            type: 'spring',
            damping: 20,
            stiffness: 60,
          },
          slow: {
            type: 'spring',
            damping: 20,
            stiffness: 60,
          },
          quick: {
            type: 'spring',
            damping: 10,
            mass: 0.9,
            stiffness: 100,
          },
          tooltip: {
            type: 'spring',
            damping: 10,
            mass: 0.9,
            stiffness: 100,
          },
          // Add shimmer animation for skeleton loaders
          shimmer: {
            type: 'timing',
            duration: 1000,
          },
        },
    themes: {
      ...defaultConfig.themes,
      // Base light theme
      light: mergeTheme(
        {
          background: '#fbfcfa',
          backgroundHover: '#f9fafb', // gray1
          backgroundPress: '#f3f4f6', // gray2
          backgroundFocus: '#ffffff',

          surface: '#f9fafb', // gray1
          surfaceHover: '#f3f4f6', // gray2
          surfacePress: '#e5e7eb', // gray3
          surfaceFocus: '#ffffff',

          // Glass surface tokens (Fluid Surface system)
          glassStart: 'rgba(255, 255, 255, 0.12)',
          glassEnd: 'rgba(255, 255, 255, 0.05)',
          glassBorder: 'rgba(255, 255, 255, 0.22)',
          glassMuted: 'rgba(0, 0, 0, 0.02)',
          glassSubtle: 'rgba(0, 0, 0, 0.05)',
          glassStrong: 'rgba(0, 0, 0, 0.1)',
          glassSurfaceStart: 'rgba(255, 255, 255, 0.85)',
          glassSurfaceEnd: 'rgba(235, 238, 242, 0.55)',
          glassSurfaceFill: 'rgba(240, 242, 246, 0.65)',
          glassSurfaceBorder: 'rgba(0, 0, 0, 0.12)',
          sheetBackground: 'rgba(255, 255, 255, 0.98)',

          inputBackground: '#f9fafb', // gray1
          inputBorder: '#e5e7eb', // gray3
          inputBorderFocus: '$brand7',
          inputPlaceholder: '#9ca3af', // gray5 — clear ghost placeholder

          color: '#111827', // gray10
          colorHover: '#374151', // gray8
          colorPress: '#111827',
          colorFocus: '#111827',
          colorTransparent: 'rgba(17, 24, 39, 0.5)',
          colorSecondary: '#4b5563', // gray7
          borderColor: '#e5e7eb', // gray3
          borderColorHover: '#d1d5db', // gray4
          borderColorPress: '#9ca3af', // gray5
          borderColorFocus: '#d1d5db',
          shadowColor: '#000000',
          shadowColorHover: '#000000',
          shadowColorPress: '#000000',
          shadowColorFocus: '#000000',

          // Primary colors
          primaryDisabled: '$neutral4',

          // Button colors

          buttonSecondary: '$neutral2',
          buttonSecondaryHover: '$neutral3',
          buttonSecondaryPress: '$neutral4',
          buttonSecondaryText: '$neutral9',
          buttonSecondaryBorder: '$neutral3',

          // Purple scale
          purple1: '#faf5ff',
          purple2: '#f3e8ff',
          purple3: '#e9d5ff',
          purple4: '#d8b4fe',
          purple5: '#c084fc',
          purple6: '#a855f7',
          purple7: '#9333ea',
          purple8: '#7e22ce',
          purple9: '#6b21a8',

          // Secondary colors
          secondary: '#5856D6',
          secondaryHover: '#4A47C4',
          secondaryPress: '#3D3AB2',
          secondaryFocus: '#4A47C4',

          // Semantic colors
          success: '#22c55e', // green6
          warning: '#f59e0b', // warning6
          error: '#ef4444', // red6
          info: '#3b82f6', // blue6

          // Text colors
          text: '#111827', // gray10
          textSecondary: '#4b5563', // gray7 — 7.5:1 on white
          textTertiary: '#6b7280', // gray6 — 5.3:1 on white
          textDisabled: '#9ca3af', // gray5
          placeholderColor: '#9ca3af', // gray5 — clear ghost placeholder

          // Icon colors
          iconPrimary: '#111827', // gray10 — 17.5:1
          iconSecondary: '#4b5563', // gray7 — 7.5:1
          iconTertiary: '#6b7280', // gray6 — 5.3:1

          // Tab bar colors
          tabInactive: '#64748b', // slate — 4.6:1
          tabBarBackground: '#ffffff',
          tabBarBorder: '#cbd5e1',

          // Accent colors (theme-aware blue)
          accentBlue: '#2563eb', // blue7 — 5.1:1
          accentBlueMuted: '#dbeafe', // blue2
          actionBlueBg: 'rgba(59, 130, 246, 0.08)',
          actionBlueBorder: 'rgba(59, 130, 246, 0.2)',
          actionBlueIcon: '#2563eb',

          // Status & Badge semantic tokens
          badgeSuccessBg: '#DCFCE7',
          badgeSuccessText: '#16A34A',
          badgeDangerBg: '#FEE2E2',
          badgeDangerText: '#DC2626',
          badgeSettledBg: '#D1FAE5',
          badgeSettledText: '#059669',
          badgeNeutralBg: 'rgba(0, 0, 0, 0.04)',
          badgeNeutralText: '#4b5563',

          // Input focus

          // Color scale references
          blue10: colorTokens.color.blue10,
          gray10: colorTokens.color.gray10,
          red10: colorTokens.color.red10,
          green10: colorTokens.color.green10,
          red500: colorTokens.color.red6,
          gray300: colorTokens.color.gray3,
          gray50: colorTokens.color.gray1,
          gray700: colorTokens.color.gray7,
          gray800: colorTokens.color.gray8,
          gray900: colorTokens.color.gray9,
          white: colorTokens.color.white,
        },
        mobileThemes.light,
      ),
      dark: mergeTheme(
        {
          background: '#100C08', // Smokey Fog Black (was Rich Black #020617)
          backgroundHover: '#111827', // gray10
          backgroundPress: '#1f2937', // gray9
          backgroundFocus: '#0f172a', // gray11

          surface: '#111827', // gray10
          surfaceHover: '#1f2937', // gray9
          surfacePress: '#374151', // gray8
          surfaceFocus: '#111827',

          // Glass surface tokens (Fluid Surface system)
          glassStart: 'rgba(255, 255, 255, 0.05)',
          glassEnd: 'rgba(255, 255, 255, 0.01)',
          glassBorder: 'rgba(255, 255, 255, 0.12)',
          glassMuted: 'rgba(255, 255, 255, 0.05)',
          glassSubtle: 'rgba(255, 255, 255, 0.1)',
          glassStrong: 'rgba(255, 255, 255, 0.15)',
          glassSurfaceStart: 'rgba(255, 255, 255, 0.075)',
          glassSurfaceEnd: 'rgba(255, 255, 255, 0.018)',
          glassSurfaceFill: 'rgba(255, 255, 255, 0.012)',
          glassSurfaceBorder: 'rgba(255, 255, 255, 0.38)',
          sheetBackground: '#000000',

          inputBackground: '#111827', // gray10
          inputBorder: '#374151', // gray8
          inputBorderFocus: '$brand4',
          inputPlaceholder: '#6b7280', // gray6 — clear ghost placeholder in dark mode

          color: '#f9fafb', // gray1
          colorHover: '#e5e7eb', // gray3
          colorPress: '#ffffff',
          colorFocus: '#ffffff',
          colorTransparent: 'rgba(249, 250, 251, 0.5)',
          colorSecondary: '#9ca3af', // gray5
          borderColor: '#1f2937', // gray9
          borderColorHover: '#374151', // gray8
          borderColorPress: '#4b5563', // gray7
          borderColorFocus: '#374151',
          shadowColor: '#000000', // Shadows in dark mode are usually black, not white
          shadowColorHover: '#000000',
          shadowColorPress: '#000000',
          shadowColorFocus: '#000000',

          // Primary colors
          primaryDisabled: '$neutral8',

          // Button colors

          buttonSecondary: '$neutral8',
          buttonSecondaryHover: '$neutral7',
          buttonSecondaryPress: '$neutral6',
          buttonSecondaryText: '$neutral1',
          buttonSecondaryBorder: '$neutral7',

          // Purple scale (dark theme variants)
          purple1: '#1a0b2e',
          purple2: '#2d1b4e',
          purple3: '#3d2369',
          purple4: '#4c2b84',
          purple5: '#5a339f',
          purple6: '#683aba',
          purple7: '#7641d5',
          purple8: '#8448f0',
          purple9: '#924fff',

          // Secondary colors
          secondary: '#5E5CE6',
          secondaryHover: '#5856D6',
          secondaryPress: '#4A47C4',
          secondaryFocus: '#5856D6',

          // Semantic colors
          success: '#4ade80', // green5 (lighter for dark mode)
          warning: '#fbbf24', // warning5
          error: '#f87171', // red5
          info: '#60a5fa', // blue5

          // Text colors
          text: '#f9fafb', // gray1
          textSecondary: '#9ca3af', // gray5 — 6.8:1 on dark bg
          textTertiary: '#a1a1aa', // zinc-400 — 5.5:1 on dark bg (up from 4.2:1)
          textDisabled: '#4b5563', // gray7
          placeholderColor: '#6b7280', // gray6 — clear ghost placeholder in dark mode

          // Icon colors
          iconPrimary: '#f9fafb', // gray1 — 18:1
          iconSecondary: '#9ca3af', // gray5 — 6.8:1
          iconTertiary: '#6b7280', // gray6 — 4.2:1 (AA large text)

          // Tab bar colors
          tabInactive: '#9ca3af', // gray5 — 6.8:1
          tabBarBackground: '#16181b', // neutral dark liquid-glass surface
          tabBarBorder: '#4b5563', // clearer light-catching edge

          // Accent colors (theme-aware blue)
          accentBlue: '#60a5fa', // blue5 — 7.2:1
          accentBlueMuted: '#100C08', // Smokey Fog Black (blue10)
          actionBlueBg: 'rgba(59, 130, 246, 0.16)',
          actionBlueBorder: 'rgba(59, 130, 246, 0.3)',
          actionBlueIcon: '#60a5fa',

          // Status & Badge semantic tokens
          badgeSuccessBg: 'rgba(34, 197, 94, 0.16)',
          badgeSuccessText: '#4ADE80',
          badgeDangerBg: 'rgba(239, 68, 68, 0.16)',
          badgeDangerText: '#F87171',
          badgeSettledBg: 'rgba(16, 185, 129, 0.14)',
          badgeSettledText: '#34D399',
          badgeNeutralBg: 'rgba(255, 255, 255, 0.06)',
          badgeNeutralText: '#9ca3af',

          // Input focus

          // Color scale references
          blue10: colorTokens.color.blue10,
          gray10: colorTokens.color.gray10,
          red10: colorTokens.color.red10,
          green10: colorTokens.color.green10,
          red500: colorTokens.color.red6,
          gray300: colorTokens.color.gray7,
          gray50: colorTokens.color.gray9,
          gray700: colorTokens.color.gray3,
          gray800: colorTokens.color.gray2,
          gray900: colorTokens.color.gray1,
          white: colorTokens.color.white,
        },
        mobileThemes.dark,
      ),
    },
    shorthands: {
      ...defaultConfig.shorthands,
      // Add custom shorthands
      jc: 'justifyContent',
      ai: 'alignItems',
      bg: 'backgroundColor',
      br: 'borderRadius',
      bw: 'borderWidth',
      bc: 'borderColor',
      fs: 'fontSize',
      fw: 'fontWeight',
      lh: 'lineHeight',
      ls: 'letterSpacing',
      ta: 'textAlign',
      ff: 'fontFamily',
      w: 'width',
      h: 'height',
      minW: 'minWidth',
      maxW: 'maxWidth',
      minH: 'minHeight',
      maxH: 'maxHeight',
      p: 'padding',
      px: 'paddingHorizontal',
      py: 'paddingVertical',
      pt: 'paddingTop',
      pr: 'paddingRight',
      pb: 'paddingBottom',
      pl: 'paddingLeft',
      m: 'margin',
      mx: 'marginHorizontal',
      my: 'marginVertical',
      mt: 'marginTop',
      mr: 'marginRight',
      mb: 'marginBottom',
      ml: 'marginLeft',
    },
  });
};

export const buddyUIConfig = createBuddyUIConfig();

export type BuddyUIConfig = typeof buddyUIConfig;
