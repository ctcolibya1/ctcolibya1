import * as LocalAuthentication from 'expo-local-authentication';
import { Linking, Platform, Share } from 'react-native';
import { Credential } from '../types';
import { ar } from '../i18n/ar';

export async function canUseBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: ar.useBiometrics,
    cancelLabel: ar.cancel,
    disableDeviceFallback: false,
  });
  return result.success;
}

export type ShareField =
  | 'name'
  | 'host'
  | 'port'
  | 'username'
  | 'password'
  | 'protocol'
  | 'osOrFirmware'
  | 'location'
  | 'notes';

export const ALL_SHARE_FIELDS: ShareField[] = [
  'name',
  'host',
  'port',
  'username',
  'password',
  'protocol',
  'osOrFirmware',
  'location',
  'notes',
];

export function formatCredentialMessage(
  credential: Credential,
  fields: ShareField[] = ALL_SHARE_FIELDS
): string {
  const lines: string[] = [`🔐 ${ar.appName}`, ''];
  const map: Record<ShareField, string | undefined> = {
    name: `${ar.name}: ${credential.name}`,
    host: credential.host ? `${ar.host}: ${credential.host}` : undefined,
    port: credential.port ? `${ar.port}: ${credential.port}` : undefined,
    username: credential.username
      ? `${ar.username}: ${credential.username}`
      : undefined,
    password: credential.password
      ? `${ar.password}: ${credential.password}`
      : undefined,
    protocol: `${ar.protocol}: ${ar.protocolLabels[credential.protocol]}`,
    osOrFirmware: credential.osOrFirmware
      ? `${ar.osOrFirmware}: ${credential.osOrFirmware}`
      : undefined,
    location: credential.location
      ? `${ar.location}: ${credential.location}`
      : undefined,
    notes: credential.notes ? `${ar.notes}: ${credential.notes}` : undefined,
  };

  for (const field of fields) {
    const line = map[field];
    if (line) lines.push(line);
  }

  lines.push('');
  lines.push(`التصنيف: ${ar.categoryLabels[credential.category]}`);
  return lines.join('\n');
}

export async function shareViaWhatsApp(message: string): Promise<void> {
  const encoded = encodeURIComponent(message);
  const appUrl = `whatsapp://send?text=${encoded}`;
  const webUrl = `https://wa.me/?text=${encoded}`;

  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
      return;
    }
  } catch {
    // fall through
  }

  try {
    await Linking.openURL(webUrl);
  } catch {
    await Share.share({ message });
  }
}

export async function shareSystem(message: string): Promise<void> {
  await Share.share({
    message,
    ...(Platform.OS === 'ios' ? { url: undefined } : {}),
  });
}
