type ThemeToken = {
  val?: unknown;
  get?: () => unknown;
};

const getThemeTokenValue = (theme: Record<string, unknown>, key: string): unknown => {
  const token = theme[key];
  if (!token || typeof token !== 'object') return undefined;

  const themeToken = token as ThemeToken;
  return typeof themeToken.get === 'function' ? themeToken.get() : themeToken.val;
};

const resolveTokenAlias = (
  theme: Record<string, unknown>,
  value: unknown,
  visitedKeys: Set<string>,
): string | undefined => {
  if (typeof value !== 'string') return undefined;
  if (!value.startsWith('$')) return value;

  const aliasKey = value.slice(1);
  if (!aliasKey || visitedKeys.has(aliasKey)) return undefined;

  visitedKeys.add(aliasKey);
  return resolveTokenAlias(theme, getThemeTokenValue(theme, aliasKey), visitedKeys);
};

export const resolveThemeColor = (theme: unknown, key: string, fallback: string): string => {
  if (!theme || typeof theme !== 'object') return fallback;

  const themeRecord = theme as Record<string, unknown>;
  return (
    resolveTokenAlias(themeRecord, getThemeTokenValue(themeRecord, key), new Set([key])) ?? fallback
  );
};
