import { Asset, AssetCategory } from '../types';
import { ar, CATEGORY_ORDER, labelForField } from '../i18n/ar';

const REPORT_FIELDS: (keyof Asset)[] = [
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
  'purchaseDate',
  'warrantyExpiry',
  'notes',
];

function valueOf(asset: Asset, field: keyof Asset): string {
  const v = asset[field];
  if (field === 'protocol') return ar.protocolLabels[asset.protocol];
  if (field === 'status') return ar.statusLabels[asset.status];
  if (field === 'password') return v ? '••••••••' : '';
  return String(v ?? '').trim();
}

export function buildFeasibilityReport(assets: Asset[], includePasswords = false): string {
  const now = new Date().toLocaleString('ar-LY');
  const lines: string[] = [
    `📋 ${ar.reportTitle}`,
    `${ar.reportGeneratedAt}: ${now}`,
    `${ar.totalAssets}: ${assets.length}`,
    '',
    '════════════════════════════════',
  ];

  for (const category of CATEGORY_ORDER) {
    const items = assets.filter((a) => a.category === category);
    lines.push('');
    lines.push(`▸ ${ar.categoryLabels[category]} (${items.length})`);
    lines.push('────────────────────────────────');

    if (items.length === 0) {
      lines.push('  — لا توجد معدات —');
      continue;
    }

    items.forEach((asset, idx) => {
      lines.push('');
      lines.push(`  ${idx + 1}) ${asset.name || 'بدون اسم'}`);
      for (const field of REPORT_FIELDS) {
        if (field === 'password' && !includePasswords) continue;
        const val = valueOf(asset, field);
        if (!val) continue;
        lines.push(`     • ${labelForField(field)}: ${val}`);
      }
      if (includePasswords && asset.password) {
        lines.push(`     • ${ar.password}: ${asset.password}`);
      }
    });
  }

  lines.push('');
  lines.push('════════════════════════════════');
  lines.push('تقرير جدوى جرد المعدات — خزنة البنية');
  return lines.join('\n');
}

export function completenessScore(asset: Asset): { filled: number; total: number; pct: number } {
  const fields = REPORT_FIELDS.filter((f) => f !== 'password');
  let filled = 0;
  for (const f of fields) {
    if (valueOf(asset, f)) filled += 1;
  }
  const total = fields.length;
  return { filled, total, pct: Math.round((filled / total) * 100) };
}

export function categoryStats(assets: Asset[]): Record<AssetCategory, { count: number; avgPct: number }> {
  const out = {} as Record<AssetCategory, { count: number; avgPct: number }>;
  for (const cat of CATEGORY_ORDER) {
    const items = assets.filter((a) => a.category === cat);
    const avg =
      items.length === 0
        ? 0
        : Math.round(
            items.reduce((s, a) => s + completenessScore(a).pct, 0) / items.length
          );
    out[cat] = { count: items.length, avgPct: avg };
  }
  return out;
}
