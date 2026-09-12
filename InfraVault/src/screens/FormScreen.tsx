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
  PROTOCOL_ORDER,
  STATUS_ORDER,
} from '../i18n/ar';
import {
  Asset,
  AssetStatus,
  EMPTY_ASSET_FIELDS,
  MANUFACTURERS,
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
  const { id, category: initialCategory } = route.params;
  const { getById, addCredential, updateCredential } = useVault();
  const existing = id ? getById(id) : undefined;
  const category = existing?.category ?? initialCategory ?? 'servers';

  const [form, setForm] = useState<FormData>({
    ...EMPTY_ASSET_FIELDS,
    category,
    protocol: existing?.protocol ?? 'ssh',
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

  const visibleFields = useMemo(() => fieldsForCategory(category), [category]);
  const knownMfr = MANUFACTURERS.filter((m) => m !== 'Other');

  const patch = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('', ar.required);
      return;
    }
    setBusy(true);
    try {
      const payload: FormData = {
        ...form,
        category,
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
          {visibleFields.map((field) => {
            const section = sectionOf(field);
            const showSection = section !== lastSection;
            lastSection = section;

            if (field === 'manufacturer') {
              const isCustom =
                !!form.manufacturer && !knownMfr.includes(form.manufacturer as typeof knownMfr[number]);
              return (
                <View key={field}>
                  {showSection ? (
                    <Text style={styles.section}>{section}</Text>
                  ) : null}
                  <Text style={styles.fieldLabel}>{ar.manufacturer}</Text>
                  <View style={styles.chips}>
                    {MANUFACTURERS.map((m) => {
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
                      label="مصنّع آخر"
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
                        onPress={() => patch('protocol', p)}
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
            const formKey = field as keyof FormData;
            return (
              <View key={field}>
                {showSection ? (
                  <Text style={styles.section}>{section}</Text>
                ) : null}
                <Field
                  label={labelForField(field)}
                  value={String(form[formKey] ?? '')}
                  onChangeText={(v) => patch(formKey, v as never)}
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
            <PrimaryButton label={ar.save} onPress={onSave} disabled={busy} />
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
