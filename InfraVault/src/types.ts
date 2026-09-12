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

export type AssetStatus = 'active' | 'standby' | 'maintenance' | 'retired';

/** سجل معدة / عتاد بنية تحتية مع بيانات الدخول */
export interface Asset {
  id: string;
  category: AssetCategory;

  /** اسم الجهاز / Hostname */
  name: string;
  /** الشركة المصنعة: Dell, HPE, Cisco... */
  manufacturer: string;
  /** الموديل */
  model: string;
  /** الرقم التسلسلي */
  serialNumber: string;
  /** Service Tag */
  serviceTag: string;

  /** المعالج */
  cpu: string;
  /** الذاكرة */
  ram: string;
  /** التخزين */
  storage: string;
  /** عدد/نوع المنافذ الشبكية */
  networkPorts: string;
  /** البرنامج الثابت / Firmware */
  firmware: string;
  /** الأنظمة والتطبيقات الموجودة على المعدة */
  osOrSystems: string;

  /** أين يعمل: مركز بيانات / موقع */
  location: string;
  /** الرف / الوحدة */
  rack: string;
  /** الإدارة / القسم */
  department: string;
  /** دور المعدة في البنية */
  role: string;
  status: AssetStatus;

  /** IP الإدارة */
  managementIp: string;
  /** عنوان / IP للوصول */
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

/** توافق خلفي مع الاسم القديم */
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
  Form: { category?: AssetCategory; id?: string };
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
  'VMware',
  'Microsoft',
  'IBM',
  'Oracle',
  'Other',
] as const;

export const EMPTY_ASSET_FIELDS: Omit<Asset, 'id' | 'category' | 'createdAt' | 'updatedAt' | 'protocol' | 'status'> = {
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

export function normalizeAsset(
  raw: Partial<Asset> & { id: string; category: AssetCategory } & {
    osOrFirmware?: string;
  }
): Asset {
  return {
    id: raw.id,
    category: raw.category,
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
