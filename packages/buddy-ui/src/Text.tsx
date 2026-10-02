import React from 'react';
import {Platform} from 'react-native';
import {Text as TamaguiText, type TextProps as TamaguiTextProps, styled, useTheme} from 'tamagui';
import {resolveThemeColor} from './utils';
import {inferIsDarkMode} from './utils/themeMode';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'label';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';

interface TextExtraProps {
  variant?: TextVariant;
  weight?: TextWeight;
  align?: TextAlign;
  gradient?: boolean;
  gradientColors?: string[];
  glow?: boolean;
  futuristic?: boolean;
}

export interface TextProps extends Omit<TamaguiTextProps, 'variant'>, TextExtraProps {}

const TextFrame = styled(TamaguiText, {
  name: 'BuddyText',
  color: '$color',
  fontFamily: '$body',
  letterSpacing: 0,

  variants: {
    variant: {
      h1: {fontSize: '$9', fontWeight: '700', lineHeight: '$9'},
      h2: {fontSize: '$8', fontWeight: '700', lineHeight: '$8'},
      h3: {fontSize: '$7', fontWeight: '600', lineHeight: '$7'},
      h4: {fontSize: '$6', fontWeight: '600', lineHeight: '$6'},
      h5: {fontSize: '$5', fontWeight: '600', lineHeight: '$5'},
      h6: {fontSize: '$4', fontWeight: '600', lineHeight: '$4'},
      body1: {fontSize: '$4', fontWeight: '400', lineHeight: '$4'},
      body2: {fontSize: '$3', fontWeight: '400', lineHeight: '$3'},
      caption: {fontSize: '$2', fontWeight: '400', lineHeight: '$2'},
      label: {fontSize: '$3', fontWeight: '500', lineHeight: '$3'},
    },
    weight: {
      normal: {fontWeight: '400'},
      medium: {fontWeight: '500'},
      semibold: {fontWeight: '600'},
      bold: {fontWeight: '700'},
    },
    align: {
      left: {textAlign: 'left'},
      center: {textAlign: 'center'},
      right: {textAlign: 'right'},
    },
    futuristic: {
      true: {fontFamily: '$heading'},
      false: {fontFamily: '$body'},
    },
  } as const,

  defaultVariants: {
    variant: 'body1',
    weight: 'normal',
    align: 'left',
    futuristic: false,
  },
});

const futuristicWeight: Record<TextWeight, string> = {
  normal: '300',
  medium: '400',
  semibold: '500',
  bold: '600',
};

export const Text = TextFrame.styleable<TextProps>(
  (
    {
      variant = 'body1',
      color = '$color',
      weight = 'normal',
      align = 'left',
      gradient = false,
      gradientColors,
      glow = false,
      futuristic = false,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const isDarkMode = inferIsDarkMode(theme);
    const contentColor = resolveThemeColor(theme, 'color', isDarkMode ? '#ffffff' : '#111827');
    const secondaryContentColor = resolveThemeColor(
      theme,
      'colorSecondary',
      isDarkMode ? '#e5e7eb' : '#4b5563',
    );
    const textShadow = futuristic
      ? {
          textShadowColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          textShadowOffset: {width: 0, height: 1},
          textShadowRadius: 1,
        }
      : {};
    const glowShadow = glow
      ? {
          textShadowColor: secondaryContentColor,
          textShadowOffset: {width: 0, height: 0},
          textShadowRadius: 4,
        }
      : {};
    const defaultGradientColors = gradientColors ?? [contentColor, secondaryContentColor];
    const resolvedWeight = futuristic ? futuristicWeight[weight] : undefined;

    if (gradient && Platform.OS === 'web') {
      return (
        <TextFrame
          ref={ref}
          variant={variant}
          color={color}
          weight={weight}
          align={align}
          futuristic={futuristic}
          fontWeight={resolvedWeight}
          style={[
            {
              background: `linear-gradient(135deg, ${defaultGradientColors.join(', ')})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              ...textShadow,
              ...glowShadow,
            },
            style,
          ]}
          {...props}>
          {children}
        </TextFrame>
      );
    }

    return (
      <TextFrame
        ref={ref}
        variant={variant}
        color={gradient ? defaultGradientColors[0] : color}
        weight={weight}
        align={align}
        futuristic={futuristic}
        fontWeight={resolvedWeight}
        style={[
          textShadow,
          glowShadow,
          gradient && {
            textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            textShadowOffset: {width: 0, height: 1},
            textShadowRadius: 1,
          },
          style,
        ]}
        {...props}>
        {children}
      </TextFrame>
    );
  },
);

Text.displayName = 'Text';
