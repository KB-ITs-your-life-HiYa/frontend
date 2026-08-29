import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/colors';
import { diffDays, TODAY } from '../../utils/today';
import { ScheduleItem } from './scheduleData';

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

// 날짜 블록 + 제목/장소 + D-day·자격 상태를 한 줄에 담은 일정 리스트 행
export default function ScheduleItemRow({ item }: { item: ScheduleItem }) {
  const dday = diffDays(item.date, TODAY);
  const ddayLabel = dday === 0 ? 'D-DAY' : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`;
  const urgent = dday >= 0 && dday <= 5;

  return (
    <View style={styles.row}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateMonth}>{MONTH_LABELS[item.date.getMonth()]}</Text>
        <Text style={styles.dateDay}>{item.date.getDate()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.weekday} · {item.place}
        </Text>
        <View style={styles.footerRow}>
          <Text style={[styles.dday, urgent ? styles.ddayUrgent : null]}>{ddayLabel}</Text>
          <View style={styles.dot} />
          <Text style={[styles.eligible, item.eligible ? styles.eligibleOk : styles.eligibleCheck]}>
            {item.eligible ? '자격 충족' : '확인 필요'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  dateBlock: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
  },
  dateMonth: { fontSize: 10, color: colors.textTertiary, fontWeight: '600' },
  dateDay: { fontSize: 17, color: colors.textPrimary, fontWeight: '800', marginTop: 1 },
  body: { flex: 1, justifyContent: 'center', gap: 2 },
  title: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textTertiary },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dday: { fontSize: 12, fontWeight: '700', color: colors.primary },
  ddayUrgent: { color: colors.danger },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.border },
  eligible: { fontSize: 12, fontWeight: '600' },
  eligibleOk: { color: colors.success },
  eligibleCheck: { color: colors.textTertiary },
});
