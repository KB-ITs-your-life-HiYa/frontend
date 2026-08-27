import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/colors';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string; // 오른쪽에 텍스트만 표시하고 싶을 때 (예: 앱 버전)
  onPress?: () => void;
  showChevron?: boolean;
}

// 마이 화면 등에서 쓰는 "아이콘 + 라벨 + 화살표" 리스트 행
export default function ListRow({ icon, label, value, onPress, showChevron = true }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.left}>
        {icon ? <Ionicons name={icon} size={18} color={colors.textSecondary} style={styles.icon} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      {value ? (
        <Text style={styles.value}>{value}</Text>
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm, width: 20 },
  label: { fontSize: 15, color: colors.textPrimary },
  value: { fontSize: 14, color: colors.textTertiary },
});
