import { Asset, AssetCategory } from '../types';
import { ar, CATEGORY_ORDER, labelForField } from '../i18n/ar';

/** كل حقول التقرير القابلة للاختيار */
export const REPORT_FIELDS: (keyof Asset)[] = [
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

export type ReportOptions = {
  /** التصنيفات المختارة (فارغ = الكل) */
  categories?: AssetCategory[];
  /** الحقول المختارة (فارغ = كل الحقول ما عدا كلمة السر) */
  fields?: (keyof Asset)[];
  /** تضمين كلمات السر نصاً واضحاً */
  includePasswords?: boolean;
  /** إخفاء الحقول الفارغة */
  skipEmpty?: boolean;
};

function valueOf(
  asset: Asset,
  field: keyof Asset,
  includePasswords: boolean
): string {
  const v = asset[field];
  if (field === 'protocol') return ar.protocolLabels[asset.protocol];
  if (field === 'status') return ar.statusLabels[asset.status];
  if (field === 'password') {
    if (!v) return '';
    return includePasswords ? String(v) : '••••••••';
  }
  return String(v ?? '').trim();
}

export function resolveReportFields(
  fields?: (keyof Asset)[],
  includePasswords = false
): (keyof Asset)[] {
  const base =
    fields && fields.length > 0
      ? fields.filter((f) => REPORT_FIELDS.includes(f))
      : REPORT_FIELDS.filter((f) => f !== 'password');
  if (includePasswords && !base.includes('password')) {
    return [...base, 'password'];
  }
  if (!includePasswords) {
    return base.filter((f) => f !== 'password');
  }
  return base;
}

export function filterAssetsForReport(
  assets: Asset[],
  categories?: AssetCategory[]
): Asset[] {
  if (!categories || categories.length === 0) return assets;
  const set = new Set(categories);
  return assets.filter((a) => set.has(a.category));
}

export function buildFeasibilityReport(
  assets: Asset[],
  options: ReportOptions = {}
): string {
  const {
    categories,
    fields,
    includePasswords = false,
    skipEmpty = true,
  } = options;

  const selectedFields = resolveReportFields(fields, includePasswords);
  const filtered = filterAssetsForReport(assets, categories);
  const cats =
    categories && categories.length > 0
      ? CATEGORY_ORDER.filter((c) => categories.includes(c))
      : CATEGORY_ORDER;

  const now = new Date().toLocaleString('ar-LY');
  const lines: string[] = [
    `📋 ${ar.reportTitle}`,
    `${ar.reportGeneratedAt}: ${now}`,
    `${ar.totalAssets}: ${filtered.length}`,
    `${ar.reportSelectedFields}: ${selectedFields.length}`,
    '',
    '════════════════════════════════',
  ];

  for (const category of cats) {
    const items = filtered.filter((a) => a.category === category);
    lines.push('');
    lines.push(`▸ ${ar.categoryLabels[category]} (${items.length})`);
    lines.push('────────────────────────────────');

    if (items.length === 0) {
      lines.push(`  — ${ar.reportNoAssetsInCategory} —`);
      continue;
    }

    items.forEach((asset, idx) => {
      lines.push('');
      lines.push(`  ${idx + 1}) ${asset.name || ar.reportUnnamed}`);
      for (const field of selectedFields) {
        const val = valueOf(asset, field, includePasswords);
        if (skipEmpty && !val) continue;
        lines.push(`     • ${labelForField(field)}: ${val || '—'}`);
      }
    });
  }

  lines.push('');
  lines.push('════════════════════════════════');
  lines.push(ar.reportFooter);
  return lines.join('\n');
}

export function assetLinesForFields(
  asset: Asset,
  fields: (keyof Asset)[],
  includePasswords = false,
  skipEmpty = true
): string[] {
  const selected = resolveReportFields(fields, includePasswords);
  const lines: string[] = [];
  for (const field of selected) {
    const val = valueOf(asset, field, includePasswords);
    if (skipEmpty && !val) continue;
    lines.push(`${labelForField(field)}: ${val || '—'}`);
  }
  return lines;
}

export function completenessScore(
  asset: Asset,
  fields: (keyof Asset)[] = REPORT_FIELDS.filter((f) => f !== 'password')
): { filled: number; total: number; pct: number } {
  const list = fields.filter((f) => f !== 'password');
  let filled = 0;
  for (const f of list) {
    if (valueOf(asset, f, false)) filled += 1;
  }
  const total = list.length || 1;
  return { filled, total, pct: Math.round((filled / total) * 100) };
}

export function categoryStats(
  assets: Asset[],
  fields?: (keyof Asset)[]
): Record<AssetCategory, { count: number; avgPct: number }> {
  const out = {} as Record<AssetCategory, { count: number; avgPct: number }>;
  for (const cat of CATEGORY_ORDER) {
    const items = assets.filter((a) => a.category === cat);
    const avg =
      items.length === 0
        ? 0
        : Math.round(
            items.reduce((s, a) => s + completenessScore(a, fields).pct, 0) /
              items.length
          );
    out[cat] = { count: items.length, avgPct: avg };
  }
  return out;
}
