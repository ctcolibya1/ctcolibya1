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
import { ar, PROTOCOL_ORDER } from '../i18n/ar';
import { Protocol, RootStackParamList } from '../types';
import { colors, radii, spacing } from '../theme';
import { Field, GhostButton, PrimaryButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;

export function FormScreen({ navigation, route }: Props) {
  const { id, category: initialCategory } = route.params;
  const { getById, addCredential, updateCredential } = useVault();
  const existing = id ? getById(id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [host, setHost] = useState(existing?.host ?? '');
  const [port, setPort] = useState(existing?.port ?? '');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [password, setPassword] = useState(existing?.password ?? '');
  const [protocol, setProtocol] = useState<Protocol>(existing?.protocol ?? 'ssh');
  const [osOrFirmware, setOsOrFirmware] = useState(existing?.osOrFirmware ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [busy, setBusy] = useState(false);

  const category = existing?.category ?? initialCategory ?? 'servers';

  const title = useMemo(
    () => (existing ? ar.editEntry : ar.newEntry),
    [existing]
  );

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('', ar.required);
      return;
    }
    setBusy(true);
    try {
      if (existing) {
        await updateCredential(existing.id, {
          name: name.trim(),
          host: host.trim(),
          port: port.trim(),
          username: username.trim(),
          password,
          protocol,
          osOrFirmware: osOrFirmware.trim(),
          location: location.trim(),
          notes: notes.trim(),
        });
        navigation.goBack();
      } else {
        const item = await addCredential({
          category,
          name: name.trim(),
          host: host.trim(),
          port: port.trim(),
          username: username.trim(),
          password,
          protocol,
          osOrFirmware: osOrFirmware.trim(),
          location: location.trim(),
          notes: notes.trim(),
        });
        navigation.replace('Detail', { id: item.id });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.link}>{ar.cancel}</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.cat}>{ar.categoryLabels[category]}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Field label={ar.name} value={name} onChangeText={setName} />
          <Field
            label={ar.host}
            value={host}
            onChangeText={setHost}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Field
            label={ar.port}
            value={port}
            onChangeText={setPort}
            keyboardType="number-pad"
          />
          <Field
            label={ar.username}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field
            label={ar.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.section}>{ar.protocol}</Text>
          <View style={styles.chips}>
            {PROTOCOL_ORDER.map((p) => (
              <Pressable
                key={p}
                onPress={() => setProtocol(p)}
                style={[styles.chip, protocol === p && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    protocol === p && styles.chipTextActive,
                  ]}
                >
                  {ar.protocolLabels[p]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Field
            label={ar.osOrFirmware}
            value={osOrFirmware}
            onChangeText={setOsOrFirmware}
          />
          <Field
            label={ar.location}
            value={location}
            onChangeText={setLocation}
          />
          <Field
            label={ar.notes}
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 90, textAlignVertical: 'top' }}
          />

          <View style={{ gap: 10, marginTop: spacing.md }}>
            <PrimaryButton label={ar.save} onPress={onSave} disabled={busy} />
            <GhostButton label={ar.cancel} onPress={() => navigation.goBack()} />
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
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: 8,
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
