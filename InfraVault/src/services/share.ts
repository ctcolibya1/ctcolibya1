import * as LocalAuthentication from 'expo-local-authentication';
import { Linking, Platform, Share } from 'react-native';
import { Credential } from '../types';
import { ar, labelForField } from '../i18n/ar';

export async function canUseBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: ar.useBiometrics,
    cancelLabel: ar.cancel,
    disableDeviceFallback: false,
  });
  return result.success;
}

export type ShareField =
  | 'name'
  | 'manufacturer'
  | 'model'
  | 'serialNumber'
  | 'serviceTag'
  | 'cpu'
  | 'ram'
  | 'storage'
  | 'networkPorts'
  | 'firmware'
  | 'osOrSystems'
  | 'location'
  | 'rack'
  | 'department'
  | 'role'
  | 'status'
  | 'managementIp'
  | 'host'
  | 'port'
  | 'protocol'
  | 'username'
  | 'password'
  | 'purchaseDate'
  | 'warrantyExpiry'
  | 'notes';

export const ALL_SHARE_FIELDS: ShareField[] = [
  'name',
  'manufacturer',
  'model',
  'serialNumber',
  'serviceTag',
  'cpu',
  'ram',
  'storage',
  'networkPorts',
  'firmware',
  'osOrSystems',
  'location',
  'rack',
  'department',
  'role',
  'status',
  'managementIp',
  'host',
  'port',
  'protocol',
  'username',
  'password',
  'purchaseDate',
  'warrantyExpiry',
  'notes',
];

function fieldValue(credential: Credential, field: ShareField): string {
  if (field === 'protocol') {
    return ar.protocolLabels[credential.protocol];
  }
  if (field === 'status') {
    return ar.statusLabels[credential.status];
  }
  return String(credential[field] ?? '').trim();
}

export function formatCredentialMessage(
  credential: Credential,
  fields: ShareField[] = ALL_SHARE_FIELDS
): string {
  const lines: string[] = [`🔐 ${ar.appName}`, ''];

  for (const field of fields) {
    const value = fieldValue(credential, field);
    if (!value) continue;
    lines.push(`${labelForField(field)}: ${value}`);
  }

  lines.push('');
  lines.push(`التصنيف: ${ar.categoryLabels[credential.category]}`);
  return lines.join('\n');
}

export async function shareViaWhatsApp(message: string): Promise<void> {
  // Prefer the system share sheet so secrets are not embedded in a URL.
  try {
    await Share.share({ message });
    return;
  } catch {
    // fall through to WhatsApp deep link
  }

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

  await Linking.openURL(webUrl);
}

export async function shareSystem(message: string): Promise<void> {
  await Share.share({
    message,
    ...(Platform.OS === 'ios' ? { url: undefined } : {}),
  });
}
