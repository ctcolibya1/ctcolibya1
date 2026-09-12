import {
  Asset,
  AssetCategory,
  AssetStatus,
  Protocol,
  requiredParentCategory,
} from '../types';

export const ar = {
  appName: 'خزنة البنية',
  appTagline: 'خادم ← Hypervisor ← VM · وأنظمة التشغيل على الخوادم',
  unlock: 'فتح الخزنة',
  enterPin: 'أدخل رمز PIN',
  confirmPin: 'أكد رمز PIN',
  setupTitle: 'إعداد الحماية',
  setupSubtitle: 'اختر رمز PIN من 4 إلى 8 أرقام',
  wrongPin: 'رمز PIN غير صحيح',
  pinMismatch: 'الرمزان غير متطابقين',
  useBiometrics: 'فتح ببصمة الوجه / الإصبع',
  categories: 'التصنيفات',
  search: 'بحث بالاسم أو Serial أو IP…',
  add: 'إضافة',
  save: 'حفظ',
  delete: 'حذف',
  edit: 'تعديل',
  cancel: 'إلغاء',
  shareWhatsApp: 'مشاركة عبر واتساب',
  copyPassword: 'نسخ كلمة السر',
  copied: 'تم النسخ',
  emptyCategory: 'لا توجد سجلات بعد',
  emptyHint: 'اضغط + — للعناصر التابعة اختر الأب أولاً',
  settings: 'الإعدادات',
  biometrics: 'البصمة الحيوية',
  changePin: 'تغيير رمز PIN',
  lockNow: 'قفل الآن',
  about: 'عن التطبيق',
  aboutText:
    'جرد البنية بعلاقات منطقية: الخادم يحمل Hypervisor والـ VMs، وأنظمة التشغيل ترتبط بالخادم. كل نوع له حقول مفيدة فقط.',
  required: 'الاسم مطلوب',
  parentRequired: 'يجب اختيار العنصر الأب',
  noParentsAvailable: 'لا يوجد أب مناسب — أضف خادماً أو Hypervisor أولاً',
  confirmDelete: 'حذف هذا السجل نهائياً؟',
  cannotDeleteHasChildren:
    'لا يمكن الحذف: توجد عناصر تابعة. احذف الأبناء أولاً.',
  yes: 'نعم',
  no: 'لا',
  noResults: 'لا توجد نتائج',
  count: 'سجل',
  newEntry: 'سجل جديد',
  editEntry: 'تعديل السجل',
  selectFieldsToShare: 'اختر الحقول للمشاركة',
  share: 'مشاركة',
  allFields: 'كل الحقول',
  hidePassword: 'إخفاء',
  showPassword: 'إظهار',
  report: 'تقرير الجدوى',
  reportTitle: 'تقرير جرد وجدوى البنية',
  reportSubtitle: 'عرض هرمي حسب الخوادم والعلاقات',
  reportEmpty: 'لا توجد بيانات بعد',
  reportShare: 'مشاركة التقرير',
  reportGeneratedAt: 'تاريخ التقرير',
  totalAssets: 'إجمالي السجلات',
  sectionRelation: 'الارتباط',
  sectionIdentity: 'الهوية',
  sectionSpecs: 'المواصفات',
  sectionOps: 'التشغيل',
  sectionAccess: 'الوصول',
  sectionLifecycle: 'دورة الحياة',
  parent: 'مرتبط بـ',
  selectParent: 'اختر العنصر الأب',
  children: 'العناصر التابعة',
  addHypervisor: 'إضافة Hypervisor',
  addVm: 'إضافة VM',
  addOs: 'إضافة نظام تشغيل',
  onServer: 'على الخادم',
  onHypervisor: 'على Hypervisor',

  name: 'الاسم',
  manufacturer: 'الشركة المصنعة',
  model: 'الموديل',
  serialNumber: 'الرقم التسلسلي (Serial)',
  serviceTag: 'Service Tag',
  cpu: 'المعالج (CPU)',
  ram: 'الذاكرة (RAM)',
  storage: 'التخزين',
  networkPorts: 'المنافذ الشبكية',
  firmware: 'Firmware',
  osOrSystems: 'نظام التشغيل / الأنظمة',
  location: 'الموقع / مركز البيانات',
  rack: 'الرف / Rack',
  department: 'القسم',
  role: 'الدور',
  status: 'الحالة',
  managementIp: 'IP الإدارة',
  host: 'عنوان الوصول / IP',
  port: 'المنفذ',
  username: 'اسم المستخدم',
  password: 'كلمة السر',
  protocol: 'البروتوكول',
  purchaseDate: 'تاريخ الشراء',
  warrantyExpiry: 'انتهاء الضمان',
  notes: 'ملاحظات',

  hypervisorVendor: 'منصة الافتراضية',
  hypervisorVersion: 'إصدار Hypervisor',
  vCpu: 'vCPU',
  vRam: 'vRAM',
  vDisk: 'قرص افتراضي',
  guestOs: 'نظام تشغيل الضيف',
  osName: 'اسم نظام التشغيل',
  osEdition: 'الإصدار / Edition',

  categoryLabels: {
    servers: 'خوادم فعلية',
    hypervisor: 'Hypervisor',
    vm: 'آلات افتراضية (VM)',
    os: 'أنظمة التشغيل',
    switches: 'محولات',
    routers: 'موجهات',
    firewalls: 'جدران نارية',
  } as Record<AssetCategory, string>,
  categoryHints: {
    servers: 'عتاد فعلي: Serial · CPU · RAM · Storage',
    hypervisor: 'يُثبت على خادم ويدر الـ VMs',
    vm: 'تتبع Hypervisor — مواصفات افتراضية فقط',
    os: 'مرتبط بخادم فعلي',
    switches: 'عتاد شبكة',
    routers: 'أجهزة توجيه',
    firewalls: 'جدران حماية',
  } as Record<AssetCategory, string>,
  protocolLabels: {
    ssh: 'SSH',
    rdp: 'RDP',
    https: 'HTTPS',
    http: 'HTTP',
    console: 'Console',
    telnet: 'Telnet',
    winrm: 'WinRM',
    api: 'API',
    other: 'أخرى',
  } as Record<Protocol, string>,
  statusLabels: {
    active: 'نشط',
    standby: 'احتياطي',
    maintenance: 'صيانة',
    retired: 'موقوف',
  } as Record<AssetStatus, string>,
};

export const CATEGORY_ORDER: AssetCategory[] = [
  'servers',
  'hypervisor',
  'vm',
  'os',
  'switches',
  'routers',
  'firewalls',
];

export const PROTOCOL_ORDER: Protocol[] = [
  'ssh',
  'rdp',
  'https',
  'http',
  'console',
  'winrm',
  'telnet',
  'api',
  'other',
];

export const STATUS_ORDER: AssetStatus[] = [
  'active',
  'standby',
  'maintenance',
  'retired',
];

/** حقول مفيدة فقط — بدون بيانات عشوائية */
export function fieldsForCategory(category: AssetCategory): (keyof Asset)[] {
  const accessFull: (keyof Asset)[] = [
    'managementIp',
    'host',
    'port',
    'protocol',
    'username',
    'password',
  ];
  const accessSimple: (keyof Asset)[] = [
    'host',
    'port',
    'protocol',
    'username',
    'password',
  ];

  switch (category) {
    case 'servers':
      return [
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
        'location',
        'rack',
        'department',
        'role',
        'status',
        ...accessFull,
        'purchaseDate',
        'warrantyExpiry',
        'notes',
      ];
    case 'hypervisor':
      // بدون تكرار عتاد الخادم
      return [
        'name',
        'manufacturer',
        'model',
        'role',
        'status',
        ...accessFull,
        'notes',
      ];
    case 'vm':
      return [
        'name',
        'osOrSystems',
        'cpu',
        'ram',
        'storage',
        'role',
        'department',
        'status',
        ...accessSimple,
        'notes',
      ];
    case 'os':
      return [
        'name',
        'model',
        'role',
        'department',
        'status',
        ...accessSimple,
        'notes',
      ];
    case 'switches':
    case 'routers':
    case 'firewalls':
      return [
        'name',
        'manufacturer',
        'model',
        'serialNumber',
        'serviceTag',
        'networkPorts',
        'firmware',
        'location',
        'rack',
        'department',
        'role',
        'status',
        ...accessFull,
        'purchaseDate',
        'warrantyExpiry',
        'notes',
      ];
    default:
      return ['name', 'status', 'notes'];
  }
}

export function labelForField(
  field: keyof Asset,
  category?: AssetCategory
): string {
  if (category === 'hypervisor') {
    if (field === 'manufacturer') return ar.hypervisorVendor;
    if (field === 'model') return ar.hypervisorVersion;
  }
  if (category === 'vm') {
    if (field === 'cpu') return ar.vCpu;
    if (field === 'ram') return ar.vRam;
    if (field === 'storage') return ar.vDisk;
    if (field === 'osOrSystems') return ar.guestOs;
  }
  if (category === 'os') {
    if (field === 'name') return ar.osName;
    if (field === 'model') return ar.osEdition;
  }
  const map: Partial<Record<keyof Asset, string>> = {
    name: ar.name,
    manufacturer: ar.manufacturer,
    model: ar.model,
    serialNumber: ar.serialNumber,
    serviceTag: ar.serviceTag,
    cpu: ar.cpu,
    ram: ar.ram,
    storage: ar.storage,
    networkPorts: ar.networkPorts,
    firmware: ar.firmware,
    osOrSystems: ar.osOrSystems,
    location: ar.location,
    rack: ar.rack,
    department: ar.department,
    role: ar.role,
    status: ar.status,
    managementIp: ar.managementIp,
    host: ar.host,
    port: ar.port,
    protocol: ar.protocol,
    username: ar.username,
    password: ar.password,
    purchaseDate: ar.purchaseDate,
    warrantyExpiry: ar.warrantyExpiry,
    notes: ar.notes,
    parentId: ar.parent,
  };
  return map[field] ?? String(field);
}

export function parentPickerTitle(category: AssetCategory): string {
  const p = requiredParentCategory(category);
  if (p === 'servers') return `${ar.selectParent} (${ar.categoryLabels.servers})`;
  if (p === 'hypervisor')
    return `${ar.selectParent} (${ar.categoryLabels.hypervisor})`;
  return ar.selectParent;
}
