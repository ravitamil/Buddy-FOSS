import AsyncStorage from '@react-native-async-storage/async-storage';

export function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function readStoredArray<T>(
  storageKey: string,
  parser: (value: unknown) => T[],
): Promise<T[]> {
  const stored = await AsyncStorage.getItem(storageKey);
  return stored ? parser(parseJson(stored)) : [];
}

export async function appendStoredItem<T>(
  storageKey: string,
  item: T,
  parser: (value: unknown) => T[],
): Promise<void> {
  const existing = await readStoredArray(storageKey, parser);
  existing.push(item);
  await AsyncStorage.setItem(storageKey, JSON.stringify(existing));
}

export async function replaceStoredArray<T>(storageKey: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(storageKey, JSON.stringify(items));
}
