import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import SectionHeader from '../../components/SectionHeader';
import ProgressBar from '../../components/ProgressBar';
import { colors, radius, spacing } from '../../constants/colors';
import { scheduleItems } from './scheduleData';
import ScheduleItemRow from './ScheduleItemRow';
import { TODAY, diffDays, formatMonthDay, isSameDay } from '../../utils/today';

// 독립 지원 — 주거 캘린더 화면
// 달력 그리드는 실제 연/월 계산 기반
// TODO: 청년 주택 API 연동으로 일정·공고 하드코딩 값 교체
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type DayCell = { date: Date; day: number; inCurrentMonth: boolean };

// 달력 그리드를 실제 연/월 기준으로 계산 (윤년, 요일 정렬 포함)
function buildMonthMatrix(year: number, month: number): DayCell[][] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const gridStart = new Date(year, month, 1 - startWeekday);

  const cells: DayCell[] = Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return { date, day: date.getDate(), inCurrentMonth: date.getMonth() === month };
  });

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// 모집 중인 지원 공고 — 접수 시작일/마감일을 달력에 '시작'/'끝'으로 표시
const RECRUITING_NOTICES = [
  {
    id: '1',
    title: '청년 매입임대주택 지원 공고',
    start: new Date(2026, 8, 8),
    end: new Date(2026, 8, 23),
  },
];

function getNoticeMark(date: Date): 'start' | 'end' | null {
  for (const notice of RECRUITING_NOTICES) {
    if (isSameDay(date, notice.start)) return 'start';
    if (isSameDay(date, notice.end)) return 'end';
  }
  return null;
}

// 상시 모집: 마감일 없이 항상 접수 가능한 지원 제도
const rollingPrograms = [
  {
    id: '1',
    title: '청년월세 특별지원',
    meta: '거주지 관할 주민센터 상시접수',
  },
];

// 체크리스트 템플릿: 템플릿당 최대 1개까지만 추가할 수 있어요
type TemplateId = 'moveIn' | 'moving' | 'houseHunting';

type ChecklistItem = { id: string; title: string; done: boolean; meta: string; urgent?: boolean };

const TEMPLATE_ORDER: TemplateId[] = ['moveIn', 'moving', 'houseHunting'];

const CHECKLIST_TEMPLATES: Record<
  TemplateId,
  { shortTitle: string; cardTitle: string; description: string; icon: keyof typeof Ionicons.glyphMap; items: ChecklistItem[] }
> = {
  moveIn: {
    shortTitle: '입주 준비',
    cardTitle: '입주 준비 체크리스트',
    description: '계약 후 입주까지 챙겨야 할 서류와 절차',
    icon: 'key-outline',
    items: [
      { id: '1', title: '자립수당 계좌 변경', done: true, meta: '완료됨' },
      { id: '2', title: '필수 제출 서류 발급 (등본, 초본)', done: true, meta: '완료됨' },
      { id: '3', title: '보증금 대출 심사 서류 준비', done: false, meta: 'D-4 마감', urgent: true },
      { id: '4', title: '전입신고 및 확정일자 받기', done: false, meta: '계약 후 진행' },
    ],
  },
  moving: {
    shortTitle: '이사 준비',
    cardTitle: '이사 준비 체크리스트',
    description: '이사업체 예약부터 정산까지 이사 당일 준비',
    icon: 'cube-outline',
    items: [
      { id: '1', title: '이사업체 · 용달 예약', done: false, meta: '이사 2주 전' },
      { id: '2', title: '관리비 · 공과금 정산', done: false, meta: '이사 전 정산' },
      { id: '3', title: '인터넷 · 도시가스 이전 신청', done: false, meta: '이사 1주 전' },
      { id: '4', title: '주소 변경 (우편물, 각종 서비스)', done: false, meta: '이사 후 진행' },
    ],
  },
  houseHunting: {
    shortTitle: '좋은집 구하기',
    cardTitle: '좋은집 구하기 체크리스트',
    description: '계약 전 안전하게 매물을 확인하는 절차',
    icon: 'search-outline',
    items: [
      { id: '1', title: '예산 및 희망 지역 정하기', done: false, meta: '시작 단계' },
      { id: '2', title: '등기부등본 확인 (근저당 · 압류)', done: false, meta: '계약 전 필수' },
      { id: '3', title: '전세보증금 반환보증 가입 여부 확인', done: false, meta: '계약 전 확인' },
      { id: '4', title: '집 상태 및 시설 점검', done: false, meta: '방문 시 체크' },
    ],
  },
};

export default function HousingCalendarScreen() {
  const navigation = useNavigation<any>();
  const [viewDate, setViewDate] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const weeks = useMemo(() => buildMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);
  const goPrevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => {
    setViewDate(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
    setSelectedDate(TODAY);
  };
  const isViewingCurrentMonth = viewDate.getFullYear() === TODAY.getFullYear() && viewDate.getMonth() === TODAY.getMonth();

  const [checklists, setChecklists] = useState<TemplateId[]>(['moveIn']);
  const [itemsByTemplate, setItemsByTemplate] = useState<Record<TemplateId, ChecklistItem[]>>({
    moveIn: CHECKLIST_TEMPLATES.moveIn.items,
    moving: CHECKLIST_TEMPLATES.moving.items,
    houseHunting: CHECKLIST_TEMPLATES.houseHunting.items,
  });
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleAddChecklist = (id: TemplateId) => {
    setChecklists((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setPickerVisible(false);
  };

  const toggleItem = (templateId: TemplateId, itemId: string) => {
    setItemsByTemplate((prev) => ({
      ...prev,
      [templateId]: prev[templateId].map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)),
    }));
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.monthRow}>
          <Pressable onPress={goPrevMonth} hitSlop={8} accessibilityLabel="이전 달">
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
          </Text>
          <Pressable onPress={goNextMonth} hitSlop={8} accessibilityLabel="다음 달">
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {!isViewingCurrentMonth ? (
          <View style={styles.todayButtonWrap}>
            <Pressable style={styles.todayButton} onPress={goToday}>
              <Text style={styles.todayButtonText}>오늘</Text>
            </Pressable>
          </View>
        ) : null}

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
              {week.map((cell, di) => {
                const isToday = cell.inCurrentMonth && isSameDay(cell.date, TODAY);
                const isSelected = cell.inCurrentMonth && isSameDay(cell.date, selectedDate);
                const mark = cell.inCurrentMonth ? getNoticeMark(cell.date) : null;
                return (
                  <Pressable
                    key={di}
                    style={styles.dayCellWrap}
                    disabled={!cell.inCurrentMonth}
                    onPress={() => setSelectedDate(cell.date)}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        isToday ? styles.today : null,
                        isSelected && !isToday ? styles.selected : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !cell.inCurrentMonth ? styles.dayTextDimmed : null,
                          isToday ? styles.dayTextToday : null,
                          isSelected && !isToday ? styles.dayTextSelected : null,
                        ]}
                      >
                        {cell.day}
                      </Text>
                      {mark ? (
                        <View style={[styles.dayMark, mark === 'start' ? styles.dayMarkStart : styles.dayMarkEnd]}>
                          <Text style={styles.dayMarkText}>{mark === 'start' ? '시' : '끝'}</Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Card>

        <SectionHeader title="모집 중인 지원 공고" />
        {RECRUITING_NOTICES.map((notice) => {
          const total = diffDays(notice.end, notice.start) || 1;
          const elapsed = Math.min(Math.max(diffDays(TODAY, notice.start), 0), total);
          const progress = elapsed / total;
          const daysLeft = diffDays(notice.end, TODAY);
          return (
            <Card key={notice.id} style={styles.noticeCard}>
              <View style={styles.noticeTopRow}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDday}>{daysLeft >= 0 ? `마감 D-${daysLeft}` : '마감'}</Text>
              </View>
              <View style={styles.noticeTrack}>
                <View style={[styles.noticeTrackFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              <View style={styles.noticeDatesRow}>
                <Text style={styles.noticeDateText}>{formatMonthDay(notice.start)} 시작</Text>
                <Text style={styles.noticeDateText}>{formatMonthDay(notice.end)} 마감</Text>
              </View>
            </Card>
          );
        })}

        <SectionHeader title="상시 모집" />
        {rollingPrograms.map((p) => (
          <Card key={p.id} style={styles.rollingCard}>
            <View style={styles.rollingIcon}>
              <Ionicons name="infinite" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rollingTitle}>{p.title}</Text>
              <Text style={styles.rollingMeta}>{p.meta}</Text>
            </View>
            <Badge label="상시" tone="gray" />
          </Card>
        ))}

        <SectionHeader
          title="주거지원 일정"
          actionLabel="전체보기→"
          onActionPress={() => navigation.navigate('ScheduleList')}
        />
        <Text style={styles.autoCheckCaption}>내 정보를 기반으로 지원 대상 충족 여부를 자동으로 확인했어요</Text>
        <Card style={styles.scheduleListCard}>
          {scheduleItems.slice(0, 2).map((item, index) => (
            <React.Fragment key={item.id}>
              <ScheduleItemRow item={item} />
              {index < 1 ? <View style={styles.divider} /> : null}
            </React.Fragment>
          ))}
        </Card>

        <View style={styles.checklistSectionHeader}>
          <Text style={styles.checklistSectionTitle}>체크리스트</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setPickerVisible(true)}
            hitSlop={8}
            accessibilityLabel="체크리스트 추가"
          >
            <Ionicons name="add" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {checklists.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>+ 버튼을 눌러 체크리스트를 추가해보세요</Text>
          </Card>
        ) : (
          TEMPLATE_ORDER.filter((id) => checklists.includes(id)).map((id) => {
            const tpl = CHECKLIST_TEMPLATES[id];
            const items = itemsByTemplate[id];
            const doneCount = items.filter((it) => it.done).length;
            const progress = doneCount / items.length;
            return (
              <Card key={id} style={styles.checklistCard}>
                <View style={styles.checklistCardHeader}>
                  <Text style={styles.checklistCardTitle}>{tpl.cardTitle}</Text>
                </View>
                <View style={styles.checklistHeader}>
                  <Text style={styles.checklistLabel}>진행률</Text>
                  <Text style={styles.checklistPct}>{Math.round(progress * 100)}%</Text>
                </View>
                <ProgressBar progress={progress} />
                <View style={{ marginTop: spacing.sm }}>
                  {items.map((item) => (
                    <Pressable key={item.id} style={styles.checklistRow} onPress={() => toggleItem(id, item.id)}>
                      <View style={[styles.checkbox, item.done ? styles.checkboxDone : null]}>
                        {item.done ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                      </View>
                      <View style={styles.checklistTextCol}>
                        <Text style={[styles.checklistTitle, item.done ? styles.checklistTitleDone : null]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.checklistMeta, item.urgent && !item.done ? styles.checklistMetaUrgent : null]}>
                          {item.meta}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>체크리스트 추가</Text>
            <Text style={styles.modalSubtitle}>템플릿당 최대 1개까지 추가할 수 있어요</Text>
            {TEMPLATE_ORDER.map((id) => {
              const tpl = CHECKLIST_TEMPLATES[id];
              const added = checklists.includes(id);
              return (
                <Pressable
                  key={id}
                  disabled={added}
                  onPress={() => handleAddChecklist(id)}
                  style={[styles.templateRow, added ? styles.templateRowDisabled : null]}
                >
                  <View style={[styles.templateIcon, added ? styles.templateIconDisabled : null]}>
                    <Ionicons name={tpl.icon} size={18} color={added ? colors.textTertiary : colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.templateTitle, added ? styles.templateTitleDisabled : null]}>{tpl.shortTitle}</Text>
                    <Text style={styles.templateDesc}>{tpl.description}</Text>
                  </View>
                  {added ? <Badge label="추가됨" tone="gray" /> : <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
                </Pressable>
              );
            })}
            <Pressable style={styles.modalCloseBtn} onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  monthTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  todayButtonWrap: { alignItems: 'flex-end', marginTop: -6 },
  todayButton: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  todayButtonText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  calendarCard: { gap: 4 },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.textTertiary, paddingVertical: 6 },
  sunday: { color: colors.danger },
  saturday: { color: colors.primary },
  dayCellWrap: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayMark: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  dayMarkStart: { backgroundColor: colors.primary },
  dayMarkEnd: { backgroundColor: colors.danger },
  dayMarkText: { fontSize: 8, fontWeight: '800', color: colors.white },
  noticeCard: { gap: spacing.sm },
  noticeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noticeTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginRight: spacing.sm },
  noticeDday: { fontSize: 12, fontWeight: '700', color: colors.primary },
  noticeTrack: { height: 6, borderRadius: radius.full, backgroundColor: colors.track, overflow: 'hidden' },
  noticeTrackFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
  noticeDatesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  noticeDateText: { fontSize: 11, color: colors.textTertiary },
  rollingCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rollingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollingTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  rollingMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  today: { backgroundColor: colors.accent },
  selected: { backgroundColor: colors.primaryLight },
  dayText: { fontSize: 13, color: colors.textPrimary },
  dayTextDimmed: { color: colors.textTertiary, opacity: 0.5 },
  dayTextToday: { color: colors.white, fontWeight: '700' },
  dayTextSelected: { color: colors.primary, fontWeight: '700' },
  autoCheckCaption: { fontSize: 12, color: colors.textTertiary, marginTop: -4 },
  scheduleListCard: { paddingVertical: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  checklistSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  checklistSectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  checklistCard: { gap: 4 },
  checklistCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  checklistCardTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  modalSubtitle: { fontSize: 12, color: colors.textTertiary, marginBottom: spacing.sm },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  templateRowDisabled: { opacity: 0.55 },
  templateIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateIconDisabled: { backgroundColor: colors.graySoft },
  templateTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  templateTitleDisabled: { color: colors.textTertiary },
  templateDesc: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  modalCloseBtn: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs },
  modalCloseText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
