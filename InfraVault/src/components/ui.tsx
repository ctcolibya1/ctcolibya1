import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        danger && styles.dangerBtn,
        (disabled || pressed) && { opacity: 0.7 },
      ]}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  style,
  ...props
}: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textDim}
        style={[styles.input, style]}
        textAlign="right"
        {...props}
      />
    </View>
  );
}

export function PinPad({
  value,
  onChange,
  maxLength = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  const press = (key: string) => {
    if (key === '') return;
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= maxLength) return;
    onChange(value + key);
  };

  return (
    <View style={styles.pinWrap}>
      <View style={styles.dots}>
        {Array.from({ length: Math.max(4, value.length || 4) }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < value.length && styles.dotFilled]}
          />
        ))}
      </View>
      <View style={styles.pad}>
        {keys.map((key, idx) => (
          <Pressable
            key={`${key}-${idx}`}
            onPress={() => press(key)}
            style={({ pressed }) => [
              styles.key,
              !key && styles.keyEmpty,
              pressed && key && { backgroundColor: colors.bgSoft },
            ]}
          >
            <Text style={styles.keyText}>{key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: spacing.sm,
  },
  muted: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerBtn: {
    backgroundColor: colors.danger,
  },
  primaryBtnText: {
    color: '#042F2E',
    fontWeight: '700',
    fontSize: 16,
  },
  ghostBtn: {
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.textMuted,
    marginBottom: 6,
    textAlign: 'right',
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  pinWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
    minHeight: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  dotFilled: {
    backgroundColor: colors.accent,
  },
  pad: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: '30%',
    aspectRatio: 1.4,
    margin: '1.5%',
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgElevated,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
