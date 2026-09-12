import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset, Credential, VaultSettings, normalizeAsset } from '../types';

const SETTINGS_KEY = 'infravault.settings';
const VAULT_KEY = 'infravault.vault.enc';
const SESSION_KEY = 'infravault.session';

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(`secure:${key}`);
  }
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(`secure:${key}`, value);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(`secure:${key}`);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.deleteItemAsync(key);
}

function deriveKey(pin: string, salt: string): string {
  return CryptoJS.PBKDF2(pin, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  // Slow hash for PIN verification (work factor), separate from AES key derivation.
  return CryptoJS.PBKDF2(pin, `pin:${salt}`, {
    keySize: 256 / 32,
    iterations: 120000,
  }).toString();
}

export async function createSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function normalizeSettings(raw: Record<string, unknown>): VaultSettings | null {
  const pinHash =
    (typeof raw.pinHash === 'string' && raw.pinHash) ||
    (typeof raw.pin_hash === 'string' && raw.pin_hash) ||
    (typeof raw.hash === 'string' && raw.hash) ||
    '';
  const salt =
    (typeof raw.salt === 'string' && raw.salt) ||
    (typeof raw.pinSalt === 'string' && raw.pinSalt) ||
    '';
  if (!pinHash || !salt) return null;
  return {
    pinHash,
    salt,
    biometricsEnabled: !!(
      raw.biometricsEnabled ??
      raw.biometrics_enabled ??
      false
    ),
    autoLockMinutes:
      typeof raw.autoLockMinutes === 'number'
        ? raw.autoLockMinutes
        : typeof raw.auto_lock_minutes === 'number'
          ? raw.auto_lock_minutes
          : 5,
  };
}

export async function loadSettings(): Promise<VaultSettings | null> {
  const raw = await secureGet(SETTINGS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return normalizeSettings(parsed);
  } catch {
    return null;
  }
}

export async function saveSettings(settings: VaultSettings): Promise<void> {
  await secureSet(SETTINGS_KEY, JSON.stringify(settings));
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

export async function loadCredentials(pin: string, salt: string): Promise<Asset[]> {
  const enc = await AsyncStorage.getItem(VAULT_KEY);
  if (!enc) return [];
  try {
    const key = deriveKey(pin, salt);
    const bytes = CryptoJS.AES.decrypt(enc, key);
    const json = bytes.toString(CryptoJS.enc.Utf8);
    if (!json) throw new Error('DECRYPT_FAILED');
    const parsed = JSON.parse(json) as Partial<Asset>[];
    return parsed.map((item) =>
      normalizeAsset({
        ...(item as Partial<Asset>),
        id: item.id || `c_${Date.now()}`,
        category: item.category || 'servers',
      })
    );
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
  await secureSet(SESSION_KEY, pin);
}

export async function getSessionPin(): Promise<string | null> {
  return secureGet(SESSION_KEY);
}

export async function clearSession(): Promise<void> {
  await secureDelete(SESSION_KEY);
}
