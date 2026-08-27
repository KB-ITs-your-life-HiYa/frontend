import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/colors';

interface Props {
  title: string;
  description?: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
  infoIcon?: boolean;
}

// "담당자 연계 동의", "월세 자동이체" 같은 제목+설명+스위치 행
export default function ToggleRow({ title, description, value, onValueChange, infoIcon }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {infoIcon ? (
            <Ionicons name="information-circle-outline" size={15} color={colors.textTertiary} style={{ marginLeft: 4 }} />
          ) : null}
        </View>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.track }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  textCol: { flex: 1, paddingRight: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  description: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
});
