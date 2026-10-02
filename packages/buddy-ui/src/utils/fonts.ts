import {Platform, type TextStyle} from 'react-native';

export const FONT_FAMILIES = {
  REGULAR: 'SFPRODISPLAYREGULAR',
  MEDIUM: 'SFPRODISPLAYMEDIUM',
  BOLD: 'SFPRODISPLAYBOLD',
} as const;

export const getFontFamilyForWeight = (weight: string | number = '400'): string => {
  const weightNumber = Number(weight);

  if (Platform.OS === 'web') {
    return 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
  }

  if (weightNumber >= 700) {
    return FONT_FAMILIES.BOLD;
  }

  if (weightNumber >= 500) {
    return FONT_FAMILIES.MEDIUM;
  }

  return FONT_FAMILIES.REGULAR;
};

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

export const fontStyles = {
  regular: createFontStyle('400'),
  medium: createFontStyle('500'),
  bold: createFontStyle('700'),
};
