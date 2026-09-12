import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { ar, fieldsForCategory, labelForField } from '../i18n/ar';
import { Asset, AssetCategory, RootStackParamList } from '../types';
import {
  ALL_SHARE_FIELDS,
  ShareField,
  formatCredentialMessage,
  shareViaWhatsApp,
} from '../services/share';
import { colors, radii, spacing } from '../theme';
import { GhostButton, PrimaryButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

type DetailRow = {
  field: keyof Asset;
  label: string;
  value: string;
  section: string;
  isPassword?: boolean;
};

function sectionOf(field: keyof Asset): string {
  if (field === 'parentId') return ar.sectionRelation;
  if (
    ['name', 'manufacturer', 'model', 'serialNumber', 'serviceTag'].includes(
      field
    )
  ) {
    return ar.sectionIdentity;
  }
  if (
    [
      'cpu',
      'ram',
      'storage',
      'networkPorts',
      'firmware',
      'osOrSystems',
    ].includes(field)
  ) {
    return ar.sectionSpecs;
  }
  if (['location', 'rack', 'department', 'role', 'status'].includes(field)) {
    return ar.sectionOps;
  }
  if (
    [
      'managementIp',
      'host',
      'port',
      'protocol',
      'username',
      'password',
    ].includes(field)
  ) {
    return ar.sectionAccess;
  }
  return ar.sectionLifecycle;
}

function displayValue(item: Asset, field: keyof Asset, showPassword: boolean): string {
  if (field === 'protocol') return ar.protocolLabels[item.protocol];
  if (field === 'status') return ar.statusLabels[item.status];
  if (field === 'password') {
    if (!item.password) return '';
    return showPassword ? item.password : '••••••••';
  }
  if (field === 'parentId') return '';
  return String(item[field] ?? '').trim();
}

function childAddActions(
  category: AssetCategory
): { label: string; childCategory: AssetCategory }[] {
  if (category === 'servers') {
    return [
      { label: ar.addHypervisor, childCategory: 'hypervisor' },
      { label: ar.addOs, childCategory: 'os' },
    ];
  }
  if (category === 'hypervisor') {
    return [{ label: ar.addVm, childCategory: 'vm' }];
  }
  return [];
}

export function DetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { getById, getChildren, deleteCredential } = useVault();
  const item = getById(id);
  const parent = item?.parentId ? getById(item.parentId) : undefined;
  const children = item ? getChildren(item.id) : [];
  const [showPassword, setShowPassword] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [fields, setFields] = useState<Record<ShareField, boolean>>(
    () =>
      Object.fromEntries(ALL_SHARE_FIELDS.map((f) => [f, true])) as Record<
        ShareField,
        boolean
      >
  );

  const rows = useMemo((): DetailRow[] => {
    if (!item) return [];
    const out: DetailRow[] = [];
    for (const field of fieldsForCategory(item.category)) {
      const value = displayValue(item, field, showPassword);
      if (!value) continue;
      out.push({
        field,
        label: labelForField(field, item.category),
        value,
        section: sectionOf(field),
        isPassword: field === 'password',
      });
    }
    return out;
  }, [item, showPassword]);

  if (!item) {
    return (
      <Screen>
        <SafeAreaView>
          <Text style={styles.missing}>السجل غير موجود</Text>
          <GhostButton label="رجوع" onPress={() => navigation.goBack()} />
        </SafeAreaView>
      </Screen>
    );
  }

  const addActions = childAddActions(item.category);

  const onDelete = () => {
    if (children.length > 0) {
      Alert.alert('', ar.cannotDeleteHasChildren);
      return;
    }
    Alert.alert(ar.delete, ar.confirmDelete, [
      { text: ar.no, style: 'cancel' },
      {
        text: ar.yes,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCredential(item.id);
            navigation.goBack();
          } catch (e) {
            if (e instanceof Error && e.message === 'HAS_CHILDREN') {
              Alert.alert('', ar.cannotDeleteHasChildren);
              return;
            }
            throw e;
          }
        },
      },
    ]);
  };

  const onShare = async () => {
    const selected = ALL_SHARE_FIELDS.filter((f) => fields[f]);
    const message = formatCredentialMessage(
      item,
      selected,
      parent?.name
    );
    setShareOpen(false);
    await shareViaWhatsApp(message);
  };

  let lastSection = '';

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.link}>رجوع</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Form', { id: item.id })}
            hitSlop={12}
          >
            <Text style={styles.link}>{ar.edit}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.badge}>{ar.categoryLabels[item.category]}</Text>

          {parent ? (
            <Pressable
              style={styles.parentCard}
              onPress={() => navigation.navigate('Detail', { id: parent.id })}
            >
              <Text style={styles.section}>{ar.sectionRelation}</Text>
              <Text style={styles.label}>{ar.parent}</Text>
              <Text style={styles.parentName}>{parent.name}</Text>
              <Text style={styles.parentMeta}>
                {ar.categoryLabels[parent.category]}
              </Text>
            </Pressable>
          ) : null}

          {rows.map((row) => {
            const showSection = row.section !== lastSection;
            lastSection = row.section;
            return (
              <View key={String(row.field)}>
                {showSection ? (
                  <Text style={styles.section}>{row.section}</Text>
                ) : null}
                <View style={styles.row}>
                  <View style={styles.rowHead}>
                    <Text style={styles.label}>{row.label}</Text>
                    {row.isPassword && (
                      <Pressable onPress={() => setShowPassword((v) => !v)}>
                        <Text style={styles.link}>
                          {showPassword ? ar.hidePassword : ar.showPassword}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  <Pressable
                    onLongPress={async () => {
                      if (row.isPassword) {
                        await Clipboard.setStringAsync(item.password);
                      } else {
                        await Clipboard.setStringAsync(String(row.value));
                      }
                      Alert.alert('', ar.copied);
                    }}
                  >
                    <Text style={styles.value}>{row.value}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {(children.length > 0 || addActions.length > 0) && (
            <View style={styles.childrenBox}>
              <Text style={styles.section}>{ar.children}</Text>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={styles.childRow}
                  onPress={() =>
                    navigation.navigate('Detail', { id: child.id })
                  }
                >
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childMeta}>
                    {ar.categoryLabels[child.category]}
                    {child.host ? ` · ${child.host}` : ''}
                  </Text>
                </Pressable>
              ))}
              {addActions.map((action) => (
                <GhostButton
                  key={action.childCategory}
                  label={action.label}
                  onPress={() =>
                    navigation.navigate('Form', {
                      category: action.childCategory,
                      parentId: item.id,
                    })
                  }
                />
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <PrimaryButton
              label={ar.shareWhatsApp}
              onPress={() => setShareOpen(true)}
            />
            <GhostButton
              label={ar.copyPassword}
              onPress={async () => {
                await Clipboard.setStringAsync(item.password);
                Alert.alert('', ar.copied);
              }}
            />
            <PrimaryButton label={ar.delete} onPress={onDelete} danger />
          </View>
        </ScrollView>

        <Modal visible={shareOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>{ar.selectFieldsToShare}</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                {ALL_SHARE_FIELDS.map((field) => (
                  <View key={field} style={styles.switchRow}>
                    <Switch
                      value={fields[field]}
                      onValueChange={(v) =>
                        setFields((prev) => ({ ...prev, [field]: v }))
                      }
                      trackColor={{
                        true: colors.accentDim,
                        false: colors.border,
                      }}
                      thumbColor={fields[field] ? colors.accent : colors.textDim}
                    />
                    <Text style={styles.switchLabel}>
                      {labelForField(field, item.category)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <View style={{ gap: 10, marginTop: 12 }}>
                <PrimaryButton label={ar.shareWhatsApp} onPress={onShare} />
                <GhostButton
                  label={ar.cancel}
                  onPress={() => setShareOpen(false)}
                />
              </View>
            </View>
          </View>
        </Modal>
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
    gap: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  link: { color: colors.accent, fontWeight: '600' },
  content: { padding: spacing.md, paddingBottom: 48 },
  badge: {
    alignSelf: 'flex-end',
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  parentCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  parentName: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 4,
  },
  parentMeta: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  section: {
    color: colors.accent,
    textAlign: 'right',
    marginTop: spacing.md,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 10,
  },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { color: colors.textMuted, fontSize: 12, textAlign: 'right' },
  value: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  childrenBox: {
    marginTop: spacing.sm,
    gap: 10,
  },
  childRow: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  childName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  childMeta: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  actions: { gap: 10, marginTop: spacing.lg },
  missing: {
    color: colors.text,
    textAlign: 'center',
    marginVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: { color: colors.text, fontSize: 15, flex: 1, textAlign: 'right' },
});
