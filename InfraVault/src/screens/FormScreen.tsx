import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import {
  ar,
  fieldsForCategory,
  labelForField,
  parentPickerTitle,
  PROTOCOL_ORDER,
  STATUS_ORDER,
} from '../i18n/ar';
import {
  Asset,
  AssetStatus,
  EMPTY_ASSET_FIELDS,
  HYPERVISOR_VENDORS,
  MANUFACTURERS,
  Protocol,
  requiredParentCategory,
  RootStackParamList,
} from '../types';
import { colors, radii, spacing } from '../theme';
import { Field, GhostButton, PrimaryButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;
type FormData = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>;

function sectionOf(field: keyof Asset): string {
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

export function FormScreen({ navigation, route }: Props) {
  const { id, category: initialCategory, parentId: presetParent } = route.params;
  const { getById, addCredential, updateCredential, credentials } = useVault();
  const existing = id ? getById(id) : undefined;
  const category = existing?.category ?? initialCategory ?? 'servers';
  const parentCat = requiredParentCategory(category);

  const parentOptions = useMemo(() => {
    if (!parentCat) return [];
    return credentials.filter((c) => c.category === parentCat);
  }, [credentials, parentCat]);

  const vendorList =
    category === 'hypervisor' ? HYPERVISOR_VENDORS : MANUFACTURERS;

  const [form, setForm] = useState<FormData>({
    ...EMPTY_ASSET_FIELDS,
    category,
    parentId: existing?.parentId ?? presetParent ?? '',
    protocol: existing?.protocol ?? (category === 'os' ? 'rdp' : 'ssh'),
    status: existing?.status ?? 'active',
    name: existing?.name ?? '',
    manufacturer: existing?.manufacturer ?? '',
    model: existing?.model ?? '',
    serialNumber: existing?.serialNumber ?? '',
    serviceTag: existing?.serviceTag ?? '',
    cpu: existing?.cpu ?? '',
    ram: existing?.ram ?? '',
    storage: existing?.storage ?? '',
    networkPorts: existing?.networkPorts ?? '',
    firmware: existing?.firmware ?? '',
    osOrSystems: existing?.osOrSystems ?? '',
    location: existing?.location ?? '',
    rack: existing?.rack ?? '',
    department: existing?.department ?? '',
    role: existing?.role ?? '',
    managementIp: existing?.managementIp ?? '',
    host: existing?.host ?? '',
    port: existing?.port ?? '',
    username: existing?.username ?? '',
    password: existing?.password ?? '',
    purchaseDate: existing?.purchaseDate ?? '',
    warrantyExpiry: existing?.warrantyExpiry ?? '',
    notes: existing?.notes ?? '',
  });
  const [busy, setBusy] = useState(false);

  const visibleFields = useMemo(
    () => fieldsForCategory(category) as (keyof FormData)[],
    [category]
  );
  const knownVendors = vendorList.filter((m) => m !== 'Other');

  const patch = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const formValue = (field: keyof FormData): string => {
    const v = form[field];
    return v == null ? '' : String(v);
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('', ar.required);
      return;
    }
    if (parentCat && !form.parentId) {
      Alert.alert('', ar.parentRequired);
      return;
    }
    setBusy(true);
    try {
      const payload: FormData = {
        ...form,
        category,
        parentId: parentCat ? form.parentId : '',
        name: form.name.trim(),
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        serialNumber: form.serialNumber.trim(),
        serviceTag: form.serviceTag.trim(),
        cpu: form.cpu.trim(),
        ram: form.ram.trim(),
        storage: form.storage.trim(),
        networkPorts: form.networkPorts.trim(),
        firmware: form.firmware.trim(),
        osOrSystems: form.osOrSystems.trim(),
        location: form.location.trim(),
        rack: form.rack.trim(),
        department: form.department.trim(),
        role: form.role.trim(),
        managementIp: form.managementIp.trim(),
        host: form.host.trim(),
        port: form.port.trim(),
        username: form.username.trim(),
        purchaseDate: form.purchaseDate.trim(),
        warrantyExpiry: form.warrantyExpiry.trim(),
        notes: form.notes.trim(),
      };
      if (existing) {
        await updateCredential(existing.id, payload);
        navigation.goBack();
      } else {
        const item = await addCredential(payload);
        navigation.replace('Detail', { id: item.id });
      }
    } finally {
      setBusy(false);
    }
  };

  let lastSection = '';

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.link}>{ar.cancel}</Text>
          </Pressable>
          <Text style={styles.title}>
            {existing ? ar.editEntry : ar.newEntry}
          </Text>
          <Text style={styles.cat}>{ar.categoryLabels[category]}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {parentCat ? (
            <View style={styles.parentBox}>
              <Text style={styles.section}>{ar.sectionRelation}</Text>
              <Text style={styles.fieldLabel}>
                {parentPickerTitle(category)}
              </Text>
              {parentOptions.length === 0 ? (
                <Text style={styles.warn}>{ar.noParentsAvailable}</Text>
              ) : (
                <View style={styles.chips}>
                  {parentOptions.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => patch('parentId', p.id)}
                      style={[
                        styles.chip,
                        form.parentId === p.id && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.parentId === p.id && styles.chipTextActive,
                        ]}
                      >
                        {p.name}
                        {p.host ? ` (${p.host})` : ''}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {visibleFields.map((field) => {
            const section = sectionOf(field);
            const showSection = section !== lastSection;
            lastSection = section;

            if (field === 'manufacturer') {
              const isCustom =
                !!form.manufacturer &&
                !knownVendors.includes(
                  form.manufacturer as (typeof knownVendors)[number]
                );
              return (
                <View key={field}>
                  {showSection ? (
                    <Text style={styles.section}>{section}</Text>
                  ) : null}
                  <Text style={styles.fieldLabel}>
                    {labelForField('manufacturer', category)}
                  </Text>
                  <View style={styles.chips}>
                    {vendorList.map((m) => {
                      const active =
                        m === 'Other'
                          ? !form.manufacturer || isCustom
                          : form.manufacturer === m;
                      return (
                        <Pressable
                          key={m}
                          onPress={() =>
                            patch('manufacturer', m === 'Other' ? '' : m)
                          }
                          style={[styles.chip, active && styles.chipActive]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive,
                            ]}
                          >
                            {m}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {(!form.manufacturer || isCustom) && (
                    <Field
                      label="أخرى / اكتب الاسم"
                      value={isCustom ? form.manufacturer : ''}
                      onChangeText={(v) => patch('manufacturer', v)}
                    />
                  )}
                </View>
              );
            }

            if (field === 'protocol') {
              return (
                <View key={field}>
                  {showSection ? (
                    <Text style={styles.section}>{section}</Text>
                  ) : null}
                  <Text style={styles.fieldLabel}>{ar.protocol}</Text>
                  <View style={styles.chips}>
                    {PROTOCOL_ORDER.map((p) => (
                      <Pressable
                        key={p}
                        onPress={() => patch('protocol', p as Protocol)}
                        style={[
                          styles.chip,
                          form.protocol === p && styles.chipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            form.protocol === p && styles.chipTextActive,
                          ]}
                        >
                          {ar.protocolLabels[p]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            }

            if (field === 'status') {
              return (
                <View key={field}>
                  {showSection ? (
                    <Text style={styles.section}>{section}</Text>
                  ) : null}
                  <Text style={styles.fieldLabel}>{ar.status}</Text>
                  <View style={styles.chips}>
                    {STATUS_ORDER.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => patch('status', s as AssetStatus)}
                        style={[
                          styles.chip,
                          form.status === s && styles.chipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            form.status === s && styles.chipTextActive,
                          ]}
                        >
                          {ar.statusLabels[s]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            }

            const multiline = field === 'notes' || field === 'osOrSystems';
            return (
              <View key={field}>
                {showSection ? (
                  <Text style={styles.section}>{section}</Text>
                ) : null}
                <Field
                  label={labelForField(field, category)}
                  value={formValue(field)}
                  onChangeText={(v) => patch(field, v as never)}
                  secureTextEntry={field === 'password'}
                  autoCapitalize={
                    ['host', 'managementIp', 'username', 'password'].includes(
                      field
                    )
                      ? 'none'
                      : 'sentences'
                  }
                  keyboardType={
                    field === 'port'
                      ? 'number-pad'
                      : field === 'host' || field === 'managementIp'
                        ? 'url'
                        : 'default'
                  }
                  multiline={multiline}
                  style={
                    multiline
                      ? { minHeight: 90, textAlignVertical: 'top' }
                      : undefined
                  }
                />
              </View>
            );
          })}

          <View style={{ gap: 10, marginTop: spacing.md }}>
            <PrimaryButton
              label={ar.save}
              onPress={onSave}
              disabled={busy || (parentCat !== null && parentOptions.length === 0)}
            />
            <GhostButton
              label={ar.cancel}
              onPress={() => navigation.goBack()}
            />
          </View>
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
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  cat: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  link: { color: colors.accent, fontWeight: '600' },
  form: { padding: spacing.md, paddingBottom: 48 },
  parentBox: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  section: {
    color: colors.accent,
    textAlign: 'right',
    marginTop: spacing.md,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
  },
  fieldLabel: {
    color: colors.textMuted,
    marginBottom: 6,
    textAlign: 'right',
    fontSize: 13,
  },
  warn: {
    color: colors.danger,
    textAlign: 'right',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
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
});
