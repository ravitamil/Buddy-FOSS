type ThemeToken = {
  val?: unknown;
  get?: () => unknown;
};

const getTokenValue = (token: unknown): string | undefined => {
  if (!token || typeof token !== 'object') {
    return undefined;
  }

  const themeToken = token as ThemeToken;
  const value = typeof themeToken.get === 'function' ? themeToken.get() : themeToken.val;

  return typeof value === 'string' ? value : undefined;
};

const hexToLuminance = (hexColor: string): number | undefined => {
  const normalized = hexColor.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return undefined;
  }

  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

export const inferIsDarkMode = (theme: unknown): boolean => {
  if (!theme || typeof theme !== 'object') {
    return true;
  }

  const background = getTokenValue((theme as Record<string, unknown>).background);
  if (!background) {
    return true;
  }

  if (background.startsWith('#')) {
    const luminance = hexToLuminance(background);
    return luminance === undefined ? true : luminance < 128;
  }

  if (background.startsWith('rgb')) {
    const [red, green, blue] = background.match(/\d+/g)?.map(Number) ?? [];
    if (red === undefined || green === undefined || blue === undefined) {
      return true;
    }

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue < 128;
  }

  return true;
};
