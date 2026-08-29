import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../constants/colors';

interface Props {
  label: string;
  onPress?: () => void;
}

// AI상담 화면의 빠른 응답 버튼
export default function Chip({ label, onPress }: Props) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
});
