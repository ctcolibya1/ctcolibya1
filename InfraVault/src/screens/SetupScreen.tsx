import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { ar } from '../i18n/ar';
import { RootStackParamList } from '../types';
import { colors, spacing } from '../theme';
import { GhostButton, PinPad, PrimaryButton, Screen, Subtitle, Title } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

export function SetupScreen({}: Props) {
  const { setup } = useVault();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (step === 'create' && pin.length >= 4) {
      // wait for user to tap continue
    }
  }, [pin, step]);

  const goConfirm = () => {
    if (pin.length < 4) {
      Alert.alert('', 'رمز PIN يجب أن يكون 4 أرقام على الأقل');
      return;
    }
    setStep('confirm');
  };

  const finish = async () => {
    if (confirm !== pin) {
      Alert.alert('', ar.pinMismatch);
      setConfirm('');
      return;
    }
    setBusy(true);
    try {
      await setup(pin);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (step === 'confirm' && confirm.length === pin.length && pin.length >= 4) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm, step]);

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <View style={styles.brand}>
          <Text style={styles.brandMark}>IV</Text>
          <Title>{ar.setupTitle}</Title>
          <Subtitle>{ar.setupSubtitle}</Subtitle>
        </View>

        <Text style={styles.hint}>
          {step === 'create' ? ar.enterPin : ar.confirmPin}
        </Text>

        <PinPad
          value={step === 'create' ? pin : confirm}
          onChange={step === 'create' ? setPin : setConfirm}
        />

        <View style={styles.actions}>
          {step === 'create' ? (
            <PrimaryButton
              label="متابعة"
              onPress={goConfirm}
              disabled={pin.length < 4 || busy}
            />
          ) : (
            <GhostButton
              label="رجوع"
              onPress={() => {
                setStep('create');
                setConfirm('');
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: spacing.lg },
  brand: { marginBottom: spacing.xl },
  brandMark: {
    alignSelf: 'flex-end',
    color: colors.accent,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontSize: 15,
  },
  actions: { marginTop: 'auto', marginBottom: spacing.lg, gap: spacing.sm },
});
