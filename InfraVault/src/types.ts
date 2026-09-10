export type AssetCategory =
  | 'servers'
  | 'os'
  | 'hypervisor'
  | 'vm'
  | 'switches'
  | 'routers'
  | 'firewalls';

export type Protocol =
  | 'ssh'
  | 'rdp'
  | 'https'
  | 'http'
  | 'console'
  | 'telnet'
  | 'winrm'
  | 'api'
  | 'other';

export interface Credential {
  id: string;
  category: AssetCategory;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  protocol: Protocol;
  osOrFirmware: string;
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultSettings {
  pinHash: string;
  salt: string;
  biometricsEnabled: boolean;
  autoLockMinutes: number;
}

export type RootStackParamList = {
  Lock: undefined;
  Home: undefined;
  Category: { category: AssetCategory };
  Detail: { id: string };
  Form: { category?: AssetCategory; id?: string };
  Settings: undefined;
  Setup: undefined;
};
