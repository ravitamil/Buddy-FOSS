import {
  defaultBuddyBrandPalette,
  defaultBuddySemanticPalette,
  type BuddyBrandPalette,
  type BuddySemanticPalette,
} from './foundations';

export interface BuddySurfacePalette {
  background: string;
  backgroundHover: string;
  backgroundPress: string;
  surface: string;
  surfaceHover: string;
  surfacePress: string;
  content: string;
  contentSecondary: string;
  contentDisabled: string;
  border: string;
  borderHover: string;
  shadow: string;
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  sheetBackground: string;
}

export interface BuddyGlassPalette {
  start: string;
  end: string;
  fill: string;
  border: string;
}

export interface BuddyThemeModeOverrides {
  light?: Partial<BuddySurfacePalette>;
  dark?: Partial<BuddySurfacePalette>;
}

export interface BuddySemanticOverrides {
  light?: Partial<BuddySemanticPalette>;
  dark?: Partial<BuddySemanticPalette>;
}

export interface BuddyGlassOverrides {
  light?: Partial<BuddyGlassPalette>;
  dark?: Partial<BuddyGlassPalette>;
}

export interface BuddyUIThemeOptions {
  brand?: Partial<BuddyBrandPalette>;
  palette?: BuddyThemeModeOverrides;
  semantic?: BuddySemanticOverrides;
  glass?: BuddyGlassOverrides;
}

const lightSurfacePalette: BuddySurfacePalette = {
  background: '#f5f4f0',
  backgroundHover: '#eeede7',
  backgroundPress: '#e6e4dc',
  surface: '#ffffff',
  surfaceHover: '#f3f2ed',
  surfacePress: '#e9e7df',
  content: '#262923',
  contentSecondary: '#5f6359',
  contentDisabled: '#93978b',
  border: '#dedfd5',
  borderHover: '#bfc2b5',
  shadow: '#262923',
  inputBackground: '#ffffff',
  inputBorder: '#8a8f81',
  inputPlaceholder: '#6c7165',
  sheetBackground: 'rgba(255, 255, 255, 0.98)',
};

const darkSurfacePalette: BuddySurfacePalette = {
  background: '#100c08',
  backgroundHover: '#1a1612',
  backgroundPress: '#241f19',
  surface: '#1b1713',
  surfaceHover: '#241f19',
  surfacePress: '#302a22',
  content: '#f7f4ec',
  contentSecondary: '#aba394',
  contentDisabled: '#756d60',
  border: '#332c22',
  borderHover: '#473e30',
  shadow: '#000000',
  inputBackground: '#1b1713',
  inputBorder: '#473e30',
  inputPlaceholder: '#756d60',
  sheetBackground: '#100c08',
};

const lightGlassPalette: BuddyGlassPalette = {
  start: 'rgba(255, 255, 255, 0.90)',
  end: 'rgba(255, 255, 255, 0.45)',
  fill: 'rgba(255, 255, 255, 0.68)',
  border: 'rgba(255, 255, 255, 0.90)',
};

const darkGlassPalette: BuddyGlassPalette = {
  start: 'rgba(255, 255, 255, 0.075)',
  end: 'rgba(255, 255, 255, 0.018)',
  fill: 'rgba(255, 255, 255, 0.012)',
  border: 'rgba(255, 255, 255, 0.38)',
};

const darkSemanticPalette: BuddySemanticPalette = {
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
};

const createTheme = ({
  brand,
  surface,
  glass,
  semantic,
  isDark = false,
}: {
  brand: BuddyBrandPalette;
  surface: BuddySurfacePalette;
  glass: BuddyGlassPalette;
  semantic: BuddySemanticPalette;
  isDark?: boolean;
}) => ({
  background: surface.background,
  backgroundHover: surface.backgroundHover,
  backgroundPress: surface.backgroundPress,
  surface: surface.surface,
  surfaceHover: surface.surfaceHover,
  surfacePress: surface.surfacePress,
  glassSurfaceStart: glass.start,
  glassSurfaceEnd: glass.end,
  glassSurfaceFill: glass.fill,
  glassSurfaceBorder: glass.border,
  sheetBackground: surface.sheetBackground,
  color: surface.content,
  colorSecondary: surface.contentSecondary,
  text: surface.content,
  textSecondary: surface.contentSecondary,
  textDisabled: surface.contentDisabled,
  borderColor: surface.border,
  borderColorHover: surface.borderHover,
  shadowColor: surface.shadow,
  inputBackground: surface.inputBackground,
  inputBorder: surface.inputBorder,
  inputPlaceholder: surface.inputPlaceholder,
  inputFocusBorder: isDark ? brand.darkForeground : brand.foreground,
  inputFocusShadow: isDark ? brand.darkForeground : brand.foreground,
  primary: brand.primary,
  primaryHover: brand.primaryHover,
  primaryPress: brand.primaryPress,
  primaryMuted: isDark ? brand.darkMuted : brand.primaryMuted,
  primaryFocus: brand.primaryHover,
  buttonPrimary: brand.primary,
  buttonPrimaryHover: brand.primaryHover,
  buttonPrimaryPress: brand.primaryPress,
  iconBrand: isDark ? brand.darkForeground : brand.foreground,
  tabActive: isDark ? brand.darkForeground : brand.foreground,
  homeAnalyseAction: brand.primary,
  iconOnPrimary: brand.onPrimary,
  semanticOnColor: isDark ? '#100c08' : '#ffffff',
  income: isDark ? '#4ade80' : '#216b46',
  expense: isDark ? '#f87171' : '#b53640',
  savings: isDark ? '#bfa5f5' : '#7050a2',
  buttonPrimaryText: brand.onPrimary,
  buttonSecondaryText: surface.content,
  secondary: surface.backgroundPress,
  secondaryHover: surface.border,
  secondaryPress: surface.borderHover,
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  info: semantic.info,
});

export const createBuddyUIThemes = ({
  brand: brandOverrides,
  palette,
  semantic,
  glass,
}: BuddyUIThemeOptions = {}) => {
  const brand = {...defaultBuddyBrandPalette, ...brandOverrides};
  const lightSurface = {...lightSurfacePalette, ...palette?.light};
  const darkSurface = {...darkSurfacePalette, ...palette?.dark};
  const lightGlass = {...lightGlassPalette, ...glass?.light};
  const darkGlass = {...darkGlassPalette, ...glass?.dark};
  const lightSemantic = {...defaultBuddySemanticPalette, ...semantic?.light};
  const darkSemantic = {...darkSemanticPalette, ...semantic?.dark};

  return {
    light: createTheme({
      brand,
      surface: lightSurface,
      glass: lightGlass,
      semantic: lightSemantic,
    }),
    dark: createTheme({
      brand,
      surface: darkSurface,
      glass: darkGlass,
      semantic: darkSemantic,
      isDark: true,
    }),
  } as const;
};

export type BuddyUIThemes = ReturnType<typeof createBuddyUIThemes>;
