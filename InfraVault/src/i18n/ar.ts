import { Asset, AssetCategory, AssetStatus, Protocol } from '../types';

export const ar = {
  appName: 'خزنة البنية',
  appTagline: 'جرد المعدات وكلمات السر في مكان واحد',
  unlock: 'فتح الخزنة',
  enterPin: 'أدخل رمز PIN',
  confirmPin: 'أكد رمز PIN',
  setupTitle: 'إعداد الحماية',
  setupSubtitle: 'اختر رمز PIN من 4 إلى 8 أرقام لحماية بيانات المعدات',
  wrongPin: 'رمز PIN غير صحيح',
  pinMismatch: 'الرمزان غير متطابقين',
  useBiometrics: 'فتح ببصمة الوجه / الإصبع',
  categories: 'تصنيفات المعدات',
  search: 'بحث بالاسم أو الموديل أو Serial أو IP…',
  add: 'إضافة',
  save: 'حفظ',
  delete: 'حذف',
  edit: 'تعديل',
  cancel: 'إلغاء',
  shareWhatsApp: 'مشاركة عبر واتساب',
  copyPassword: 'نسخ كلمة السر',
  copied: 'تم النسخ',
  emptyCategory: 'لا توجد معدات في هذا التصنيف بعد',
  emptyHint: 'اضغط + لإضافة معدة مع مواصفاتها الكاملة',
  settings: 'الإعدادات',
  biometrics: 'البصمة الحيوية',
  changePin: 'تغيير رمز PIN',
  lockNow: 'قفل الخزنة الآن',
  about: 'عن التطبيق',
  aboutText:
    'خزنة البنية تطبيق محلي لجرد معدات البنية التحتية (خوادم، شبكات، افتراضية) مع مواصفاتها الفنية وبيانات الدخول. البيانات تُشفَّر على جهازك.',
  required: 'الاسم مطلوب على الأقل',
  confirmDelete: 'حذف هذا السجل نهائياً؟',
  yes: 'نعم',
  no: 'لا',
  noResults: 'لا توجد نتائج',
  count: 'معدة',
  newEntry: 'معدة جديدة',
  editEntry: 'تعديل المعدة',
  selectFieldsToShare: 'اختر الحقول للمشاركة',
  share: 'مشاركة',
  allFields: 'كل الحقول',
  hidePassword: 'إخفاء',
  showPassword: 'إظهار',
  report: 'تقرير الجدوى',
  reportTitle: 'تقرير جرد وجدوى المعدات',
  reportSubtitle: 'ملخص كل المدخلات المسجّلة حسب التصنيف',
  reportEmpty: 'لا توجد معدات بعد لإنشاء التقرير',
  reportShare: 'مشاركة التقرير',
  reportGeneratedAt: 'تاريخ التقرير',
  totalAssets: 'إجمالي المعدات',
  sectionIdentity: 'هوية المعدة',
  sectionSpecs: 'المواصفات الفنية',
  sectionOps: 'التشغيل والموقع',
  sectionAccess: 'الوصول وبيانات الدخول',
  sectionLifecycle: 'دورة الحياة',

  name: 'اسم الجهاز / Hostname',
  manufacturer: 'الشركة المصنعة',
  model: 'الموديل (Model)',
  serialNumber: 'الرقم التسلسلي (Serial Number)',
  serviceTag: 'Service Tag',
  cpu: 'المعالج (CPU)',
  ram: 'الذاكرة (RAM)',
  storage: 'التخزين (Storage)',
  networkPorts: 'المنافذ الشبكية',
  firmware: 'Firmware / البرنامج الثابت',
  osOrSystems: 'الأنظمة والتطبيقات الموجودة',
  location: 'أين يعمل / الموقع / مركز البيانات',
  rack: 'الرف / Rack / U',
  department: 'القسم / الإدارة',
  role: 'دور المعدة في البنية',
  status: 'الحالة',
  managementIp: 'IP الإدارة (Management)',
  host: 'عنوان الوصول / IP',
  port: 'المنفذ',
  username: 'اسم المستخدم',
  password: 'كلمة السر',
  protocol: 'بروتوكول الوصول',
  purchaseDate: 'تاريخ الشراء',
  warrantyExpiry: 'انتهاء الضمان',
  notes: 'ملاحظات إضافية',

  categoryLabels: {
    servers: 'خوادم',
    os: 'أنظمة التشغيل',
    hypervisor: 'Hypervisor',
    vm: 'آلات افتراضية',
    switches: 'محولات',
    routers: 'موجهات',
    firewalls: 'جدران نارية',
  } as Record<AssetCategory, string>,
  categoryHints: {
    servers: 'Dell / HPE — Serial, CPU, RAM, Storage',
    os: 'حسابات وأنظمة على المعدات',
    hypervisor: 'VMware / Hyper-V / Proxmox',
    vm: 'ضيوف افتراضيون ومواصفاتهم',
    switches: 'محولات الشبكة والمنافذ',
    routers: 'أجهزة التوجيه',
    firewalls: 'جدران الحماية',
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
  'os',
  'hypervisor',
  'vm',
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

/** الحقول الظاهرة في النموذج حسب نوع المعدة */
export function fieldsForCategory(category: AssetCategory): (keyof Asset)[] {
  const commonIdentity: (keyof Asset)[] = [
    'name',
    'manufacturer',
    'model',
    'serialNumber',
    'serviceTag',
  ];
  const computeSpecs: (keyof Asset)[] = [
    'cpu',
    'ram',
    'storage',
    'networkPorts',
    'firmware',
    'osOrSystems',
  ];
  const netSpecs: (keyof Asset)[] = [
    'networkPorts',
    'firmware',
    'osOrSystems',
    'cpu',
    'ram',
    'storage',
  ];
  const ops: (keyof Asset)[] = [
    'location',
    'rack',
    'department',
    'role',
    'status',
  ];
  const access: (keyof Asset)[] = [
    'managementIp',
    'host',
    'port',
    'protocol',
    'username',
    'password',
  ];
  const life: (keyof Asset)[] = ['purchaseDate', 'warrantyExpiry', 'notes'];

  switch (category) {
    case 'servers':
    case 'hypervisor':
      return [...commonIdentity, ...computeSpecs, ...ops, ...access, ...life];
    case 'vm':
      return [
        'name',
        'manufacturer',
        'model',
        'cpu',
        'ram',
        'storage',
        'osOrSystems',
        'location',
        'department',
        'role',
        'status',
        'host',
        'port',
        'protocol',
        'username',
        'password',
        'notes',
      ];
    case 'os':
      return [
        'name',
        'osOrSystems',
        'role',
        'location',
        'department',
        'status',
        'host',
        'port',
        'protocol',
        'username',
        'password',
        'notes',
      ];
    case 'switches':
    case 'routers':
    case 'firewalls':
      return [...commonIdentity, ...netSpecs, ...ops, ...access, ...life];
    default:
      return [...commonIdentity, ...computeSpecs, ...ops, ...access, ...life];
  }
}

export function labelForField(field: keyof Asset): string {
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
  };
  return map[field] ?? String(field);
}
