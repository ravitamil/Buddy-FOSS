import {defaultBuddyBrandPalette, defaultBuddySemanticPalette} from './foundations';

export type SemanticColorStatus = 'success' | 'warning' | 'danger' | 'error' | 'info' | 'primary';
export type SurfaceTone =
  | 'muted'
  | 'subtle'
  | 'strong'
  | 'glassStart'
  | 'glassEnd'
  | 'glassBorder'
  | 'glassSurfaceStart'
  | 'glassSurfaceEnd'
  | 'glassSurfaceFill'
  | 'glassSurfaceBorder';

const semanticTokenByStatus: Record<SemanticColorStatus, string> = {
  success: '$success',
  warning: '$warning',
  danger: '$error',
  error: '$error',
  info: '$info',
  primary: '$primary',
};

const semanticHexByStatus: Record<SemanticColorStatus, string> = {
  success: defaultBuddySemanticPalette.success,
  warning: defaultBuddySemanticPalette.warning,
  danger: defaultBuddySemanticPalette.error,
  error: defaultBuddySemanticPalette.error,
  info: defaultBuddySemanticPalette.info,
  primary: defaultBuddyBrandPalette.foreground,
};

const surfaceColors: Record<SurfaceTone, {dark: string; light: string}> = {
  muted: {
    dark: 'rgba(255, 255, 255, 0.05)',
    light: 'rgba(0, 0, 0, 0.02)',
  },
  subtle: {
    dark: 'rgba(255, 255, 255, 0.1)',
    light: 'rgba(0, 0, 0, 0.05)',
  },
  strong: {
    dark: 'rgba(255, 255, 255, 0.15)',
    light: 'rgba(0, 0, 0, 0.1)',
  },
  glassStart: {
    dark: 'rgba(255, 255, 255, 0.05)',
    light: 'rgba(255, 255, 255, 0.12)',
  },
  glassEnd: {
    dark: 'rgba(255, 255, 255, 0.01)',
    light: 'rgba(255, 255, 255, 0.05)',
  },
  glassBorder: {
    dark: 'rgba(255, 255, 255, 0.12)',
    light: 'rgba(255, 255, 255, 0.22)',
  },
  glassSurfaceStart: {
    dark: 'rgba(255, 255, 255, 0.075)',
    light: 'rgba(255, 255, 255, 0.90)',
  },
  glassSurfaceEnd: {
    dark: 'rgba(255, 255, 255, 0.018)',
    light: 'rgba(255, 255, 255, 0.45)',
  },
  glassSurfaceFill: {
    dark: 'rgba(255, 255, 255, 0.012)',
    light: 'rgba(255, 255, 255, 0.68)',
  },
  glassSurfaceBorder: {
    dark: 'rgba(255, 255, 255, 0.38)',
    light: 'rgba(255, 255, 255, 0.90)',
  },
};

export const semanticColorToken = (status: SemanticColorStatus): string =>
  semanticTokenByStatus[status];

export const semanticHexColor = (status: SemanticColorStatus): string =>
  semanticHexByStatus[status];

export const themedSurfaceColor = (isDarkMode: boolean, tone: SurfaceTone): string =>
  isDarkMode ? surfaceColors[tone].dark : surfaceColors[tone].light;

export const createAlphaColor = (color: string, alpha: number): string => {
  if (!color || typeof color !== 'string') {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const trimmed = color.trim();

  // If already rgb/rgba
  const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }

  // If hex
  let hex = trimmed.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((part) => `${part}${part}`)
      .join('');
  }

  if (hex.length === 6 || hex.length === 8) {
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);

    if (!Number.isNaN(red) && !Number.isNaN(green) && !Number.isNaN(blue)) {
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
  }

  return `rgba(0, 0, 0, ${alpha})`;
};
