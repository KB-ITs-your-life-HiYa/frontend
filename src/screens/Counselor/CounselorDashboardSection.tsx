import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import PressableScale from '../../components/PressableScale';
import { colors, radius, spacing } from '../../constants/colors';
import { PROTECTION_STATUS_LABEL } from '../../types/counselor';
import type { CounselorYouth } from '../../types/counselor';
import { formatDday } from '../../utils/today';

// D-Day 생활비 관리: 담당자가 한 화면에서
//   1) 자립수당 지급 디데이 현황
//   2) 자립정착금 지급 여부
//   3) 매달 자립수당 지급 여부
// 를 청년별로 훑어볼 수 있게 표 형태로 모았다. 위쪽 요약 카드 4개는 "지금 당장 봐야 할 사람이
// 몇 명인지"를 바로 보여줘서, 아래 표를 하나하나 안 읽어도 급한 정도를 감 잡을 수 있게 했다.
// 표 안 "상세보기"를 누르면 자립청년 관리 탭의 해당 청년 상세로 바로 넘어간다(onViewYouth).

type SortMode = 'ALL' | 'UNPAID' | 'URGENT';

const SORT_TABS: { key: SortMode; label: string }[] = [
  { key: 'ALL', label: '전체보기' },
  { key: 'UNPAID', label: '미지급 건만' },
  { key: 'URGENT', label: '종료임박순' },
];

interface DdayTier {
  label: string;
  color: string;
  bg: string;
  ended?: boolean;
}

function getDdayTier(days: number | null): DdayTier {
  if (days == null) return { label: '보호중', color: colors.textSecondary, bg: colors.graySoft };
  if (days < 0) return { label: '지급 종료', color: colors.textTertiary, bg: colors.graySoft, ended: true };
  if (days <= 90) return { label: '임박', color: colors.danger, bg: colors.dangerLight };
  if (days <= 365) return { label: 'D-365 이내', color: colors.warning, bg: colors.warningLight };
  return { label: '여유', color: colors.primary, bg: colors.primaryLight };
}

function currentAllowance(youth: CounselorYouth) {
  return youth.monthlyAllowances[youth.monthlyAllowances.length - 1] ?? null;
}

function isUnpaid(y: CounselorYouth): boolean {
  const cur = currentAllowance(y);
  return !y.settlementFundPaid || !!(cur && !cur.paid);
}

// 종료임박순 정렬용 키. 보호중(null)이 가장 여유 있는 취급, 이미 종료된 경우도
// 더 이상 급하지 않으므로 뒤로 보낸다.
function urgencySortKey(days: number | null): number {
  if (days == null) return 1_000_000;
  if (days < 0) return 900_000;
  return days;
}

interface Props {
  youths: CounselorYouth[];
  onViewYouth: (youthId: number) => void;
}

export default function CounselorDashboardSection({ youths, onViewYouth }: Props) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('ALL');

  const inD365 = youths.filter((y) => y.daysUntilSupportEnd != null && y.daysUntilSupportEnd >= 0 && y.daysUntilSupportEnd <= 365).length;
  const unpaidSettlement = youths.filter((y) => !y.settlementFundPaid).length;
  const unpaidThisMonth = youths.filter((y) => {
    const cur = currentAllowance(y);
    return cur && !cur.paid;
  }).length;

  const rows = useMemo(() => {
    const q = query.trim();
    let list = youths.filter((y) => !q || y.name.includes(q) || y.regionName.includes(q));
    if (sortMode === 'UNPAID') list = list.filter(isUnpaid);
    if (sortMode === 'URGENT') {
      list = [...list].sort((a, b) => urgencySortKey(a.daysUntilSupportEnd) - urgencySortKey(b.daysUntilSupportEnd));
    }
    return list;
  }, [youths, query, sortMode]);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.topBar}>
        <Text style={styles.breadcrumb}>
          포털 홈 <Text style={styles.breadcrumbSep}>›</Text> <Text style={styles.breadcrumbCurrent}>D-Day 생활비 관리</Text>
        </Text>
        <View style={styles.topBarRight}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={14} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="청년 이름, 지역 검색..."
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <PressableScale style={styles.syncButton}>
            <Ionicons name="sync" size={13} color={colors.textSecondary} />
            <Text style={styles.syncButtonText}>동기화</Text>
          </PressableScale>
        </View>
      </View>

      <View>
        <Text style={styles.title}>D-Day 생활비 관리</Text>
        <Text style={styles.subtitle}>자립수당 지급 디데이, 자립정착금·매달 자립수당 지급 여부를 한눈에 확인해요</Text>
      </View>

      <View style={styles.statRow}>
        <StatCard icon="people-outline" tone={colors.primary} bg={colors.primaryLight} label="전체 관리 인원" value={youths.length} valueColor={colors.textPrimary} />
        <StatCard icon="hourglass-outline" tone={colors.warning} bg={colors.warningLight} label="D-365 이내" value={inD365} valueColor={colors.warning} />
        <StatCard icon="cash-outline" tone={colors.danger} bg={colors.dangerLight} label="정착금 미지급" value={unpaidSettlement} valueColor={colors.danger} />
        <StatCard icon="calendar-outline" tone={colors.danger} bg={colors.dangerLight} label="이번달 수당 미지급" value={unpaidThisMonth} valueColor={colors.danger} />
      </View>

      <Card style={styles.tableCard}>
        <View style={styles.tableHeaderBar}>
          <View style={styles.tableHeaderLeft}>
            <Text style={styles.tableTitle}>지급 대상 청년 목록</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>총 {rows.length}명</Text>
            </View>
          </View>
          <View style={styles.sortTabs}>
            {SORT_TABS.map((t) => {
              const active = sortMode === t.key;
              return (
                <PressableScale key={t.key} onPress={() => setSortMode(t.key)} style={[styles.sortTab, active && styles.sortTabActive]}>
                  <Text style={[styles.sortTabText, active && styles.sortTabTextActive]}>{t.label}</Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.nameCol, styles.headerText]}>이름</Text>
          <Text style={[styles.cell, styles.regionCol, styles.headerText]}>거주 지역</Text>
          <Text style={[styles.cell, styles.ddayCol, styles.headerText]}>자립수당 종료 D-day</Text>
          <Text style={[styles.cell, styles.chipCol, styles.headerText]}>정착금 지급</Text>
          <Text style={[styles.cell, styles.chipCol, styles.headerText]}>이번달 수당 지급</Text>
          <Text style={[styles.cell, styles.manageCol, styles.headerText]}>관리</Text>
        </View>
        {rows.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>검색 결과가 없어요</Text>
          </View>
        ) : (
          rows.map((y, i) => {
            const tier = getDdayTier(y.daysUntilSupportEnd);
            const cur = currentAllowance(y);
            return (
              <View key={y.id} style={[styles.row, i < rows.length - 1 && styles.rowDivider]}>
                <View style={[styles.cell, styles.nameCol]}>
                  <Text style={styles.nameText}>{y.name}</Text>
                  <Text style={styles.metaText}>
                    {y.age}세 · {PROTECTION_STATUS_LABEL[y.protectionStatus]}
                  </Text>
                </View>
                <Text style={[styles.cell, styles.regionCol, styles.regionText]}>{y.regionName}</Text>
                <View style={[styles.cell, styles.ddayCol]}>
                  <View style={[styles.pill, { backgroundColor: tier.bg }]}>
                    <Text style={[styles.pillText, { color: tier.color }, tier.ended && styles.pillTextStrike]}>
                      {y.daysUntilSupportEnd != null ? formatDday(y.daysUntilSupportEnd) : '—'}
                    </Text>
                  </View>
                  <Text style={styles.tierLabel}>{tier.label}</Text>
                </View>
                <View style={[styles.cell, styles.chipCol]}>
                  <StatusDot ok={y.settlementFundPaid} okLabel="지급완료" ngLabel="미지급" />
                </View>
                <View style={[styles.cell, styles.chipCol]}>
                  <StatusDot ok={!!cur?.paid} okLabel="지급완료" ngLabel={cur ? '미지급' : '대상 아님'} muted={!cur} />
                </View>
                <View style={[styles.cell, styles.manageCol]}>
                  <PressableScale onPress={() => onViewYouth(y.id)}>
                    <Text style={styles.detailLink}>상세보기</Text>
                  </PressableScale>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.paginationRow}>
          <Text style={styles.paginationText}>
            1-{rows.length} / 전체 {rows.length}개 항목
          </Text>
          <View style={styles.pageChips}>
            <View style={[styles.pageArrow, styles.pageArrowDisabled]}>
              <Ionicons name="chevron-back" size={14} color={colors.textTertiary} />
            </View>
            <View style={styles.pageNumber}>
              <Text style={styles.pageNumberText}>1</Text>
            </View>
            <View style={[styles.pageArrow, styles.pageArrowDisabled]}>
              <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

function StatCard({
  icon,
  tone,
  bg,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
  bg: string;
  label: string;
  value: number;
  valueColor: string;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeaderRow}>
        <View style={[styles.statIcon, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={15} color={tone} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValueRow}>
        <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
        <Text style={styles.statUnit}> 명</Text>
      </Text>
    </Card>
  );
}

function StatusDot({ ok, okLabel, ngLabel, muted }: { ok: boolean; okLabel: string; ngLabel: string; muted?: boolean }) {
  const color = ok ? colors.success : muted ? colors.textTertiary : colors.textSecondary;
  const bg = ok ? colors.successLight : colors.graySoft;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {!muted && <Ionicons name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={12} color={color} />}
      <Text style={[styles.pillText, { color }]}>{ok ? okLabel : ngLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  breadcrumb: { fontSize: 13, color: colors.textTertiary },
  breadcrumbSep: { color: colors.textTertiary },
  breadcrumbCurrent: { fontWeight: '700', color: colors.textPrimary },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    width: 220,
  },
  searchInput: { flex: 1, fontSize: 12, color: colors.textPrimary, padding: 0 },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  syncButtonText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, gap: spacing.sm },
  statHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  statValueRow: { marginTop: 2 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statUnit: { fontSize: 13, fontWeight: '600', color: colors.textTertiary },
  tableCard: { padding: 0, overflow: 'hidden' },
  tableHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tableTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  countBadge: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingVertical: 2, paddingHorizontal: spacing.sm },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  sortTabs: { flexDirection: 'row', gap: 4, backgroundColor: colors.background, borderRadius: radius.md, padding: 3 },
  sortTab: { paddingVertical: 5, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  sortTabActive: { backgroundColor: colors.primary },
  sortTabText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  sortTabTextActive: { color: colors.white },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  headerRow: { backgroundColor: colors.background, paddingVertical: spacing.sm, borderBottomWidth: 0 },
  headerText: { fontSize: 12, fontWeight: '700', color: colors.textTertiary },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  cell: { paddingRight: spacing.sm },
  nameCol: { flex: 1.3 },
  regionCol: { flex: 1.6 },
  ddayCol: { flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipCol: { flex: 1.1 },
  manageCol: { flex: 0.7 },
  nameText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  metaText: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  regionText: { fontSize: 13, color: colors.textSecondary },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  pillText: { fontSize: 11, fontWeight: '700' },
  pillTextStrike: { textDecorationLine: 'line-through' },
  tierLabel: { fontSize: 10, color: colors.textTertiary },
  detailLink: { fontSize: 12, fontWeight: '700', color: colors.primary },
  emptyRow: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  paginationText: { fontSize: 12, color: colors.textTertiary },
  pageChips: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pageArrow: { width: 26, height: 26, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  pageArrowDisabled: { opacity: 0.5 },
  pageNumber: { width: 26, height: 26, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  pageNumberText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
