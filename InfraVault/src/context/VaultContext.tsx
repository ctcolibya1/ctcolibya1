import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Credential, VaultSettings } from '../types';
import * as vault from '../services/vaultStorage';
import { canUseBiometrics } from '../services/share';

interface VaultContextValue {
  ready: boolean;
  unlocked: boolean;
  hasVault: boolean;
  settings: VaultSettings | null;
  credentials: Credential[];
  biometricsAvailable: boolean;
  setup: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  lock: () => Promise<void>;
  addCredential: (data: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Credential>;
  updateCredential: (id: string, data: Partial<Credential>) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  getById: (id: string) => Credential | undefined;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

function newId(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [settings, setSettings] = useState<VaultSettings | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [sessionPin, setSessionPinState] = useState<string | null>(null);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await vault.loadSettings();
      setSettings(s);
      setBiometricsAvailable(await canUseBiometrics());
      setReady(true);
    })();
  }, []);

  const persist = useCallback(
    async (next: Credential[], pin: string, salt: string) => {
      await vault.saveCredentials(next, pin, salt);
      setCredentials(next);
    },
    []
  );

  const setup = useCallback(async (pin: string) => {
    const s = await vault.setupVault(pin);
    await vault.setSessionPin(pin);
    setSettings(s);
    setSessionPinState(pin);
    setCredentials([]);
    setUnlocked(true);
  }, []);

  const unlock = useCallback(
    async (pin: string) => {
      if (!settings) return false;
      const ok = await vault.verifyPin(pin, settings);
      if (!ok) return false;
      const list = await vault.loadCredentials(pin, settings.salt);
      await vault.setSessionPin(pin);
      setSessionPinState(pin);
      setCredentials(list);
      setUnlocked(true);
      return true;
    },
    [settings]
  );

  const unlockWithBiometrics = useCallback(async () => {
    if (!settings?.biometricsEnabled) return false;
    const { authenticateWithBiometrics } = await import('../services/share');
    const ok = await authenticateWithBiometrics();
    if (!ok) return false;
    const pin = await vault.getSessionPin();
    if (!pin) return false;
    return unlock(pin);
  }, [settings, unlock]);

  const lock = useCallback(async () => {
    setUnlocked(false);
    setCredentials([]);
    // Keep session PIN in SecureStore for biometric unlock
  }, []);

  const addCredential = useCallback(
    async (data: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!sessionPin || !settings) throw new Error('LOCKED');
      const now = new Date().toISOString();
      const item: Credential = {
        ...data,
        id: newId(),
        createdAt: now,
        updatedAt: now,
      };
      const next = [item, ...credentials];
      await persist(next, sessionPin, settings.salt);
      return item;
    },
    [credentials, persist, sessionPin, settings]
  );

  const updateCredential = useCallback(
    async (id: string, data: Partial<Credential>) => {
      if (!sessionPin || !settings) throw new Error('LOCKED');
      const next = credentials.map((c) =>
        c.id === id
          ? { ...c, ...data, id: c.id, updatedAt: new Date().toISOString() }
          : c
      );
      await persist(next, sessionPin, settings.salt);
    },
    [credentials, persist, sessionPin, settings]
  );

  const deleteCredential = useCallback(
    async (id: string) => {
      if (!sessionPin || !settings) throw new Error('LOCKED');
      const next = credentials.filter((c) => c.id !== id);
      await persist(next, sessionPin, settings.salt);
    },
    [credentials, persist, sessionPin, settings]
  );

  const getById = useCallback(
    (id: string) => credentials.find((c) => c.id === id),
    [credentials]
  );

  const setBiometricsEnabled = useCallback(
    async (enabled: boolean) => {
      if (!settings) return;
      const next = { ...settings, biometricsEnabled: enabled };
      await vault.saveSettings(next);
      setSettings(next);
    },
    [settings]
  );

  const changePin = useCallback(
    async (oldPin: string, newPin: string) => {
      if (!settings) return;
      const next = await vault.changePin(oldPin, newPin, settings);
      await vault.setSessionPin(newPin);
      setSettings(next);
      setSessionPinState(newPin);
    },
    [settings]
  );

  const value = useMemo(
    () => ({
      ready,
      unlocked,
      hasVault: !!settings,
      settings,
      credentials,
      biometricsAvailable,
      setup,
      unlock,
      unlockWithBiometrics,
      lock,
      addCredential,
      updateCredential,
      deleteCredential,
      getById,
      setBiometricsEnabled,
      changePin,
    }),
    [
      ready,
      unlocked,
      settings,
      credentials,
      biometricsAvailable,
      setup,
      unlock,
      unlockWithBiometrics,
      lock,
      addCredential,
      updateCredential,
      deleteCredential,
      getById,
      setBiometricsEnabled,
      changePin,
    ]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
}
