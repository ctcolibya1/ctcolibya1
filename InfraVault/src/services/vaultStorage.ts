import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Credential, VaultSettings } from '../types';

const SETTINGS_KEY = 'infravault.settings';
const VAULT_KEY = 'infravault.vault.enc';
const SESSION_KEY = 'infravault.session';

function deriveKey(pin: string, salt: string): string {
  return CryptoJS.PBKDF2(pin, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin}`
  );
}

export async function createSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function loadSettings(): Promise<VaultSettings | null> {
  const raw = await SecureStore.getItemAsync(SETTINGS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VaultSettings;
  } catch {
    return null;
  }
}

export async function saveSettings(settings: VaultSettings): Promise<void> {
  await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
}

export async function setupVault(pin: string): Promise<VaultSettings> {
  const salt = await createSalt();
  const pinHash = await hashPin(pin, salt);
  const settings: VaultSettings = {
    pinHash,
    salt,
    biometricsEnabled: false,
    autoLockMinutes: 5,
  };
  await saveSettings(settings);
  await saveCredentials([], pin, salt);
  return settings;
}

export async function verifyPin(pin: string, settings: VaultSettings): Promise<boolean> {
  const hash = await hashPin(pin, settings.salt);
  return hash === settings.pinHash;
}

export async function changePin(
  oldPin: string,
  newPin: string,
  settings: VaultSettings
): Promise<VaultSettings> {
  const ok = await verifyPin(oldPin, settings);
  if (!ok) throw new Error('INVALID_PIN');
  const credentials = await loadCredentials(oldPin, settings.salt);
  const salt = await createSalt();
  const pinHash = await hashPin(newPin, salt);
  const next: VaultSettings = { ...settings, salt, pinHash };
  await saveSettings(next);
  await saveCredentials(credentials, newPin, salt);
  return next;
}

export async function loadCredentials(pin: string, salt: string): Promise<Credential[]> {
  const enc = await AsyncStorage.getItem(VAULT_KEY);
  if (!enc) return [];
  try {
    const key = deriveKey(pin, salt);
    const bytes = CryptoJS.AES.decrypt(enc, key);
    const json = bytes.toString(CryptoJS.enc.Utf8);
    if (!json) throw new Error('DECRYPT_FAILED');
    return JSON.parse(json) as Credential[];
  } catch {
    throw new Error('DECRYPT_FAILED');
  }
}

export async function saveCredentials(
  credentials: Credential[],
  pin: string,
  salt: string
): Promise<void> {
  const key = deriveKey(pin, salt);
  const enc = CryptoJS.AES.encrypt(JSON.stringify(credentials), key).toString();
  await AsyncStorage.setItem(VAULT_KEY, enc);
}

export async function setSessionPin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, pin);
}

export async function getSessionPin(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
