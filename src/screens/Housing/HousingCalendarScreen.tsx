import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
} from 'react-native';
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
import {
  ChecklistTemplateType,
  HousingChecklist,
  HousingChecklistItem,
  HousingNoticeSummary,
} from '../../types/housing';
import ScheduleItemRow from './ScheduleItemRow';
import {
  getDotsForDate,
  noticesOnDate,
  parseLocalDate,
  visibleDots,
} from './calendarDots';
import { buildScheduleEvents, upcomingScheduleEvents } from './scheduleEvents';
import { TODAY, diffDays, formatMonthDay, isSameDay } from '../../utils/today';
import { confirm } from '../../utils/confirm';

// 독립 지원 — 주거 캘린더 화면
// 공고·상시·일정·체크리스트는 API 연동.
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

/** 템플릿 선택 UI용 메타. 실제 항목은 서버 템플릿을 따른다. */
const TEMPLATE_ORDER: ChecklistTemplateType[] = ['MOVE_IN', 'MOVING', 'HOUSE_HUNTING'];

const TEMPLATE_META: Record<
  ChecklistTemplateType,
  { shortTitle: string; cardTitle: string; description: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  MOVE_IN: {
    shortTitle: '입주 준비',
    cardTitle: '입주 준비 체크리스트',
    description: '계약 후 입주까지 챙겨야 할 서류와 절차',
    icon: 'key-outline',
  },
  MOVING: {
    shortTitle: '이사 준비',
    cardTitle: '이사 준비 체크리스트',
    description: '이사업체 예약부터 정산까지 이사 당일 준비',
    icon: 'cube-outline',
  },
  HOUSE_HUNTING: {
    shortTitle: '좋은 집 찾기',
    cardTitle: '좋은 집 찾기 체크리스트',
    description: '계약 전 안전하게 매물을 확인하는 절차',
    icon: 'search-outline',
  },
};

function sortChecklists(list: HousingChecklist[]): HousingChecklist[] {
  return [...list].sort(
    (a, b) => TEMPLATE_ORDER.indexOf(a.templateType) - TEMPLATE_ORDER.indexOf(b.templateType)
  );
}

function withItemStats(checklist: HousingChecklist, items: HousingChecklistItem[]): HousingChecklist {
  const doneCount = items.filter((it) => it.done).length;
  const totalCount = items.length;
  return {
    ...checklist,
    items,
    doneCount,
    totalCount,
    progress: totalCount === 0 ? 0 : doneCount / totalCount,
  };
}

type ItemEditorState =
  | { mode: 'create'; checklistId: number; content: string; memo: string }
  | { mode: 'edit'; checklistId: number; itemId: number; content: string; memo: string };

type HelpState = { title: string; body: string };

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

  const [checklists, setChecklists] = useState<HousingChecklist[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [checklistError, setChecklistError] = useState<string | null>(null);
  const [checklistBusy, setChecklistBusy] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [help, setHelp] = useState<HelpState | null>(null);
  const [itemEditor, setItemEditor] = useState<ItemEditorState | null>(null);
  const [activeChecklistId, setActiveChecklistId] = useState<number | null>(null);
  const [checklistCollapsed, setChecklistCollapsed] = useState(false);

  const reloadChecklists = async () => {
    setChecklistError(null);
    try {
      const list = await housingApi.listChecklists();
      const sorted = sortChecklists(list);
      setChecklists(sorted);
      setActiveChecklistId((prev) => {
        if (prev != null && sorted.some((c) => c.id === prev)) return prev;
        return sorted[0]?.id ?? null;
      });
    } catch (e) {
      setChecklists([]);
      setActiveChecklistId(null);
      setChecklistError(
        e instanceof ApiError ? e.message : '체크리스트를 불러오지 못했습니다'
      );
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setChecklistLoading(true);
      try {
        const list = await housingApi.listChecklists();
        if (!cancelled) {
          const sorted = sortChecklists(list);
          setChecklists(sorted);
          setActiveChecklistId(sorted[0]?.id ?? null);
          setChecklistError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setChecklists([]);
          setActiveChecklistId(null);
          setChecklistError(
            e instanceof ApiError ? e.message : '체크리스트를 불러오지 못했습니다'
          );
        }
      } finally {
        if (!cancelled) setChecklistLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const ownedTypes = useMemo(
    () => new Set(checklists.map((c) => c.templateType)),
    [checklists]
  );

  const activeChecklist = useMemo(
    () => checklists.find((c) => c.id === activeChecklistId) ?? null,
    [checklists, activeChecklistId]
  );

  const handleAddChecklist = async (templateType: ChecklistTemplateType) => {
    if (ownedTypes.has(templateType) || checklistBusy) return;
    setChecklistBusy(true);
    try {
      const created = await housingApi.createChecklist(templateType);
      setChecklists((prev) => sortChecklists([...prev, created]));
      setActiveChecklistId(created.id);
      setChecklistCollapsed(false);
      setPickerVisible(false);
      setChecklistError(null);
    } catch (e) {
      setChecklistError(
        e instanceof ApiError ? e.message : '체크리스트를 만들지 못했습니다'
      );
    } finally {
      setChecklistBusy(false);
    }
  };

  const handleDeleteChecklist = async (checklistId: number) => {
    if (checklistBusy) return;
    const ok = await confirm('체크리스트 삭제', '이 체크리스트와 모든 항목이 삭제됩니다.', '삭제');
    if (!ok) return;
    setChecklistBusy(true);
    try {
      await housingApi.deleteChecklist(checklistId);
      setChecklists((prev) => {
        const next = prev.filter((c) => c.id !== checklistId);
        setActiveChecklistId((cur) => {
          if (cur !== checklistId) return cur;
          return next[0]?.id ?? null;
        });
        return next;
      });
      setChecklistError(null);
    } catch (e) {
      setChecklistError(
        e instanceof ApiError ? e.message : '체크리스트를 삭제하지 못했습니다'
      );
    } finally {
      setChecklistBusy(false);
    }
  };

  const toggleItem = async (checklist: HousingChecklist, item: HousingChecklistItem) => {
    if (checklistBusy) return;
    const nextDone = !item.done;
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== checklist.id) return c;
        const items = c.items.map((it) => (it.id === item.id ? { ...it, done: nextDone } : it));
        return withItemStats(c, items);
      })
    );
    try {
      await housingApi.updateChecklistItem(checklist.id, item.id, { done: nextDone });
    } catch {
      await reloadChecklists();
    }
  };

  const openCreateItem = (checklistId: number) => {
    setItemEditor({ mode: 'create', checklistId, content: '', memo: '' });
  };

  const openEditItem = (checklistId: number, item: HousingChecklistItem) => {
    setItemEditor({
      mode: 'edit',
      checklistId,
      itemId: item.id,
      content: item.content,
      memo: item.memo ?? '',
    });
  };

  const saveItemEditor = async () => {
    if (!itemEditor || checklistBusy) return;
    const content = itemEditor.content.trim();
    if (!content) {
      setChecklistError('항목 제목을 입력해 주세요');
      return;
    }
    const memo = itemEditor.memo.trim() || null;
    setChecklistBusy(true);
    try {
      if (itemEditor.mode === 'create') {
        const created = await housingApi.addChecklistItem(itemEditor.checklistId, {
          content,
          memo,
        });
        setChecklists((prev) =>
          prev.map((c) =>
            c.id === itemEditor.checklistId ? withItemStats(c, [...c.items, created]) : c
          )
        );
      } else {
        const updated = await housingApi.updateChecklistItem(
          itemEditor.checklistId,
          itemEditor.itemId,
          { content, memo }
        );
        setChecklists((prev) =>
          prev.map((c) => {
            if (c.id !== itemEditor.checklistId) return c;
            const items = c.items.map((it) => (it.id === updated.id ? updated : it));
            return withItemStats(c, items);
          })
        );
      }
      setItemEditor(null);
      setChecklistError(null);
    } catch (e) {
      setChecklistError(
        e instanceof ApiError ? e.message : '항목을 저장하지 못했습니다'
      );
    } finally {
      setChecklistBusy(false);
    }
  };

  const handleDeleteItem = async (checklistId: number, item: HousingChecklistItem) => {
    if (checklistBusy) return;
    const ok = await confirm('항목 삭제', `"${item.content}" 항목을 삭제할까요?`, '삭제');
    if (!ok) return;
    setChecklistBusy(true);
    try {
      await housingApi.deleteChecklistItem(checklistId, item.id);
      setChecklists((prev) =>
        prev.map((c) => {
          if (c.id !== checklistId) return c;
          return withItemStats(
            c,
            c.items.filter((it) => it.id !== item.id)
          );
        })
      );
      setChecklistError(null);
    } catch (e) {
      setChecklistError(
        e instanceof ApiError ? e.message : '항목을 삭제하지 못했습니다'
      );
    } finally {
      setChecklistBusy(false);
    }
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
          <Text style={styles.checklistSectionTitle}>나의 체크리스트</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setPickerVisible(true)}
            hitSlop={8}
            accessibilityLabel="체크리스트 추가"
          >
            <Ionicons name="add" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {checklistError ? (
          <View style={styles.messageBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={[styles.messageBannerText, { color: colors.danger }]}>{checklistError}</Text>
          </View>
        ) : null}

        {checklistLoading ? (
          <Card style={styles.emptyCard}>
            <ActivityIndicator color={colors.primary} />
          </Card>
        ) : checklists.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>+ 버튼을 눌러 체크리스트를 추가해보세요</Text>
          </Card>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {checklists.map((checklist) => {
                const on = checklist.id === activeChecklistId;
                return (
                  <Pressable
                    key={checklist.id}
                    onPress={() => {
                      setActiveChecklistId(checklist.id);
                      setChecklistCollapsed(false);
                    }}
                    style={[styles.chip, on ? styles.chipOn : null]}
                  >
                    <Text style={[styles.chipText, on ? styles.chipTextOn : null]}>
                      {TEMPLATE_META[checklist.templateType].shortTitle.replace(' ', '')}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {activeChecklist ? (
              <Card style={styles.checklistCard}>
                <View style={styles.checklistCardHeader}>
                  <Pressable
                    style={styles.checklistCollapseHit}
                    onPress={() => setChecklistCollapsed((v) => !v)}
                    accessibilityLabel={checklistCollapsed ? '체크리스트 펼치기' : '체크리스트 접기'}
                  >
                    <Text style={styles.checklistCardTitle}>
                      {TEMPLATE_META[activeChecklist.templateType].cardTitle}
                    </Text>
                    <Ionicons
                      name={checklistCollapsed ? 'chevron-down' : 'chevron-up'}
                      size={16}
                      color={colors.textTertiary}
                    />
                    <Text style={styles.collapsedPct}>
                      {Math.round(activeChecklist.progress * 100)}%
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteChecklist(activeChecklist.id)}
                    hitSlop={8}
                    accessibilityLabel="체크리스트 삭제"
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
                  </Pressable>
                </View>

                {!checklistCollapsed ? (
                  <>
                    <View style={styles.checklistHeader}>
                      <Text style={styles.checklistLabel}>진행률</Text>
                      <Text style={styles.checklistPct}>
                        {Math.round(activeChecklist.progress * 100)}%
                      </Text>
                    </View>
                    <ProgressBar progress={activeChecklist.progress} />
                    <View style={{ marginTop: spacing.sm }}>
                      {activeChecklist.items.map((item) => (
                        <View key={item.id} style={styles.checklistRow}>
                          <Pressable
                            onPress={() => toggleItem(activeChecklist, item)}
                            hitSlop={4}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: item.done }}
                          >
                            <View style={[styles.checkbox, item.done ? styles.checkboxDone : null]}>
                              {item.done ? (
                                <Ionicons name="checkmark" size={14} color={colors.white} />
                              ) : null}
                            </View>
                          </Pressable>
                          <Pressable
                            style={styles.checklistTextCol}
                            onPress={() => toggleItem(activeChecklist, item)}
                          >
                            <Text
                              style={[
                                styles.checklistTitle,
                                item.done ? styles.checklistTitleDone : null,
                                keepWord,
                              ]}
                            >
                              {item.content}
                            </Text>
                            {item.memo ? (
                              <Pressable
                                onPress={() => setHelp({ title: item.content, body: item.memo! })}
                                hitSlop={8}
                                accessibilityLabel="설명 보기"
                                style={styles.helpBtn}
                              >
                                <Ionicons
                                  name="help-circle-outline"
                                  size={18}
                                  color={colors.textTertiary}
                                />
                              </Pressable>
                            ) : null}
                          </Pressable>
                          <View style={styles.checklistItemActions}>
                            <Pressable
                              onPress={() => openEditItem(activeChecklist.id, item)}
                              hitSlop={8}
                              accessibilityLabel="항목 수정"
                            >
                              <Ionicons name="create-outline" size={16} color={colors.textTertiary} />
                            </Pressable>
                            <Pressable
                              onPress={() => handleDeleteItem(activeChecklist.id, item)}
                              hitSlop={8}
                              accessibilityLabel="항목 삭제"
                            >
                              <Ionicons name="close-outline" size={18} color={colors.textTertiary} />
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                    <Pressable
                      style={styles.addItemBtn}
                      onPress={() => openCreateItem(activeChecklist.id)}
                      disabled={checklistBusy}
                    >
                      <Ionicons name="add" size={16} color={colors.primary} />
                      <Text style={styles.addItemText}>항목 추가</Text>
                    </Pressable>
                  </>
                ) : null}
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>

      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>체크리스트 추가</Text>
            <Text style={styles.modalSubtitle}>템플릿당 최대 1개까지 추가할 수 있어요</Text>
            {TEMPLATE_ORDER.map((type) => {
              const tpl = TEMPLATE_META[type];
              const added = ownedTypes.has(type);
              return (
                <Pressable
                  key={type}
                  disabled={added || checklistBusy}
                  onPress={() => handleAddChecklist(type)}
                  style={[styles.templateRow, added ? styles.templateRowDisabled : null]}
                >
                  <View style={[styles.templateIcon, added ? styles.templateIconDisabled : null]}>
                    <Ionicons name={tpl.icon} size={18} color={added ? colors.textTertiary : colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.templateTitle, added ? styles.templateTitleDisabled : null]}>
                      {tpl.shortTitle}
                    </Text>
                    <Text style={styles.templateDesc}>{tpl.description}</Text>
                  </View>
                  {added ? (
                    <Badge label="추가됨" tone="gray" />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                  )}
                </Pressable>
              );
            })}
            <Pressable style={styles.modalCloseBtn} onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={help !== null} transparent animationType="fade" onRequestClose={() => setHelp(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setHelp(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={[styles.modalTitle, keepWord]}>{help?.title}</Text>
            <Text style={[styles.helpBody, keepWord]}>{help?.body}</Text>
            <Pressable style={styles.modalCloseBtn} onPress={() => setHelp(null)}>
              <Text style={styles.modalCloseText}>확인</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={itemEditor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setItemEditor(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setItemEditor(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {itemEditor?.mode === 'edit' ? '항목 수정' : '항목 추가'}
            </Text>
            <Text style={styles.fieldLabel}>제목</Text>
            <TextInput
              style={styles.fieldInput}
              value={itemEditor?.content ?? ''}
              onChangeText={(text) =>
                setItemEditor((prev) => (prev ? { ...prev, content: text } : prev))
              }
              placeholder="무엇을 체크할까요?"
              placeholderTextColor={colors.textTertiary}
              maxLength={500}
            />
            <Text style={styles.fieldLabel}>설명 (선택)</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMultiline]}
              value={itemEditor?.memo ?? ''}
              onChangeText={(text) =>
                setItemEditor((prev) => (prev ? { ...prev, memo: text } : prev))
              }
              placeholder="? 아이콘으로 보여줄 안내"
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={2000}
            />
            <View style={styles.editorActions}>
              <Pressable style={styles.editorCancelBtn} onPress={() => setItemEditor(null)}>
                <Text style={styles.editorCancelText}>취소</Text>
              </Pressable>
              <Pressable
                style={styles.editorSaveBtn}
                onPress={saveItemEditor}
                disabled={checklistBusy}
              >
                <Text style={styles.editorSaveText}>저장</Text>
              </Pressable>
            </View>
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
  chipRow: { gap: 7, paddingBottom: 2 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
  chipTextOn: { color: colors.white, fontWeight: '700' },
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
  checklistCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    gap: spacing.sm,
  },
  checklistCollapseHit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  checklistCardTitle: { flexShrink: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  collapsedPct: { fontSize: 12, fontWeight: '700', color: colors.primary },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  checklistLabel: { fontSize: 13, color: colors.textSecondary },
  checklistPct: { fontSize: 15, fontWeight: '800', color: colors.primary },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  checklistTextCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  checklistTitle: { flexShrink: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  checklistTitleDone: { color: colors.textTertiary, textDecorationLine: 'line-through' },
  helpBtn: { flexShrink: 0 },
  checklistItemActions: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 4,
  },
  addItemText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  helpBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginTop: spacing.xs },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.sm },
  fieldInput: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  fieldInputMultiline: { minHeight: 88, textAlignVertical: 'top' },
  editorActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  editorCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.graySoft,
  },
  editorCancelText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  editorSaveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  editorSaveText: { fontSize: 14, fontWeight: '700', color: colors.white },
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
