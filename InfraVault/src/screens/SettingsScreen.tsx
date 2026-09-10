import React, { useState } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { ar } from '../i18n/ar';
import { RootStackParamList } from '../types';
import { colors, radii, spacing } from '../theme';
import { GhostButton, PinPad, PrimaryButton, Screen } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const {
    settings,
    biometricsAvailable,
    setBiometricsEnabled,
    changePin,
    lock,
    credentials,
  } = useVault();

  const [pinModal, setPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'old' | 'new' | 'confirm'>('old');

  const resetPinFlow = () => {
    setPinModal(false);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setStep('old');
  };

  const onToggleBio = async (value: boolean) => {
    if (!biometricsAvailable) {
      Alert.alert('', 'البصمة غير متاحة على هذا الجهاز');
      return;
    }
    await setBiometricsEnabled(value);
  };

  const advancePin = async () => {
    try {
      if (step === 'old') {
        if (oldPin.length < 4) return;
        setStep('new');
        return;
      }
      if (step === 'new') {
        if (newPin.length < 4) {
          Alert.alert('', 'رمز PIN يجب أن يكون 4 أرقام على الأقل');
          return;
        }
        setStep('confirm');
        return;
      }
      if (confirmPin !== newPin) {
        Alert.alert('', ar.pinMismatch);
        setConfirmPin('');
        return;
      }
      await changePin(oldPin, newPin);
      Alert.alert('', 'تم تغيير رمز PIN');
      resetPinFlow();
    } catch {
      Alert.alert('', ar.wrongPin);
      setOldPin('');
      setStep('old');
    }
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.link}>رجوع</Text>
          </Pressable>
          <Text style={styles.title}>{ar.settings}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.stat}>{credentials.length}</Text>
            <Text style={styles.statLabel}>إجمالي السجلات المحفوظة</Text>
          </View>

          <View style={styles.row}>
            <Switch
              value={!!settings?.biometricsEnabled}
              onValueChange={onToggleBio}
              trackColor={{ true: colors.accentDim, false: colors.border }}
              thumbColor={
                settings?.biometricsEnabled ? colors.accent : colors.textDim
              }
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{ar.biometrics}</Text>
              <Text style={styles.rowHint}>
                فتح الخزنة ببصمة الوجه أو الإصبع بعد أول إدخال لـ PIN
              </Text>
            </View>
          </View>

          <Pressable style={styles.row} onPress={() => setPinModal(true)}>
            <Text style={styles.chevron}>‹</Text>
            <Text style={styles.rowTitle}>{ar.changePin}</Text>
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={async () => {
              await lock();
            }}
          >
            <Text style={[styles.rowTitle, { color: colors.warning }]}>
              {ar.lockNow}
            </Text>
          </Pressable>

          <View style={styles.about}>
            <Text style={styles.aboutTitle}>{ar.about}</Text>
            <Text style={styles.aboutText}>{ar.aboutText}</Text>
          </View>
        </ScrollView>

        <Modal visible={pinModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                {step === 'old'
                  ? 'أدخل PIN الحالي'
                  : step === 'new'
                    ? 'أدخل PIN الجديد'
                    : ar.confirmPin}
              </Text>
              <PinPad
                value={
                  step === 'old' ? oldPin : step === 'new' ? newPin : confirmPin
                }
                onChange={
                  step === 'old'
                    ? setOldPin
                    : step === 'new'
                      ? setNewPin
                      : setConfirmPin
                }
              />
              <View style={{ gap: 10, marginTop: 12 }}>
                <PrimaryButton label="متابعة" onPress={advancePin} />
                <GhostButton label={ar.cancel} onPress={resetPinFlow} />
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
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  link: { color: colors.accent, fontWeight: '600' },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.accentDim,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  stat: {
    color: colors.accent,
    fontSize: 36,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 10,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  rowHint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  chevron: {
    color: colors.textDim,
    fontSize: 22,
  },
  about: {
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  aboutTitle: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 8,
  },
  aboutText: {
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
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
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
