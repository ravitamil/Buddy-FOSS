/**
 * Font Utilities for Tamagui Integration
 *
 * This module provides utilities to ensure consistent font usage across the app
 * that properly integrates with Tamagui's font system and expo-font plugin.
 */

import {Platform, type TextStyle} from 'react-native';
import {getFontFamily as tamaguiFontFamily} from '../utils/fontTest';

/**
 * Font family names that match the actual font files loaded via expo-font plugin
 * These names correspond to the font file names without extensions
 */
export const FONT_FAMILIES = {
  REGULAR: 'SFPRODISPLAYREGULAR',
  MEDIUM: 'SFPRODISPLAYMEDIUM',
  BOLD: 'SFPRODISPLAYBOLD',
} as const;

/**
 * Get the correct font family for a given weight
 * This ensures consistency with Tamagui configuration
 */
export const getFontFamilyForWeight = (weight: string | number = '400'): string => {
  const weightStr = String(weight);

  if (Platform.OS === 'web') {
    // On web, use CSS font-family with fallbacks
    return 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
  }

  // Use the utility from fontTest.ts which maps weights to font families
  return tamaguiFontFamily(weightStr);
};

/**
 * Get font family for specific font weights (convenience functions)
 */
export const getFontFamily = {
  regular: () => getFontFamilyForWeight('400'),
  medium: () => getFontFamilyForWeight('500'),
  bold: () => getFontFamilyForWeight('700'),
};

/**
 * Font style object for React Native TextInput and Text components
 * Use this instead of hardcoding font family names
 */
export const createFontStyle = (
  weight: string | number = '400',
): Pick<TextStyle, 'fontFamily' | 'fontWeight'> => {
  const fontWeight = String(weight) as TextStyle['fontWeight'];

  return {
    fontFamily: getFontFamilyForWeight(weight),
    fontWeight: Platform.select<TextStyle['fontWeight']>({
      ios: fontWeight,
      android: fontWeight,
      default: fontWeight,
    }),
  };
};

/**
 * Predefined font styles for common use cases
 */
export const fontStyles = {
  regular: createFontStyle('400'),
  medium: createFontStyle('500'),
  bold: createFontStyle('700'),
};

/**
 * Check if fonts are properly loaded (for debugging)
 */
export const debugFontLoading = () => {
  appLogger.debug('🔤 Font Debug Info:');
  appLogger.debug('Platform:', Platform.OS);
  appLogger.debug('Regular font:', getFontFamily.regular());
  appLogger.debug('Medium font:', getFontFamily.medium());
  appLogger.debug('Bold font:', getFontFamily.bold());

  return {
    platform: Platform.OS,
    fonts: {
      regular: getFontFamily.regular(),
      medium: getFontFamily.medium(),
      bold: getFontFamily.bold(),
    },
  };
};
