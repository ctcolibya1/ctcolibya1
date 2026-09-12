import { Asset, AssetCategory } from '../types';
import { ar, CATEGORY_ORDER, fieldsForCategory, labelForField } from '../i18n/ar';

function valueOf(asset: Asset, field: keyof Asset): string {
  const v = asset[field];
  if (field === 'protocol') return ar.protocolLabels[asset.protocol];
  if (field === 'status') return ar.statusLabels[asset.status];
  if (field === 'password') return v ? '••••••••' : '';
  if (field === 'parentId') return '';
  return String(v ?? '').trim();
}

function pushAssetFields(
  lines: string[],
  asset: Asset,
  indent: string,
  includePasswords: boolean
): void {
  for (const field of fieldsForCategory(asset.category)) {
    if (field === 'password' && !includePasswords) continue;
    const val =
      field === 'password' && includePasswords
        ? asset.password
        : valueOf(asset, field);
    if (!val) continue;
    lines.push(
      `${indent}• ${labelForField(field, asset.category)}: ${val}`
    );
  }
}

/** تقرير هرمي: تحت كل خادم Hypervisors→VMs وأنظمة التشغيل، ثم أجهزة الشبكة */
export function buildFeasibilityReport(
  assets: Asset[],
  includePasswords = false
): string {
  const now = new Date().toLocaleString('ar-LY');
  const byId = new Map(assets.map((a) => [a.id, a]));
  const childrenOf = (id: string) =>
    assets.filter((a) => a.parentId === id);

  const lines: string[] = [
    `📋 ${ar.reportTitle}`,
    `${ar.reportGeneratedAt}: ${now}`,
    `${ar.totalAssets}: ${assets.length}`,
    '',
    '════════════════════════════════',
  ];

  const servers = assets.filter((a) => a.category === 'servers');
  lines.push('');
  lines.push(`▸ ${ar.categoryLabels.servers} (${servers.length})`);
  lines.push('────────────────────────────────');

  if (servers.length === 0) {
    lines.push('  — لا توجد خوادم —');
  }

  servers.forEach((server, idx) => {
    lines.push('');
    lines.push(`  ${idx + 1}) ${server.name || 'بدون اسم'}`);
    pushAssetFields(lines, server, '     ', includePasswords);

    const hypervisors = childrenOf(server.id).filter(
      (c) => c.category === 'hypervisor'
    );
    const osList = childrenOf(server.id).filter((c) => c.category === 'os');

    if (hypervisors.length > 0) {
      lines.push(
        `     ▸ ${ar.categoryLabels.hypervisor} (${hypervisors.length})`
      );
      hypervisors.forEach((hv, hIdx) => {
        lines.push(`       ${hIdx + 1}) ${hv.name || 'بدون اسم'}`);
        pushAssetFields(lines, hv, '          ', includePasswords);
        const vms = childrenOf(hv.id).filter((c) => c.category === 'vm');
        if (vms.length > 0) {
          lines.push(`          ▸ ${ar.categoryLabels.vm} (${vms.length})`);
          vms.forEach((vm, vIdx) => {
            lines.push(`            ${vIdx + 1}) ${vm.name || 'بدون اسم'}`);
            pushAssetFields(lines, vm, '               ', includePasswords);
          });
        }
      });
    }

    if (osList.length > 0) {
      lines.push(`     ▸ ${ar.categoryLabels.os} (${osList.length})`);
      osList.forEach((os, oIdx) => {
        lines.push(`       ${oIdx + 1}) ${os.name || 'بدون اسم'}`);
        pushAssetFields(lines, os, '          ', includePasswords);
      });
    }
  });

  const networkCats: AssetCategory[] = ['switches', 'routers', 'firewalls'];
  for (const category of networkCats) {
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
      pushAssetFields(lines, asset, '     ', includePasswords);
    });
  }

  const related: AssetCategory[] = ['hypervisor', 'vm', 'os'];
  for (const category of related) {
    const orphans = assets.filter((a) => {
      if (a.category !== category) return false;
      if (!a.parentId) return true;
      return !byId.has(a.parentId);
    });
    if (orphans.length === 0) continue;
    lines.push('');
    lines.push(
      `▸ ${ar.categoryLabels[category]} — بلا أب (${orphans.length})`
    );
    lines.push('────────────────────────────────');
    orphans.forEach((asset, idx) => {
      lines.push('');
      lines.push(`  ${idx + 1}) ${asset.name || 'بدون اسم'}`);
      pushAssetFields(lines, asset, '     ', includePasswords);
    });
  }

  lines.push('');
  lines.push('════════════════════════════════');
  lines.push('تقرير جدوى جرد المعدات — خزنة البنية');
  return lines.join('\n');
}

export function completenessScore(asset: Asset): {
  filled: number;
  total: number;
  pct: number;
} {
  const fields = fieldsForCategory(asset.category).filter(
    (f) => f !== 'password'
  );
  let filled = 0;
  for (const f of fields) {
    if (valueOf(asset, f)) filled += 1;
  }
  const total = fields.length || 1;
  return { filled, total, pct: Math.round((filled / total) * 100) };
}

export function categoryStats(
  assets: Asset[]
): Record<AssetCategory, { count: number; avgPct: number }> {
  const out = {} as Record<AssetCategory, { count: number; avgPct: number }>;
  for (const cat of CATEGORY_ORDER) {
    const items = assets.filter((a) => a.category === cat);
    const avg =
      items.length === 0
        ? 0
        : Math.round(
            items.reduce((s, a) => s + completenessScore(a).pct, 0) /
              items.length
          );
    out[cat] = { count: items.length, avgPct: avg };
  }
  return out;
}
