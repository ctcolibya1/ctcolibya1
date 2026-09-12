import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { ar, CATEGORY_ORDER, labelForField } from '../i18n/ar';
import { Asset, RootStackParamList } from '../types';
import {
  buildFeasibilityReport,
  categoryStats,
  completenessScore,
} from '../services/report';
import { shareViaWhatsApp } from '../services/share';
import { colors, radii, spacing } from '../theme';
import { GhostButton, PrimaryButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

const LIST_FIELDS: (keyof Asset)[] = [
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

function filledLines(asset: Asset): string[] {
  const lines: string[] = [];
  for (const field of LIST_FIELDS) {
    let val = '';
    if (field === 'protocol') val = ar.protocolLabels[asset.protocol];
    else if (field === 'status') val = ar.statusLabels[asset.status];
    else val = String(asset[field] ?? '').trim();
    if (!val) continue;
    lines.push(`${labelForField(field)}: ${val}`);
  }
  return lines;
}

export function ReportScreen({ navigation }: Props) {
  const { credentials } = useVault();
  const stats = useMemo(() => categoryStats(credentials), [credentials]);
  const overallPct = useMemo(() => {
    if (credentials.length === 0) return 0;
    return Math.round(
      credentials.reduce((s, a) => s + completenessScore(a).pct, 0) /
        credentials.length
    );
  }, [credentials]);

  const onShare = async () => {
    const message = buildFeasibilityReport(credentials);
    await shareViaWhatsApp(message);
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.link}>رجوع</Text>
          </Pressable>
          <Text style={styles.title}>{ar.report}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>{ar.reportTitle}</Text>
          <Text style={styles.sub}>{ar.reportSubtitle}</Text>

          {credentials.length === 0 ? (
            <Text style={styles.empty}>{ar.reportEmpty}</Text>
          ) : (
            <>
              <View style={styles.summary}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{credentials.length}</Text>
                  <Text style={styles.statLabel}>{ar.totalAssets}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{overallPct}%</Text>
                  <Text style={styles.statLabel}>اكتمال البيانات</Text>
                </View>
              </View>

              <Text style={styles.section}>حسب التصنيف</Text>
              {CATEGORY_ORDER.map((cat) => (
                <View key={cat} style={styles.catRow}>
                  <Text style={styles.catName}>{ar.categoryLabels[cat]}</Text>
                  <Text style={styles.catMeta}>
                    {stats[cat].count} {ar.count} · {stats[cat].avgPct}%
                  </Text>
                </View>
              ))}

              <Text style={styles.section}>تفاصيل المعدات</Text>
              {CATEGORY_ORDER.map((cat) => {
                const items = credentials.filter((c) => c.category === cat);
                if (items.length === 0) return null;
                return (
                  <View key={`detail-${cat}`} style={styles.catBlock}>
                    <Text style={styles.catBlockTitle}>
                      {ar.categoryLabels[cat]} ({items.length})
                    </Text>
                    {items.map((asset) => {
                      const score = completenessScore(asset);
                      const lines = filledLines(asset);
                      return (
                        <View key={asset.id} style={styles.assetCard}>
                          <View style={styles.assetHead}>
                            <Text style={styles.assetName}>{asset.name}</Text>
                            <Text style={styles.pct}>{score.pct}%</Text>
                          </View>
                          {lines.map((line) => (
                            <Text key={line} style={styles.assetLine}>
                              {line}
                            </Text>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                );
              })}

              <View style={{ gap: 10, marginTop: spacing.lg }}>
                <PrimaryButton label={ar.reportShare} onPress={onShare} />
                <GhostButton
                  label={ar.cancel}
                  onPress={() => navigation.goBack()}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  link: { color: colors.accent, fontWeight: '600' },
  content: { padding: spacing.md, paddingBottom: 48 },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
  },
  sub: {
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 48,
  },
  summary: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.accentDim,
    padding: spacing.md,
    alignItems: 'flex-end',
  },
  statNum: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  section: {
    color: colors.accent,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: spacing.md,
    marginBottom: 10,
  },
  catRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 8,
  },
  catName: { color: colors.text, fontWeight: '600' },
  catMeta: { color: colors.textMuted, fontSize: 13 },
  catBlock: { marginBottom: spacing.md },
  catBlockTitle: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 8,
  },
  assetCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 10,
  },
  assetHead: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  assetName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  pct: { color: colors.accent, fontWeight: '700', marginLeft: 8 },
  assetLine: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 3,
  },
});
