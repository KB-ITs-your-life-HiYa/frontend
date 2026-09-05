import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import ProgressBar from '../../components/ProgressBar';
import { colors, radius, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { ExpenseCategoryBreakdown, ExpenseReportResponse } from '../../types';
import { formatWon } from '../../utils/money';
import { CATEGORY_ICONS, CATEGORY_LABELS } from './expenseCategoryMeta';

function currentMonthParam() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string) {
  return `${Number(month.split('-')[1])}월`;
}

export default function ExpenseReportScreen() {
  const [month, setMonth] = useState(currentMonthParam);
  const [data, setData] = useState<ExpenseReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ExpenseReportResponse>(`/members/me/expense-report?month=${month}`);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError ? e.message : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [month]);

  const hasPrevious = data?.navigation.hasPrevious ?? false;
  const hasNext = data?.navigation.hasNext ?? false;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="지출 리포트" showBack showProfile={false} flat extraTopPadding={14} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.monthRow}>
          <Pressable
            onPress={() => setMonth((m) => shiftMonth(m, -1))}
            disabled={!hasPrevious}
            hitSlop={8}
            accessibilityLabel="이전 달"
          >
            <Ionicons name="chevron-back" size={20} color={hasPrevious ? colors.textSecondary : colors.border} />
          </Pressable>
          <Text style={styles.monthTitle}>{monthLabel(month)}</Text>
          <Pressable
            onPress={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={!hasNext}
            hitSlop={8}
            accessibilityLabel="다음 달"
          >
            <Ionicons name="chevron-forward" size={20} color={hasNext ? colors.textSecondary : colors.border} />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.status} />
        ) : error || !data ? (
          <Text style={styles.error}>{error ?? '지출 리포트를 불러오지 못했습니다'}</Text>
        ) : (
          <>
            <SummaryCard data={data} />
            <TrendCard data={data} />
            <Text style={styles.sectionTitle}>카테고리별 지출</Text>
            <View style={styles.categoryList}>
              {data.categories.map((item) => (
                <CategoryCard key={item.category} item={item} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryCard({ data }: { data: ExpenseReportResponse }) {
  return (
    <Card>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>지출</Text>
        <MoneyText amount={data.summary.totalExpense} variant="large" />
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>수입</Text>
        <MoneyText amount={data.summary.totalIncome} variant="medium" />
      </View>

      <Pressable
        style={styles.budgetRow}
        onPress={() => {
          // TODO: 월 예산 설정 화면 연결
        }}
      >
        <View style={styles.budgetLeft}>
          <Ionicons name="wallet-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.budgetLabel}>월 예산</Text>
        </View>
        {data.monthlyBudget == null ? (
          <Text style={styles.budgetAction}>설정하기 {'>'}</Text>
        ) : (
          // TODO: 예산이 생기면 "설정한 예산 대비 사용액" 형태로 교체
          <MoneyText amount={data.monthlyBudget} variant="medium" />
        )}
      </Pressable>
    </Card>
  );
}

const CHART_WIDTH = 296;
const CHART_HEIGHT = 150;
const CHART_MARGIN = { top: 16, right: 8, bottom: 20, left: 34 };
const PLOT_WIDTH = CHART_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
const PLOT_HEIGHT = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;

function TrendCard({ data }: { data: ExpenseReportResponse }) {
  const { months, averageExpense } = data.monthlyTrend;
  const rawMax = Math.max(1, ...months.map((m) => m.totalExpense), averageExpense);
  const axisMax = Math.ceil(rawMax / 100000) * 100000 || 100000;

  const baselineY = CHART_MARGIN.top + PLOT_HEIGHT;
  const valueToY = (value: number) => baselineY - (value / axisMax) * PLOT_HEIGHT;

  const barSlot = PLOT_WIDTH / months.length;
  const barWidth = barSlot * 0.5;

  return (
    <Card>
      <Text style={styles.cardTitle}>전체 지출</Text>

      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <SvgText x={0} y={12} fontSize={10} fill={colors.textTertiary}>
          (만원)
        </SvgText>

        {[axisMax, axisMax / 2].map((tick) => (
          <React.Fragment key={tick}>
            <Line
              x1={CHART_MARGIN.left}
              x2={CHART_WIDTH - CHART_MARGIN.right}
              y1={valueToY(tick)}
              y2={valueToY(tick)}
              stroke={colors.border}
              strokeWidth={1}
            />
            <SvgText x={CHART_MARGIN.left - 8} y={valueToY(tick) + 3} fontSize={10} fill={colors.textTertiary} textAnchor="end">
              {Math.round(tick / 10000)}
            </SvgText>
          </React.Fragment>
        ))}
        <Line
          x1={CHART_MARGIN.left}
          x2={CHART_WIDTH - CHART_MARGIN.right}
          y1={baselineY}
          y2={baselineY}
          stroke={colors.border}
          strokeWidth={1}
        />

        {months.map((m, i) => {
          const isActive = m.month === data.month;
          const x = CHART_MARGIN.left + barSlot * i + (barSlot - barWidth) / 2;
          const y = valueToY(m.totalExpense);
          return (
            <React.Fragment key={m.month}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={baselineY - y}
                rx={4}
                fill={isActive ? colors.primary : colors.primaryLight}
              />
              <SvgText
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 4}
                fontSize={11}
                fontWeight={isActive ? 'bold' : 'normal'}
                fill={isActive ? colors.textPrimary : colors.textTertiary}
                textAnchor="middle"
              >
                {monthLabel(m.month)}
              </SvgText>
            </React.Fragment>
          );
        })}

        <Line
          x1={CHART_MARGIN.left}
          x2={CHART_WIDTH - CHART_MARGIN.right}
          y1={valueToY(averageExpense)}
          y2={valueToY(averageExpense)}
          stroke={colors.textTertiary}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <SvgText
          x={CHART_WIDTH - CHART_MARGIN.right}
          y={valueToY(averageExpense) - 4}
          fontSize={10}
          fill={colors.textTertiary}
          textAnchor="end"
        >
          평균
        </SvgText>
      </Svg>

      <View style={styles.divider} />
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>월 평균지출</Text>
        <MoneyText amount={averageExpense} variant="medium" color={colors.primary} />
      </View>
    </Card>
  );
}

// 진행바 전용 계산. 카테고리 중 최댓값이 아니라 "지난달 사용액"을 기준(100%)으로 이번 달 사용액 비율을 그린다.
function computeCategoryBar(currentAmount: number, previousAmount: number): { progress: number; color: string } {
  if (previousAmount <= 0) {
    return currentAmount > 0 ? { progress: 1, color: colors.danger } : { progress: 0, color: colors.track };
  }
  if (currentAmount >= previousAmount) {
    return { progress: 1, color: colors.danger };
  }
  return { progress: currentAmount / previousAmount, color: colors.primary };
}

function CategoryCard({ item }: { item: ExpenseCategoryBreakdown }) {
  const over = item.difference > 0;
  const accentColor = over ? colors.danger : colors.primary;
  const diffLabel =
    item.difference === 0 ? null : `${formatWon(Math.abs(item.difference))} ${over ? '초과' : '남음'}`;
  const bar = computeCategoryBar(item.currentAmount, item.previousAmount);

  return (
    <Pressable
      onPress={() => {
        // TODO: 카테고리 상세 화면 연결
      }}
    >
      <Card>
        <View style={styles.categoryHeaderRow}>
          <View style={styles.categoryTitleWrap}>
            <Ionicons name={CATEGORY_ICONS[item.category]} size={18} color={colors.textSecondary} />
            <Text style={styles.categoryTitle}>{CATEGORY_LABELS[item.category]}</Text>
          </View>
          {diffLabel ? <Text style={[styles.categoryDiff, { color: accentColor }]}>{diffLabel}</Text> : null}
        </View>

        <ProgressBar progress={bar.progress} color={bar.color} />

        <View style={styles.categoryFooterRow}>
          <Text style={styles.categoryUsed}>{formatWon(item.currentAmount)} 사용</Text>
          <Text style={styles.categoryPrev}>지난달 {formatWon(item.previousAmount)}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.sm },
  status: { marginTop: spacing.xl },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center', marginTop: spacing.xl },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  monthTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },

  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },

  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  budgetLabel: { fontSize: 13, color: colors.textSecondary },
  budgetAction: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },

  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.xs },
  categoryList: { gap: spacing.sm },

  categoryHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  categoryTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  categoryDiff: { fontSize: 12, fontWeight: '700' },
  categoryFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  categoryUsed: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  categoryPrev: { fontSize: 12, color: colors.textTertiary },
});