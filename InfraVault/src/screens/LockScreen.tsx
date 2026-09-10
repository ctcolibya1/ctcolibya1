import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '../context/VaultContext';
import { ar } from '../i18n/ar';
import { RootStackParamList } from '../types';
import { colors, spacing } from '../theme';
import { GhostButton, PinPad, Screen, Subtitle, Title } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Lock'>;

export function LockScreen({}: Props) {
  const { unlock, unlockWithBiometrics, settings, biometricsAvailable } = useVault();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const tryUnlock = async (value: string) => {
    if (value.length < 4 || busy) return;
    setBusy(true);
    setError('');
    try {
      const ok = await unlock(value);
      if (!ok) {
        setError(ar.wrongPin);
        setPin('');
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (pin.length >= 4) {
      tryUnlock(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  useEffect(() => {
    if (settings?.biometricsEnabled && biometricsAvailable) {
      unlockWithBiometrics();
    }
  }, [settings, biometricsAvailable, unlockWithBiometrics]);

  return (
    <Screen>
      <SafeAreaView style={styles.safe}>
        <View style={styles.brand}>
          <Text style={styles.brandMark}>IV</Text>
          <Title>{ar.appName}</Title>
          <Subtitle>{ar.appTagline}</Subtitle>
        </View>

        <Text style={styles.hint}>{ar.enterPin}</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}

        <PinPad value={pin} onChange={setPin} />

        {settings?.biometricsEnabled && biometricsAvailable && (
          <View style={styles.actions}>
            <GhostButton
              label={ar.useBiometrics}
              onPress={async () => {
                const ok = await unlockWithBiometrics();
                if (!ok) Alert.alert('', 'تعذر التحقق بالبصمة');
              }}
            />
          </View>
        )}
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
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actions: { marginTop: 'auto', marginBottom: spacing.lg },
});
