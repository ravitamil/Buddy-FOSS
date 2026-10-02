/**
 * Font Testing Utilities
 *
 * This module provides utilities to test and verify that custom fonts
 * are properly loaded and working in the application.
 */

import {Platform} from 'react-native';

/**
 * Font configuration that should match the fonts loaded via expo-font
 */
export const FONT_CONFIG = {
  SFPRODISPLAYREGULAR: {
    weight: '400',
    style: 'normal',
    file: 'SFPRODISPLAYREGULAR.otf',
  },
  SFPRODISPLAYMEDIUM: {
    weight: '500',
    style: 'normal',
    file: 'SFPRODISPLAYMEDIUM.otf',
  },
  SFPRODISPLAYBOLD: {
    weight: '700',
    style: 'normal',
    file: 'SFPRODISPLAYBOLD.otf',
  },
} as const;

/**
 * Test if fonts are properly loaded
 * This is mainly for development/debugging purposes
 */
export const testFontLoading = () => {
  appLogger.debug('🔤 Font Loading Test');
  appLogger.debug('Platform:', Platform.OS);
  appLogger.debug('Available fonts:', Object.keys(FONT_CONFIG));

  if (Platform.OS === 'web') {
    appLogger.debug('✅ Web platform: Fonts should load via CSS @font-face');
  } else {
    appLogger.debug('📱 Native platform: Fonts loaded via expo-font');
  }

  return {
    platform: Platform.OS,
    fontsConfigured: Object.keys(FONT_CONFIG).length,
    expectedFonts: Object.keys(FONT_CONFIG),
  };
};

/**
 * Get font family name for Tamagui usage
 */
export const getFontFamily = (weight: string = '400') => {
  const fontMap: Record<string, string> = {
    '100': 'SFPRODISPLAYREGULAR', // Fallback to regular for thin
    '200': 'SFPRODISPLAYREGULAR', // Fallback to regular for ultralight
    '300': 'SFPRODISPLAYREGULAR', // Fallback to regular for light
    '400': 'SFPRODISPLAYREGULAR',
    '500': 'SFPRODISPLAYMEDIUM',
    '600': 'SFPRODISPLAYMEDIUM', // Fallback to medium for semibold
    '700': 'SFPRODISPLAYBOLD',
    '800': 'SFPRODISPLAYBOLD', // Fallback to bold for heavy
    '900': 'SFPRODISPLAYBOLD', // Fallback to bold for black
  };

  return fontMap[weight] || 'SFPRODISPLAYREGULAR';
};
