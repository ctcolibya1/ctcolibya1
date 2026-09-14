import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { ar, CATEGORY_ORDER, labelForField } from '../i18n/ar';
import { Asset, AssetCategory, RootStackParamList } from '../types';
import {
  REPORT_FIELDS,
  assetLinesForFields,
  buildFeasibilityReport,
  categoryStats,
  completenessScore,
  filterAssetsForReport,
  resolveReportFields,
} from '../services/report';
import { shareViaWhatsApp } from '../services/share';
import { colors, radii, spacing } from '../theme';
import { GhostButton, PrimaryButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

const DEFAULT_FIELDS = REPORT_FIELDS.filter((f) => f !== 'password');

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function ReportScreen({ navigation }: Props) {
  const { credentials } = useVault();

  const [selectedCategories, setSelectedCategories] =
    useState<AssetCategory[]>([...CATEGORY_ORDER]);
  const [selectedFields, setSelectedFields] =
    useState<(keyof Asset)[]>(DEFAULT_FIELDS);
  const [includePasswords, setIncludePasswords] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const activeFields = useMemo(
    () => resolveReportFields(selectedFields, includePasswords),
    [selectedFields, includePasswords]
  );

  const filteredAssets = useMemo(
    () => filterAssetsForReport(credentials, selectedCategories),
    [credentials, selectedCategories]
  );

  const stats = useMemo(
    () => categoryStats(filteredAssets, activeFields),
    [filteredAssets, activeFields]
  );

  const overallPct = useMemo(() => {
    if (filteredAssets.length === 0) return 0;
    return Math.round(
      filteredAssets.reduce(
        (sum, asset) => sum + completenessScore(asset, activeFields).pct,
        0
      ) / filteredAssets.length
    );
  }, [filteredAssets, activeFields]);

  const previewText = useMemo(
    () =>
      buildFeasibilityReport(credentials, {
        categories: selectedCategories,
        fields: selectedFields,
        includePasswords,
        skipEmpty: !showEmpty,
      }),
    [
      credentials,
      selectedCategories,
      selectedFields,
      includePasswords,
      showEmpty,
    ]
  );

  const onShare = async () => {
    await shareViaWhatsApp(previewText);
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
                  <Text style={styles.statNum}>{filteredAssets.length}</Text>
                  <Text style={styles.statLabel}>{ar.reportSelectedAssets}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{overallPct}%</Text>
                  <Text style={styles.statLabel}>{ar.dataCompleteness}</Text>
                </View>
              </View>

              <View style={styles.sectionHead}>
                <View style={styles.rowActions}>
                  <Pressable
                    onPress={() => setSelectedCategories([...CATEGORY_ORDER])}
                  >
                    <Text style={styles.miniLink}>{ar.reportSelectAll}</Text>
                  </Pressable>
                  <Text style={styles.dot}>·</Text>
                  <Pressable
                    onPress={() => {
                      const first =
                        CATEGORY_ORDER.find((c) =>
                          credentials.some((a) => a.category === c)
                        ) ?? 'servers';
                      setSelectedCategories([first]);
                    }}
                  >
                    <Text style={styles.miniLink}>{ar.reportClearAll}</Text>
                  </Pressable>
                </View>
                <Text style={styles.section}>{ar.reportSelectCategories}</Text>
              </View>

              <View style={styles.chips}>
                {CATEGORY_ORDER.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  const count = credentials.filter(
                    (c) => c.category === cat
                  ).length;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() =>
                        setSelectedCategories((prev) => {
                          const next = toggleItem(prev, cat);
                          return next.length === 0 ? prev : next;
                        })
                      }
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {ar.categoryLabels[cat]} ({count})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sectionHead}>
                <View style={styles.rowActions}>
                  <Pressable
                    onPress={() => setSelectedFields([...DEFAULT_FIELDS])}
                  >
                    <Text style={styles.miniLink}>{ar.reportSelectAll}</Text>
                  </Pressable>
                  <Text style={styles.dot}>·</Text>
                  <Pressable onPress={() => setSelectedFields(['name'])}>
                    <Text style={styles.miniLink}>{ar.reportClearAll}</Text>
                  </Pressable>
                </View>
                <Text style={styles.section}>{ar.reportSelectFields}</Text>
              </View>

              {DEFAULT_FIELDS.map((field) => {
                const on = selectedFields.includes(field);
                return (
                  <View key={String(field)} style={styles.switchRow}>
                    <Switch
                      value={on}
                      onValueChange={() =>
                        setSelectedFields((prev) => {
                          const next = toggleItem(prev, field);
                          return next.length === 0 ? prev : next;
                        })
                      }
                      trackColor={{
                        true: colors.accentDim,
                        false: colors.border,
                      }}
                      thumbColor={on ? colors.accent : colors.textDim}
                    />
                    <Text style={styles.switchLabel}>
                      {labelForField(field)}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.switchRow}>
                <Switch
                  value={includePasswords}
                  onValueChange={setIncludePasswords}
                  trackColor={{ true: colors.accentDim, false: colors.border }}
                  thumbColor={
                    includePasswords ? colors.accent : colors.textDim
                  }
                />
                <Text style={styles.switchLabel}>
                  {ar.reportIncludePasswords}
                </Text>
              </View>

              <View style={styles.switchRow}>
                <Switch
                  value={showEmpty}
                  onValueChange={setShowEmpty}
                  trackColor={{ true: colors.accentDim, false: colors.border }}
                  thumbColor={showEmpty ? colors.accent : colors.textDim}
                />
                <Text style={styles.switchLabel}>{ar.reportShowEmpty}</Text>
              </View>

              <Text style={[styles.section, { marginTop: spacing.md }]}>
                {ar.byCategory}
              </Text>
              {selectedCategories.map((cat) => (
                <View key={cat} style={styles.catRow}>
                  <Text style={styles.catName}>{ar.categoryLabels[cat]}</Text>
                  <Text style={styles.catMeta}>
                    {stats[cat].count} {ar.count} · {stats[cat].avgPct}%
                  </Text>
                </View>
              ))}

              <Text style={[styles.section, { marginTop: spacing.md }]}>
                {ar.assetDetails}
              </Text>
              {selectedCategories.map((cat) => {
                const items = filteredAssets.filter((c) => c.category === cat);
                if (items.length === 0) return null;
                return (
                  <View key={`detail-${cat}`} style={styles.catBlock}>
                    <Text style={styles.catBlockTitle}>
                      {ar.categoryLabels[cat]} ({items.length})
                    </Text>
                    {items.map((asset) => {
                      const score = completenessScore(asset, activeFields);
                      const lines = assetLinesForFields(
                        asset,
                        selectedFields,
                        includePasswords,
                        !showEmpty
                      );
                      return (
                        <View key={asset.id} style={styles.assetCard}>
                          <View style={styles.assetHead}>
                            <Text style={styles.assetName}>
                              {asset.name || ar.reportUnnamed}
                            </Text>
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

              <Text style={[styles.section, { marginTop: spacing.md }]}>
                {ar.reportPreview}
              </Text>
              <View style={styles.previewBox}>
                <Text style={styles.previewText}>{previewText}</Text>
              </View>

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
  sectionHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: 10,
  },
  section: {
    color: colors.accent,
    fontWeight: '700',
    textAlign: 'right',
  },
  rowActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  miniLink: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  dot: { color: colors.textDim },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgElevated,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  chipText: { color: colors.textMuted, fontSize: 13 },
  chipTextActive: { color: colors.accent, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: 8,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    marginRight: 12,
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
  previewBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    maxHeight: 280,
  },
  previewText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'left',
    writingDirection: 'ltr',
    lineHeight: 18,
  },
});
