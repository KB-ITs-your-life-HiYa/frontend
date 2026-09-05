import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextStyle, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/colors';
import { diffDays, formatMonthDay, TODAY } from '../../utils/today';
import {
  eligibilityLabel,
  kindLabel,
  ScheduleEvent,
  weekdayLabel,
} from './scheduleEvents';

const keepWord: TextStyle =
  Platform.OS === 'web' ? ({ wordBreak: 'keep-all' } as TextStyle) : {};

type Props = {
  item: ScheduleEvent;
  onPress?: () => void;
};

// 시안 ncard 스타일: 왼쪽 색 바 + 종류/자격 뱃지 + 제목 + 안내
export default function ScheduleItemRow({ item, onPress }: Props) {
  const dday = diffDays(item.date, TODAY);
  const ddayLabel = dday === 0 ? 'D-DAY' : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`;
  const isDeadline = item.kind === 'end';
  const shortWeekday = weekdayLabel(item.date).replace('요일', '');

  const content = (
    <View style={[styles.row, isDeadline ? styles.rowEnd : styles.rowStart]}>
      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <View style={[styles.kindBadge, isDeadline ? styles.kindBadgeEnd : styles.kindBadgeStart]}>
            <Text style={[styles.kindBadgeText, isDeadline ? styles.kindBadgeTextEnd : styles.kindBadgeTextStart]}>
              {kindLabel(item.kind)} · {ddayLabel}
            </Text>
          </View>
          <View
            style={[
              styles.eligBadge,
              item.eligibility === 'ok'
                ? styles.eligOk
                : item.eligibility === 'no'
                  ? styles.eligNo
                  : styles.eligCheck,
            ]}
          >
            <Text
              style={[
                styles.eligBadgeText,
                item.eligibility === 'ok'
                  ? styles.eligOkText
                  : item.eligibility === 'no'
                    ? styles.eligNoText
                    : styles.eligCheckText,
              ]}
            >
              {item.eligibility === 'ok' ? '✓ ' : item.eligibility === 'no' ? '✕ ' : '⚠ '}
              {eligibilityLabel(item.eligibility)}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, keepWord]}>{item.title}</Text>
        <Text style={[styles.meta, keepWord]}>
          {formatMonthDay(item.date)}({shortWeekday}) {kindLabel(item.kind)} · {item.institution}
        </Text>
      </View>
    </View>
  );

  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 4,
    gap: spacing.sm,
  },
  rowStart: { borderLeftColor: colors.primary },
  rowEnd: { borderLeftColor: colors.danger },
  body: { gap: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  kindBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  kindBadgeStart: { backgroundColor: colors.primaryLight },
  kindBadgeEnd: { backgroundColor: colors.dangerLight },
  kindBadgeText: { fontSize: 11, fontWeight: '800' },
  kindBadgeTextStart: { color: colors.primary },
  kindBadgeTextEnd: { color: colors.danger },
  eligBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  eligOk: { backgroundColor: colors.successLight },
  eligCheck: { backgroundColor: colors.warningLight },
  eligNo: { backgroundColor: colors.graySoft },
  eligBadgeText: { fontSize: 11, fontWeight: '700' },
  eligOkText: { color: colors.success },
  eligCheckText: { color: '#B45309' },
  eligNoText: { color: colors.textSecondary },
  title: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary, lineHeight: 22 },
  meta: { fontSize: 12, color: colors.textTertiary, lineHeight: 18 },
});
