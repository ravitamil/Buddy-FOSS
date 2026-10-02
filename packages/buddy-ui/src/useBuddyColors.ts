import {useTheme} from 'tamagui';

import {createBuddyUIThemes} from './theme/createBuddyUIThemes';
import {inferIsDarkMode, resolveThemeColor} from './utils';

const defaults = createBuddyUIThemes();
const roles = [
  'primary',
  'primaryHover',
  'primaryPress',
  'primaryMuted',
  'iconBrand',
  'buttonPrimaryText',
  'semanticOnColor',
  'income',
  'expense',
  'savings',
  'success',
  'warning',
  'error',
  'info',
  'text',
  'textSecondary',
  'textDisabled',
  'surface',
  'surfaceHover',
  'surfacePress',
  'borderColor',
] as const;

type ColorRole = (typeof roles)[number];

/** Resolved active-theme colors for native icons, gradients, and chart APIs. */
export function useBuddyColors(): Record<ColorRole, string> {
  const theme = useTheme();
  const fallback = defaults[inferIsDarkMode(theme) ? 'dark' : 'light'];
  return Object.fromEntries(
    roles.map((role) => [role, resolveThemeColor(theme, role, fallback[role])]),
  ) as Record<ColorRole, string>;
}
