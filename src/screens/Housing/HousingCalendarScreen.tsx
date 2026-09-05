import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import SectionHeader from '../../components/SectionHeader';
import ProgressBar from '../../components/ProgressBar';
import { colors, radius, spacing } from '../../constants/colors';
import { ApiError } from '../../services/api';
import { housingApi } from '../../services/housing';
import { HousingNoticeSummary } from '../../types/housing';
import ScheduleItemRow from './ScheduleItemRow';
import {
  getDotsForDate,
  noticesOnDate,
  parseLocalDate,
  visibleDots,
} from './calendarDots';
import { buildScheduleEvents, upcomingScheduleEvents } from './scheduleEvents';
import { TODAY, diffDays, formatMonthDay, isSameDay } from '../../utils/today';

// 독립 지원 — 주거 캘린더 화면
// 공고·상시·일정은 GET /housing/calendar. 체크리스트는 아직 로컬.
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 웹에서 한글 단어 중간 줄바꿈 방지. StyleSheet 에는 wordBreak 타입이 없어 분리한다 */
const keepWord: TextStyle =
  Platform.OS === 'web' ? ({ wordBreak: 'keep-all' } as TextStyle) : {};

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

  const [notices, setNotices] = useState<HousingNoticeSummary[]>([]);
  const [ongoingNotices, setOngoingNotices] = useState<HousingNoticeSummary[]>([]);
  const [regionMessage, setRegionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await housingApi.getCalendar({
          year: viewDate.getFullYear(),
          month: viewDate.getMonth() + 1,
        });
        if (cancelled) return;
        setNotices(res.notices);
        setOngoingNotices(res.ongoingNotices);
        setRegionMessage(res.message);
      } catch (e) {
        if (cancelled) return;
        setNotices([]);
        setOngoingNotices([]);
        setRegionMessage(null);
        setError(
          e instanceof ApiError ? e.message : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [viewDate]);

  // 달을 넘기면 선택일이 그 달 밖이 되지 않게 맞춘다
  useEffect(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    if (selectedDate.getFullYear() === y && selectedDate.getMonth() === m) return;
    if (y === TODAY.getFullYear() && m === TODAY.getMonth()) {
      setSelectedDate(TODAY);
    } else {
      setSelectedDate(new Date(y, m, 1));
    }
  }, [viewDate, selectedDate]);

  const [checklists, setChecklists] = useState<TemplateId[]>(['moveIn']);
  const [itemsByTemplate, setItemsByTemplate] = useState<Record<TemplateId, ChecklistItem[]>>({
    moveIn: CHECKLIST_TEMPLATES.moveIn.items,
    moving: CHECKLIST_TEMPLATES.moving.items,
    houseHunting: CHECKLIST_TEMPLATES.houseHunting.items,
  });
  const [pickerVisible, setPickerVisible] = useState(false);

  const selectedDayNotices = useMemo(
    () => noticesOnDate(selectedDate, notices),
    [notices, selectedDate]
  );

  const selectedDateLabel = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

  const previewSchedule = useMemo(() => {
    const merged = new Map<number, HousingNoticeSummary>();
    for (const n of [...notices, ...ongoingNotices]) merged.set(n.id, n);
    return upcomingScheduleEvents(buildScheduleEvents([...merged.values()])).slice(0, 2);
  }, [notices, ongoingNotices]);

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

        {regionMessage ? (
          <View style={styles.messageBanner}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.messageBannerText}>{regionMessage}</Text>
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
                const dots = cell.inCurrentMonth ? getDotsForDate(cell.date, notices) : [];
                const { shown, more } = visibleDots(dots);
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
                    </View>
                    <View style={styles.dotsRow}>
                      {shown.map((dot, idx) => (
                        <View
                          key={`${dot.noticeId}-${dot.kind}-${idx}`}
                          style={[
                            styles.dot,
                            dot.kind === 'start'
                              ? { backgroundColor: dot.color }
                              : { borderColor: dot.color, borderWidth: 1.6 },
                          ]}
                        />
                      ))}
                      {more > 0 ? <Text style={styles.dotMore}>+{more}</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotFilled]} />
              <Text style={styles.legendText}>접수 시작</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotHollow]} />
              <Text style={styles.legendText}>접수 마감</Text>
            </View>
            <Text style={styles.legendHint}>같은 색 = 같은 공고</Text>
          </View>
        </Card>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>{error}</Text>
          </Card>
        ) : (
          <>
            <SectionHeader title={`${selectedDateLabel} 공고`} />
            {selectedDayNotices.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>이 날짜에 접수 중인 공고가 없어요</Text>
              </Card>
            ) : (
              selectedDayNotices.map((notice) => {
                const start = parseLocalDate(notice.beginDate);
                const end = parseLocalDate(notice.endDate);
                const total = diffDays(end, start) || 1;
                const elapsed = Math.min(Math.max(diffDays(TODAY, start), 0), total);
                const progress = elapsed / total;
                const daysLeft = diffDays(end, TODAY);
                return (
                  <Pressable
                    key={notice.id}
                    onPress={() => navigation.navigate('HousingNoticeDetail', { noticeId: notice.id })}
                  >
                    <Card style={styles.noticeCard}>
                      <View style={styles.noticeTopRow}>
                        <Text style={[styles.noticeTitle, keepWord]}>{notice.title}</Text>
                        <Text style={styles.noticeDday}>{daysLeft >= 0 ? `마감 D-${daysLeft}` : '마감'}</Text>
                      </View>
                      <Text style={[styles.noticeMeta, keepWord]}>
                        {notice.institution} · {notice.supplyType}
                      </Text>
                      <View style={styles.noticeTrack}>
                        <View style={[styles.noticeTrackFill, { width: `${Math.round(progress * 100)}%` }]} />
                      </View>
                      <View style={styles.noticeDatesRow}>
                        <Text style={styles.noticeDateText}>{formatMonthDay(start)} 시작</Text>
                        <Text style={styles.noticeDateText}>{formatMonthDay(end)} 마감</Text>
                      </View>
                    </Card>
                  </Pressable>
                );
              })
            )}

            <SectionHeader title="상시 모집" />
            {ongoingNotices.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>상시 모집 공고가 없어요</Text>
              </Card>
            ) : (
              ongoingNotices.map((notice) => {
                const start = parseLocalDate(notice.beginDate);
                const end = parseLocalDate(notice.endDate);
                return (
                  <Pressable
                    key={notice.id}
                    onPress={() => navigation.navigate('HousingNoticeDetail', { noticeId: notice.id })}
                  >
                    <Card style={styles.rollingCard}>
                      <View style={styles.rollingIcon}>
                        <Ionicons name="infinite" size={20} color={colors.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rollingTitle, keepWord]}>{notice.title}</Text>
                        <Text style={[styles.rollingMeta, keepWord]}>
                          {notice.institution} · {notice.supplyType}
                        </Text>
                        <Text style={styles.rollingPeriod}>
                          {formatMonthDay(start)} ~ {formatMonthDay(end)} 접수
                        </Text>
                      </View>
                      <Badge label="상시" tone="gray" />
                    </Card>
                  </Pressable>
                );
              })
            )}
          </>
        )}

        <SectionHeader
          title="주거지원 일정"
          actionLabel="전체보기→"
          onActionPress={() => navigation.navigate('ScheduleList')}
        />
        {previewSchedule.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>다가오는 일정이 없어요</Text>
          </Card>
        ) : (
          <Card style={styles.scheduleListCard}>
            {previewSchedule.map((item, index) => (
              <React.Fragment key={item.id}>
                <ScheduleItemRow
                  item={item}
                  onPress={() =>
                    navigation.navigate('HousingNoticeDetail', { noticeId: item.noticeId })
                  }
                />
                {index < previewSchedule.length - 1 ? <View style={styles.divider} /> : null}
              </React.Fragment>
            ))}
          </Card>
        )}

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
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  messageBannerText: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.primary, fontWeight: '600' },
  loadingWrap: { paddingVertical: spacing.lg, alignItems: 'center' },
  calendarCard: { gap: 4, paddingBottom: spacing.sm },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.textTertiary, paddingVertical: 6 },
  sunday: { color: colors.danger },
  saturday: { color: colors.primary },
  dayCellWrap: { flex: 1, alignItems: 'center', paddingVertical: 2, minHeight: 48 },
  dayCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 10,
    marginTop: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  dotMore: { fontSize: 9, fontWeight: '700', color: colors.textTertiary, marginLeft: 1 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    marginTop: 2,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendDotFilled: { backgroundColor: colors.textSecondary },
  legendDotHollow: { borderWidth: 1.6, borderColor: colors.textSecondary, backgroundColor: 'transparent' },
  legendText: { fontSize: 11, color: colors.textSecondary },
  legendHint: { fontSize: 11, color: colors.textTertiary },
  noticeCard: { gap: spacing.md },
  noticeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  noticeTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  noticeDday: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 2 },
  noticeMeta: { fontSize: 12, color: colors.textTertiary, lineHeight: 18 },
  noticeTrack: { height: 6, borderRadius: radius.full, backgroundColor: colors.track, overflow: 'hidden', marginTop: 2 },
  noticeTrackFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
  noticeDatesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  noticeDateText: { fontSize: 11, color: colors.textTertiary, lineHeight: 16 },
  rollingCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  rollingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rollingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  rollingMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 4, lineHeight: 18 },
  rollingPeriod: { fontSize: 12, color: colors.textSecondary, marginTop: 6, fontWeight: '600', lineHeight: 18 },
  today: { backgroundColor: colors.accent },
  selected: { backgroundColor: colors.primaryLight },
  dayText: { fontSize: 13, color: colors.textPrimary },
  dayTextDimmed: { color: colors.textTertiary, opacity: 0.5 },
  dayTextToday: { color: colors.white, fontWeight: '700' },
  dayTextSelected: { color: colors.primary, fontWeight: '700' },
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
