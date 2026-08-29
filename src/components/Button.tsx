import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../constants/colors';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'sm';
  style?: ViewStyle;
}

export default function Button({ label, onPress, variant = 'primary', size = 'md', style }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, size === 'sm' ? styles.sm : null, isPrimary ? styles.primary : styles.secondary, style]}
    >
      <Text
        style={[
          styles.label,
          size === 'sm' ? styles.labelSm : null,
          isPrimary ? styles.labelPrimary : styles.labelSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  sm: { paddingVertical: spacing.sm + 2 },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelSm: { fontSize: 13 },
  labelPrimary: {
    color: colors.white,
  },
  labelSecondary: {
    color: colors.primary,
  },
});
