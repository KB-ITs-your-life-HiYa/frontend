import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import { colors, radius, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { SupportEndForecast, SupportEndForecastResponse, SupportEndReduction } from '../../types';
import { CATEGORY_LABELS } from './expenseCategoryMeta';

const WHITE_SOFT = 'rgba(255, 255, 255, 0.7)';
const WHITE_DIVIDER = 'rgba(255, 255, 255, 0.3)';

export default function SupportEndForecastScreen() {
  const [data, setData] = useState<SupportEndForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<SupportEndForecastResponse>('/members/me/support-end-forecast');
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
  }, []);

  const forecast = data?.eligible ? data.forecast : null;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="수당 종료 대비" showBack showProfile={false} flat extraTopPadding={14} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.status} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : !forecast || !forecast.dataAvailable ? (
          <Text style={styles.error}>아직 표시할 수 있는 정보가 없어요</Text>
        ) : (
          <ForecastBody forecast={forecast} />
        )}
      </View>
    </View>
  );
}

function ForecastBody({ forecast }: { forecast: SupportEndForecast }) {
  const shortfall = forecast.monthlyShortfall ?? 0;

  return (
    <>
      <Text style={styles.sectionTitle}>수당 지급이 끝나면</Text>
      <Card>
        <View style={styles.row}>
          <Text style={styles.rowLabelGray}>수당 제외 수입</Text>
          <MoneyText amount={forecast.incomeExcludingAllowance ?? 0} variant="medium" />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabelGray}>평균 지출</Text>
          <MoneyText amount={forecast.averageExpense ?? 0} variant="medium" />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabelBlack}>매달 부족액</Text>
          <MoneyText amount={shortfall} variant="medium" color={colors.danger} />
        </View>
        <Text style={styles.runwayHint}>
          {forecast.savingsRunwayMonths != null ? (
            <>
              예적금으로 버틸 수 있는 기간 약 <Text style={styles.runwayHintEmphasis}>{forecast.savingsRunwayMonths}개월</Text>
            </>
          ) : (
            '지금처럼이면 예적금을 쓰지 않아도 될 것 같아요'
          )}
        </Text>
      </Card>

      {forecast.reduction ? <ReductionSection reduction={forecast.reduction} monthsUntilSupportEnd={forecast.monthsUntilSupportEnd} savingsRunwayMonths={forecast.savingsRunwayMonths} /> : null}
    </>
  );
}

function ReductionSection({
  reduction,
  monthsUntilSupportEnd,
  savingsRunwayMonths,
}: {
  reduction: SupportEndReduction;
  monthsUntilSupportEnd: number;
  savingsRunwayMonths: number | null;
}) {
  return (
    <>
      <Text style={styles.sectionTitle}>지출을 10% 줄여 저축하면</Text>

      <Card>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.categoryCol, { textAlign: 'left' }]}>카테고리</Text>
          <Text style={[styles.tableHeaderCell, styles.amountCol]}>지금</Text>
          <Text style={[styles.tableHeaderCell, styles.amountCol, { textAlign: 'right' }]}>줄이면</Text>
        </View>
        <View style={styles.divider} />
        {reduction.categories.map((c) => (
          <View key={c.category} style={styles.tableRow}>
            <Text style={[styles.categoryName, styles.categoryCol]}>{CATEGORY_LABELS[c.category]}</Text>
            <Text style={[styles.currentAmount, styles.amountCol]}>{c.averageAmount.toLocaleString('ko-KR')}원</Text>
            <Text style={[styles.reducedAmount, styles.amountCol, { textAlign: 'right' }]}>
              {c.reducedAmount.toLocaleString('ko-KR')}원
            </Text>
          </View>
        ))}
      </Card>

      <Card style={styles.highlightCard}>
        <Text style={styles.highlightLabel}>매달 더 저축할 수 있는 금액</Text>
        <MoneyText amount={reduction.totalMonthlySavings} variant="large" color={colors.white} />

        <View style={styles.whiteDivider} />

        <View style={styles.row}>
          <Text style={styles.highlightRowLabel}>종료까지 {monthsUntilSupportEnd}개월간 모으면</Text>
          <MoneyText amount={reduction.totalSavingsByEnd} variant="medium" color={colors.white} />
        </View>
        <View style={styles.row}>
          <Text style={styles.highlightRowLabel}>버틸 수 있는 기간</Text>
          <Text style={styles.highlightRowValue}>
            {savingsRunwayMonths != null && reduction.improvedRunwayMonths != null
              ? `${savingsRunwayMonths}개월 → ${reduction.improvedRunwayMonths}개월`
              : '충분해요'}
          </Text>
        </View>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.md, gap: spacing.md },
  status: { marginTop: spacing.xl },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center', marginTop: spacing.xl },

  sectionTitle: { fontSize: 15, fontWeight: '900', color: colors.textPrimary, marginLeft: spacing.xs },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabelGray: { fontSize: 13, color: colors.textSecondary },
  rowLabelBlack: { fontSize: 13, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  runwayHint: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
  runwayHintEmphasis: { fontWeight: '700', color: colors.primary },

  tableHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  tableHeaderCell: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  categoryCol: { flex: 1.2 },
  amountCol: { flex: 1, textAlign: 'center' },
  categoryName: { fontSize: 14, color: colors.textPrimary },
  currentAmount: { fontSize: 13, color: colors.textTertiary },
  reducedAmount: { fontSize: 14, fontWeight: '700', color: colors.primary },

  highlightCard: { backgroundColor: colors.primary },
  highlightLabel: { fontSize: 12, color: WHITE_SOFT, marginBottom: 2 },
  whiteDivider: { height: 1, backgroundColor: WHITE_DIVIDER, marginVertical: spacing.sm },
  highlightRowLabel: { fontSize: 13, color: WHITE_SOFT },
  highlightRowValue: { fontSize: 14, fontWeight: '700', color: colors.white },
});