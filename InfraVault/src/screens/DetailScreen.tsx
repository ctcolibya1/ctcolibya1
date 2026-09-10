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
import { ar } from '../i18n/ar';
import { RootStackParamList } from '../types';
import {
  ALL_SHARE_FIELDS,
  ShareField,
  formatCredentialMessage,
  shareViaWhatsApp,
} from '../services/share';
import { colors, radii, spacing } from '../theme';
import { GhostButton, PrimaryButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const FIELD_LABELS: Record<ShareField, string> = {
  name: ar.name,
  host: ar.host,
  port: ar.port,
  username: ar.username,
  password: ar.password,
  protocol: ar.protocol,
  osOrFirmware: ar.osOrFirmware,
  location: ar.location,
  notes: ar.notes,
};

export function DetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { getById, deleteCredential } = useVault();
  const item = getById(id);
  const [showPassword, setShowPassword] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [fields, setFields] = useState<Record<ShareField, boolean>>(
    () =>
      Object.fromEntries(ALL_SHARE_FIELDS.map((f) => [f, true])) as Record<
        ShareField,
        boolean
      >
  );

  const rows = useMemo(() => {
    if (!item) return [];
    return [
      { label: ar.host, value: item.host },
      { label: ar.port, value: item.port },
      { label: ar.username, value: item.username },
      {
        label: ar.password,
        value: item.password
          ? showPassword
            ? item.password
            : '••••••••'
          : '',
        isPassword: true as const,
      },
      { label: ar.protocol, value: ar.protocolLabels[item.protocol] },
      { label: ar.osOrFirmware, value: item.osOrFirmware },
      { label: ar.location, value: item.location },
      { label: ar.notes, value: item.notes },
    ].filter((r) => !!r.value);
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

  const onDelete = () => {
    Alert.alert(ar.delete, ar.confirmDelete, [
      { text: ar.no, style: 'cancel' },
      {
        text: ar.yes,
        style: 'destructive',
        onPress: async () => {
          await deleteCredential(item.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const onShare = async () => {
    const selected = ALL_SHARE_FIELDS.filter((f) => fields[f]);
    const message = formatCredentialMessage(item, selected);
    setShareOpen(false);
    await shareViaWhatsApp(message);
  };

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

          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <View style={styles.rowHead}>
                <Text style={styles.label}>{row.label}</Text>
                {'isPassword' in row && row.isPassword && (
                  <Pressable onPress={() => setShowPassword((v) => !v)}>
                    <Text style={styles.link}>
                      {showPassword ? ar.hidePassword : ar.showPassword}
                    </Text>
                  </Pressable>
                )}
              </View>
              <Pressable
                onLongPress={async () => {
                  if ('isPassword' in row && row.isPassword) {
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
          ))}

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
              {ALL_SHARE_FIELDS.map((field) => (
                <View key={field} style={styles.switchRow}>
                  <Switch
                    value={fields[field]}
                    onValueChange={(v) =>
                      setFields((prev) => ({ ...prev, [field]: v }))
                    }
                    trackColor={{ true: colors.accentDim, false: colors.border }}
                    thumbColor={fields[field] ? colors.accent : colors.textDim}
                  />
                  <Text style={styles.switchLabel}>{FIELD_LABELS[field]}</Text>
                </View>
              ))}
              <View style={{ gap: 10, marginTop: 12 }}>
                <PrimaryButton label={ar.shareWhatsApp} onPress={onShare} />
                <GhostButton label={ar.cancel} onPress={() => setShareOpen(false)} />
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
    marginBottom: spacing.md,
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
  switchLabel: { color: colors.text, fontSize: 15 },
});
