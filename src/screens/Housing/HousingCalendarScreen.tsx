import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import SectionHeader from '../../components/SectionHeader';
import ProgressBar from '../../components/ProgressBar';
import { colors, radius, spacing } from '../../constants/colors';

// 독립 지원 — 주거 캘린더 화면
// TODO: 실제 날짜 계산 로직 및 청년 주택 API 연동으로 하드코딩된 값 교체
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type DayCell = { day: number; dimmed?: boolean; state?: 'today' | 'selected' };

const weeks: DayCell[][] = [
  [
    { day: 30, dimmed: true },
    { day: 31, dimmed: true },
    { day: 1 },
    { day: 2 },
    { day: 3 },
    { day: 4 },
    { day: 5 },
  ],
  [{ day: 6 }, { day: 7 }, { day: 8, state: 'today' }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }],
  [{ day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }],
  [{ day: 20 }, { day: 21 }, { day: 22 }, { day: 23, state: 'selected' }, { day: 24 }, { day: 25 }, { day: 26 }],
  [
    { day: 27 },
    { day: 28 },
    { day: 29 },
    { day: 30 },
    { day: 1, dimmed: true },
    { day: 2, dimmed: true },
    { day: 3, dimmed: true },
  ],
];

// eligible: 판정 엔진이 사용자 프로필(보호종료일·거주지·소득 등) 기준으로 자동 확인한 지원 대상 충족 여부
const scheduleItems = [
  {
    id: '1',
    dday: 'D-4',
    tone: 'danger' as const,
    title: '청년 매입임대주택 지원 공고',
    meta: '9월 8일 (화) · LH 청약센터',
    icon: 'notifications-outline' as const,
    eligible: true,
  },
  {
    id: '2',
    dday: 'D-21',
    tone: 'primary' as const,
    title: '행복주택 접수 마감',
    meta: '9월 23일 (수) · SH 인터넷청약',
    icon: 'create-outline' as const,
    eligible: false,
  },
];

const checklist = [
  { id: '1', title: '자립수당 계좌 변경', done: true, meta: '완료됨' },
  { id: '2', title: '필수 제출 서류 발급 (등본, 초본)', done: true, meta: '완료됨' },
  { id: '3', title: '보증금 대출 심사 서류 준비', done: false, meta: 'D-4 마감', urgent: true },
  { id: '4', title: '전입신고 및 확정일자 받기', done: false, meta: '계약 후 진행' },
];

export default function HousingCalendarScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.monthRow}>
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          <Text style={styles.monthTitle}>2026년 9월</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>

        <Card style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <Text
                key={w}
                style={[
                  styles.weekday,
                  i === 0 ? styles.sunday : null,
                  i === 6 ? styles.saturday : null,
                ]}
              >
                {w}
              </Text>
            ))}
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((cell, di) => (
                <View key={di} style={styles.dayCellWrap}>
                  <View
                    style={[
                      styles.dayCircle,
                      cell.state === 'today' ? styles.today : null,
                      cell.state === 'selected' ? styles.selected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        cell.dimmed ? styles.dayTextDimmed : null,
                        cell.state === 'today' ? styles.dayTextToday : null,
                        cell.state === 'selected' ? styles.dayTextSelected : null,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </Card>

        <SectionHeader title="주거지원 일정" actionLabel="전체보기→" />
        <Text style={styles.autoCheckCaption}>내 정보를 기반으로 지원 대상 충족 여부를 자동으로 확인했어요</Text>
        {scheduleItems.map((item) => (
          <View key={item.id} style={styles.scheduleCard}>
            <View style={[styles.scheduleBar, { backgroundColor: item.tone === 'danger' ? colors.danger : colors.primary }]} />
            <View style={styles.scheduleBody}>
              <View style={styles.scheduleBadgeRow}>
                <Badge label={item.dday} tone={item.tone === 'danger' ? 'accent' : 'primary'} />
                {item.eligible ? (
                  <Badge label="자격 충족" tone="success" icon="checkmark-circle" />
                ) : (
                  <Badge label="확인 필요" tone="gray" icon="help-circle" />
                )}
              </View>
              <Text style={styles.scheduleTitle}>{item.title}</Text>
              <Text style={styles.scheduleMeta}>{item.meta}</Text>
            </View>
            <View style={styles.scheduleIcon}>
              <Ionicons name={item.icon} size={18} color={colors.textSecondary} />
            </View>
          </View>
        ))}

        <SectionHeader title="입주 준비 체크리스트" />
        <Card style={styles.checklistCard}>
          <View style={styles.checklistHeader}>
            <Text style={styles.checklistLabel}>진행률</Text>
            <Text style={styles.checklistPct}>40%</Text>
          </View>
          <ProgressBar progress={0.4} />
          <View style={{ marginTop: spacing.sm }}>
            {checklist.map((item) => (
              <View key={item.id} style={styles.checklistRow}>
                <View style={[styles.checkbox, item.done ? styles.checkboxDone : null]}>
                  {item.done ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                </View>
                <View style={styles.checklistTextCol}>
                  <Text style={[styles.checklistTitle, item.done ? styles.checklistTitleDone : null]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.checklistMeta, item.urgent ? styles.checklistMetaUrgent : null]}>
                    {item.meta}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  monthTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  calendarCard: { gap: 4 },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.textTertiary, paddingVertical: 6 },
  sunday: { color: colors.danger },
  saturday: { color: colors.primary },
  dayCellWrap: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: colors.accent },
  selected: { backgroundColor: colors.primaryLight },
  dayText: { fontSize: 13, color: colors.textPrimary },
  dayTextDimmed: { color: colors.textTertiary, opacity: 0.5 },
  dayTextToday: { color: colors.white, fontWeight: '700' },
  dayTextSelected: { color: colors.primary, fontWeight: '700' },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  scheduleBar: { width: 4 },
  scheduleBody: { flex: 1, padding: spacing.md, gap: 4 },
  scheduleBadgeRow: { flexDirection: 'row', gap: spacing.xs },
  autoCheckCaption: { fontSize: 12, color: colors.textTertiary, marginTop: -4 },
  scheduleTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  scheduleMeta: { fontSize: 12, color: colors.textTertiary },
  scheduleIcon: { alignItems: 'center', justifyContent: 'center', paddingRight: spacing.md },
  checklistCard: { gap: 4 },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  checklistLabel: { fontSize: 13, color: colors.textSecondary },
  checklistPct: { fontSize: 15, fontWeight: '800', color: colors.primary },
  checklistRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  checklistTextCol: { flex: 1 },
  checklistTitle: { fontSize: 14, color: colors.textPrimary },
  checklistTitleDone: { color: colors.textTertiary, textDecorationLine: 'line-through' },
  checklistMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  checklistMetaUrgent: { color: colors.danger, fontWeight: '600' },
});
