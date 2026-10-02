import tamaguiConfig from '../../tamagui.config';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (isRecord(value) && typeof value.val === 'string') {
    return value.val;
  }

  return undefined;
};

const config = tamaguiConfig as unknown;

export function colorToken(name: string): string {
  const tokens =
    isRecord(config) && isRecord(config.tokens) && isRecord(config.tokens.color)
      ? config.tokens.color
      : {};
  return getStringValue(tokens[name]) ?? getStringValue(tokens[name.replace('$', '')]) ?? name;
}

export function themeColor(name: string, theme: 'light' | 'dark'): string {
  const themes = isRecord(config) && isRecord(config.themes) ? config.themes : {};
  const t = isRecord(themes[theme]) ? themes[theme] : {};
  const key = name.replace('$', '');
  return getStringValue(t[key]) ?? colorToken(key);
}
