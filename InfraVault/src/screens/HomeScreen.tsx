import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { ar, CATEGORY_ORDER } from '../i18n/ar';
import { AssetCategory, RootStackParamList } from '../types';
import { categoryColors, colors, radii, spacing } from '../theme';
import { Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { credentials, lock } = useVault();
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const map: Record<AssetCategory, number> = {
      servers: 0,
      os: 0,
      hypervisor: 0,
      vm: 0,
      switches: 0,
      routers: 0,
      firewalls: 0,
    };
    for (const c of credentials) map[c.category] += 1;
    return map;
  }, [credentials]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return credentials.filter((c) =>
      [c.name, c.host, c.username, c.location, c.notes]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [credentials, query]);

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={12}>
              <Text style={styles.headerAction}>{ar.settings}</Text>
            </Pressable>
            <View>
              <Text style={styles.brand}>IV · {ar.appName}</Text>
              <Text style={styles.tagline}>{ar.appTagline}</Text>
            </View>
            <Pressable onPress={() => lock()} hitSlop={12}>
              <Text style={styles.headerAction}>قفل</Text>
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={ar.search}
            placeholderTextColor={colors.textDim}
            style={styles.search}
            textAlign="right"
          />
        </View>

        {query.trim() ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>{ar.noResults}</Text>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.searchRow}
                onPress={() => navigation.navigate('Detail', { id: item.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchName}>{item.name}</Text>
                  <Text style={styles.searchMeta}>
                    {ar.categoryLabels[item.category]}
                    {item.host ? ` · ${item.host}` : ''}
                  </Text>
                </View>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: categoryColors[item.category] },
                  ]}
                />
              </Pressable>
            )}
          />
        ) : (
          <FlatList
            data={CATEGORY_ORDER}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={styles.catRow}
                onPress={() => navigation.navigate('Category', { category: item })}
              >
                <View style={styles.catText}>
                  <Text style={styles.catTitle}>{ar.categoryLabels[item]}</Text>
                  <Text style={styles.catHint}>{ar.categoryHints[item]}</Text>
                </View>
                <View style={styles.catMeta}>
                  <Text style={styles.catCount}>
                    {counts[item]} {ar.count}
                  </Text>
                  <View
                    style={[
                      styles.catBadge,
                      { backgroundColor: categoryColors[item] },
                    ]}
                  />
                </View>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  brand: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    maxWidth: 220,
  },
  headerAction: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  search: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 40,
    gap: 10,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 10,
  },
  catText: { flex: 1 },
  catTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  catHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 4,
  },
  catMeta: { alignItems: 'flex-start', marginLeft: spacing.md, gap: 8 },
  catCount: { color: colors.textDim, fontSize: 12 },
  catBadge: { width: 10, height: 10, borderRadius: 5 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 8,
  },
  searchName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  searchMeta: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 12 },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
