import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { ar, labelForField } from '../i18n/ar';
import { Asset, AssetCategory, RootStackParamList } from '../types';
import { categoryColors, colors, radii, spacing } from '../theme';
import { Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Category'>;

function metaForItem(item: Asset): string {
  switch (item.category) {
    case 'servers':
      return (
        [item.serialNumber, item.manufacturer, item.model]
          .filter(Boolean)
          .join(' · ') ||
        [item.host, item.managementIp].filter(Boolean).join(' · ') ||
        ar.protocolLabels[item.protocol]
      );
    case 'hypervisor':
      return (
        [item.manufacturer, item.model, item.role]
          .filter(Boolean)
          .join(' · ') ||
        item.host ||
        ar.protocolLabels[item.protocol]
      );
    case 'vm':
      return (
        [item.osOrSystems, item.cpu && `${labelForField('cpu', 'vm')}: ${item.cpu}`, item.ram && `${labelForField('ram', 'vm')}: ${item.ram}`]
          .filter(Boolean)
          .join(' · ') ||
        item.host ||
        ar.statusLabels[item.status]
      );
    case 'os':
      return (
        [item.model, item.role, item.department]
          .filter(Boolean)
          .join(' · ') ||
        item.host ||
        ar.statusLabels[item.status]
      );
    default:
      return (
        [item.model, item.serialNumber, item.manufacturer]
          .filter(Boolean)
          .join(' · ') ||
        [item.host, item.username].filter(Boolean).join(' · ') ||
        ar.protocolLabels[item.protocol]
      );
  }
}

function parentSubtitle(
  item: Asset,
  getById: (id: string) => Asset | undefined
): string | null {
  if (!item.parentId) return null;
  const parent = getById(item.parentId);
  if (!parent) return null;
  if (item.category === 'hypervisor' || item.category === 'os') {
    return `${ar.onServer}: ${parent.name}`;
  }
  if (item.category === 'vm') {
    return `${ar.onHypervisor}: ${parent.name}`;
  }
  return `على: ${parent.name}`;
}

export function CategoryScreen({ navigation, route }: Props) {
  const { category } = route.params;
  const { credentials, getById } = useVault();

  const items = useMemo(
    () => credentials.filter((c) => c.category === category),
    [credentials, category]
  );

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.link}>رجوع</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{ar.categoryLabels[category]}</Text>
            <Text style={styles.hint}>{ar.categoryHints[category]}</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Form', { category })}
            style={styles.addBtn}
          >
            <Text style={styles.addText}>+</Text>
          </Pressable>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{ar.emptyCategory}</Text>
              <Text style={styles.emptyHint}>{ar.emptyHint}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const subtitle = parentSubtitle(item, getById);
            return (
              <Pressable
                style={styles.row}
                onPress={() => navigation.navigate('Detail', { id: item.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  {subtitle ? (
                    <Text style={styles.parentLine}>{subtitle}</Text>
                  ) : null}
                  <Text style={styles.meta}>{metaForItem(item)}</Text>
                </View>
                <View
                  style={[
                    styles.stripe,
                    {
                      backgroundColor:
                        categoryColors[category as AssetCategory] ??
                        colors.accent,
                    },
                  ]}
                />
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  link: { color: colors.accent, fontWeight: '600' },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  addText: { color: colors.accent, fontSize: 24, fontWeight: '700', marginTop: -2 },
  list: { padding: spacing.md, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    paddingTop: 14,
    paddingHorizontal: 14,
  },
  parentLine: {
    color: colors.accent,
    fontSize: 12,
    textAlign: 'right',
    paddingHorizontal: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
    paddingBottom: 14,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  stripe: { width: 4 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyHint: {
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
