import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';
const hasLocalStorage = isWeb && typeof localStorage !== 'undefined';

export async function getItem(key: string): Promise<string | null> {
  if (!isWeb) return SecureStore.getItemAsync(key);
  return hasLocalStorage ? localStorage.getItem(key) : null;
}

export async function setItem(key: string, value: string): Promise<void> {
  if (!isWeb) { await SecureStore.setItemAsync(key, value); return; }
  if (hasLocalStorage) localStorage.setItem(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (!isWeb) { await SecureStore.deleteItemAsync(key); return; }
  if (hasLocalStorage) localStorage.removeItem(key);
}
