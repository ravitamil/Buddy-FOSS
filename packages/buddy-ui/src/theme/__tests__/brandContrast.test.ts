import {createBuddyUIThemes} from '../createBuddyUIThemes';

const luminance = (hex: string) => {
  const channels = [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrast = (foreground: string, background: string) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

describe('brand and financial color contrast', () => {
  const themes = createBuddyUIThemes();

  it.each(['light', 'dark'] as const)(
    'keeps %s labels readable on their intended surfaces',
    (mode) => {
      const theme = themes[mode];
      for (const background of [theme.background, theme.surface, theme.surfacePress]) {
        for (const foreground of [
          theme.text,
          theme.textSecondary,
          theme.iconBrand,
          theme.income,
          theme.expense,
          theme.savings,
        ]) {
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
      for (const fill of [theme.primary, theme.primaryHover, theme.primaryPress]) {
        expect(contrast(theme.buttonPrimaryText, fill)).toBeGreaterThanOrEqual(4.5);
      }
      for (const fill of [theme.success, theme.warning, theme.error, theme.info]) {
        expect(contrast(theme.semanticOnColor, fill)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
});
