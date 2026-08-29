import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../constants/colors';

interface Props {
  label: string;
  tone?: 'accent' | 'primary' | 'success' | 'gray' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

// D-Day, 매칭률, 상태 표시 같은 짧은 강조 텍스트에 사용하는 뱃지
export default function Badge({ label, tone = 'accent', icon, style }: Props) {
  return (
    <View style={[styles.badge, styles[tone], style]}>
      {icon ? <Ionicons name={icon} size={12} color={textColor[tone]} style={styles.icon} /> : null}
      <Text style={[styles.text, { color: textColor[tone] }]}>{label}</Text>
    </View>
  );
}

const textColor: Record<NonNullable<Props['tone']>, string> = {
  accent: colors.textPrimary,
  primary: colors.primary,
  success: colors.success,
  gray: colors.textSecondary,
  danger: colors.danger,
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  icon: { marginRight: 4 },
  accent: { backgroundColor: colors.accentLight },
  primary: { backgroundColor: colors.primaryLight },
  success: { backgroundColor: colors.successLight },
  gray: { backgroundColor: colors.graySoft },
  danger: { backgroundColor: colors.dangerLight },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
