import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItemAsync(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // noop on web fallback
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // noop on web fallback
  }
}

export function isAvailableAsync(): Promise<boolean> {
  // AsyncStorage-backed fallback is available on web via localStorage
  return Promise.resolve(true);
}
