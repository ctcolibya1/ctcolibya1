export type AssetCategory =
  | 'servers'
  | 'hypervisor'
  | 'vm'
  | 'os'
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

export type AssetStatus = 'active' | 'standby' | 'maintenance' | 'retired';

/**
 * العلاقات المنطقية:
 * Server → Hypervisor → VM
 * Server → OS
 * Switches / Routers / Firewalls مستقلة
 */
export interface Asset {
  id: string;
  category: AssetCategory;
  /** معرف الأب: خادم لـ Hypervisor/OS ، أو Hypervisor لـ VM */
  parentId: string;

  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  serviceTag: string;

  cpu: string;
  ram: string;
  storage: string;
  networkPorts: string;
  firmware: string;
  /** نظام الضيف / الأنظمة المثبتة */
  osOrSystems: string;

  location: string;
  rack: string;
  department: string;
  role: string;
  status: AssetStatus;

  managementIp: string;
  host: string;
  port: string;
  protocol: Protocol;
  username: string;
  password: string;

  purchaseDate: string;
  warrantyExpiry: string;
  notes: string;

  createdAt: string;
  updatedAt: string;
}

export type Credential = Asset;

export interface VaultSettings {
  pinHash: string;
  salt: string;
  biometricsEnabled: boolean;
  autoLockMinutes: number;
}

export type RootStackParamList = {
  Setup: undefined;
  Lock: undefined;
  Home: undefined;
  Category: { category: AssetCategory };
  Detail: { id: string };
  Form: { category?: AssetCategory; id?: string; parentId?: string };
  Settings: undefined;
  Report: undefined;
};

export const MANUFACTURERS = [
  'Dell',
  'HPE',
  'HP',
  'Cisco',
  'Juniper',
  'Fortinet',
  'Palo Alto',
  'Huawei',
  'Lenovo',
  'Supermicro',
  'IBM',
  'Oracle',
  'Other',
] as const;

export const HYPERVISOR_VENDORS = [
  'VMware',
  'Microsoft',
  'Proxmox',
  'Citrix',
  'Red Hat',
  'Oracle',
  'Other',
] as const;

export const EMPTY_ASSET_FIELDS: Omit<
  Asset,
  'id' | 'category' | 'createdAt' | 'updatedAt' | 'protocol' | 'status'
> = {
  parentId: '',
  name: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  serviceTag: '',
  cpu: '',
  ram: '',
  storage: '',
  networkPorts: '',
  firmware: '',
  osOrSystems: '',
  location: '',
  rack: '',
  department: '',
  role: '',
  managementIp: '',
  host: '',
  port: '',
  username: '',
  password: '',
  purchaseDate: '',
  warrantyExpiry: '',
  notes: '',
};

/** من يجب اختياره كأب لهذا التصنيف */
export function requiredParentCategory(
  category: AssetCategory
): AssetCategory | null {
  switch (category) {
    case 'hypervisor':
    case 'os':
      return 'servers';
    case 'vm':
      return 'hypervisor';
    default:
      return null;
  }
}

export function normalizeAsset(
  raw: Partial<Asset> & { id: string; category: AssetCategory } & {
    osOrFirmware?: string;
  }
): Asset {
  return {
    id: raw.id,
    category: raw.category,
    parentId: raw.parentId ?? '',
    name: raw.name ?? '',
    manufacturer: raw.manufacturer ?? '',
    model: raw.model ?? '',
    serialNumber: raw.serialNumber ?? '',
    serviceTag: raw.serviceTag ?? '',
    cpu: raw.cpu ?? '',
    ram: raw.ram ?? '',
    storage: raw.storage ?? '',
    networkPorts: raw.networkPorts ?? '',
    firmware: raw.firmware ?? '',
    osOrSystems: raw.osOrSystems ?? raw.osOrFirmware ?? '',
    location: raw.location ?? '',
    rack: raw.rack ?? '',
    department: raw.department ?? '',
    role: raw.role ?? '',
    status: raw.status ?? 'active',
    managementIp: raw.managementIp ?? '',
    host: raw.host ?? '',
    port: raw.port ?? '',
    protocol: raw.protocol ?? 'ssh',
    username: raw.username ?? '',
    password: raw.password ?? '',
    purchaseDate: raw.purchaseDate ?? '',
    warrantyExpiry: raw.warrantyExpiry ?? '',
    notes: raw.notes ?? '',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}
