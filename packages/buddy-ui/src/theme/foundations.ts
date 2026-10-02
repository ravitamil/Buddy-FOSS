export const mobileSpacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 40,
} as const;

export const mobileRadii = {
  none: 0,
  control: 10,
  card: 16,
  modal: 24,
  pill: 999,
} as const;

export const mobileControlSizes = {
  iosMinimumTouchTarget: 44,
  androidMinimumTouchTarget: 48,
  compact: 40,
  regular: 48,
  large: 56,
  floatingAction: 56,
} as const;

export const mobileIconSizes = {
  inline: 16,
  compact: 20,
  regular: 24,
  emphasis: 32,
} as const;

export const mobileMotion = {
  pressScale: 0.98,
  emphasizedPressScale: 0.96,
  quickDurationMs: 180,
  standardDurationMs: 240,
} as const;

export interface BuddyBrandPalette {
  primary: string;
  primaryHover: string;
  primaryPress: string;
  primaryMuted: string;
  onPrimary: string;
  foreground: string;
  darkForeground: string;
  darkMuted: string;
}

export const defaultBuddyBrandPalette: BuddyBrandPalette = {
  primary: '#f6c31a',
  primaryHover: '#f7c615',
  primaryPress: '#dfad1e',
  primaryMuted: '#fdf6dc',
  onPrimary: '#1a1303',
  foreground: '#805c12',
  darkForeground: '#fad550',
  darkMuted: '#332400',
};

export interface BuddySemanticPalette {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const defaultBuddySemanticPalette: BuddySemanticPalette = {
  success: '#146c35',
  warning: '#9a441c',
  error: '#b91c1c',
  info: '#1d4ed8',
} as const;
