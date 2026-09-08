import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import MoneyText, { useCountUp } from '../../components/MoneyText';
import { colors, radius, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { ExpenseCategory, SupportEndForecast, SupportEndForecastResponse, SupportEndReduction } from '../../types';
import { CATEGORY_LABELS } from './expenseCategoryMeta';
import PercentInput from './PercentInput';

const WHITE_SOFT = 'rgba(255, 255, 255, 0.7)';
const WHITE_DIVIDER = 'rgba(255, 255, 255, 0.3)';

const DEFAULT_REDUCTION_RATE = 10;

// 절감률(rate, %)만큼 카테고리별 평균 지출을 줄였을 때의 금액을 계산.
// reducedAmount만 반올림하고 절감액(monthlySavings)은 뺄셈으로 도출한다 — 둘 다 따로
// 반올림하면 합이 averageAmount와 어긋나는 경우가 생긴다(백엔드의 고정 10% 계산과 같은 방식).
function computeReduction(
  categories: { category: ExpenseCategory; averageAmount: number }[],
  ratePercent: number,
  monthsUntilSupportEnd: number
) {
  let totalMonthlySavings = 0;
  const resultCategories = categories.map((c) => {
    const reducedAmount = Math.round(c.averageAmount * (1 - ratePercent / 100));
    const monthlySavings = c.averageAmount - reducedAmount;
    totalMonthlySavings += monthlySavings;
    return { category: c.category, averageAmount: c.averageAmount, reducedAmount, monthlySavings };
  });
  return {
    categories: resultCategories,
    totalMonthlySavings,
    totalSavingsByEnd: totalMonthlySavings * monthsUntilSupportEnd,
  };
}

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
          <MoneyText amount={forecast.incomeExcludingAllowance ?? 0} variant="medium" animate={false} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabelGray}>평균 지출</Text>
          <MoneyText amount={forecast.averageExpense ?? 0} variant="medium" animate={false} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabelBlack}>매달 부족액</Text>
          <MoneyText amount={shortfall} variant="medium" color={colors.danger} animate={false} />
        </View>
      </Card>

      {forecast.reduction ? <ReductionSection reduction={forecast.reduction} monthsUntilSupportEnd={forecast.monthsUntilSupportEnd} /> : null}
    </>
  );
}

function ReductionSection({
  reduction,
  monthsUntilSupportEnd,
}: {
  reduction: SupportEndReduction;
  monthsUntilSupportEnd: number;
}) {
  // rate: 절감률(%). 화면을 나가면(컴포넌트 언마운트) 초기화돼도 되므로 로컬 state로 충분하다.
  // isEditingRate가 true인 동안(타이핑 중)은 숫자를 즉시값으로만 바꾸고, 편집이 끝나면
  // (blur/제출) 그 순간의 변화만 한 번 카운트업된다 — MoneyText/useCountUp의 animate가
  // false→true로 바뀔 때 그 사이 값 차이만큼만 애니메이션되는 동작을 그대로 활용한다.
  const [rate, setRate] = useState(DEFAULT_REDUCTION_RATE);
  const [isEditingRate, setIsEditingRate] = useState(false);

  // 백엔드가 내려준 reducedAmount/totalMonthlySavings/totalSavingsByEnd는 고정 10% 기준이라
  // 쓰지 않는다. averageAmount만 가져와 rate로 다시 계산 — 계산이 한 곳(computeReduction)에서만
  // 일어나야 rate를 바꿔도 화면 곳곳의 숫자가 어긋나지 않는다.
  const result = computeReduction(
    reduction.categories.map((c) => ({ category: c.category, averageAmount: c.averageAmount })),
    rate,
    monthsUntilSupportEnd
  );

  return (
    <>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitleText}>지출을 </Text>
        <PercentInput
          value={rate}
          onChange={setRate}
          onCommit={setRate}
          onEditingChange={setIsEditingRate}
          textStyle={styles.sectionTitleText}
        />
        <Text style={styles.sectionTitleText}>% 줄여 저축하면</Text>
      </View>

      <Card>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.categoryCol, { textAlign: 'left' }]}>카테고리</Text>
          <Text style={[styles.tableHeaderCell, styles.amountCol]}>지금</Text>
          <Text style={[styles.tableHeaderCell, styles.amountCol, { textAlign: 'right' }]}>줄이면</Text>
        </View>
        <View style={styles.divider} />
        {result.categories.map((c) => (
          <View key={c.category} style={styles.tableRow}>
            <Text style={[styles.categoryName, styles.categoryCol]}>{CATEGORY_LABELS[c.category]}</Text>
            <Text style={[styles.currentAmount, styles.amountCol]}>{c.averageAmount.toLocaleString('ko-KR')}원</Text>
            <ReducedAmountText amount={c.reducedAmount} animate={!isEditingRate} />
          </View>
        ))}
      </Card>

      <Card style={styles.highlightCard}>
        <Text style={styles.highlightLabel}>수당 종료까지 {monthsUntilSupportEnd}개월 모으면</Text>
        <MoneyText amount={result.totalSavingsByEnd} variant="large" color={colors.white} animate={!isEditingRate} />

        <View style={styles.whiteDivider} />

        <View style={styles.row}>
          <Text style={styles.highlightRowLabel}>매달 더 저축할 수 있는 금액</Text>
          <MoneyText amount={result.totalMonthlySavings} variant="medium" color={colors.white} animate={!isEditingRate} />
        </View>
      </Card>
    </>
  );
}

// "줄이면" 열만 카운트업 — .map() 콜백 안에서 훅을 직접 부를 수 없어서 행 하나를 담당하는
// 컴포넌트로 뺐다. "지금" 열(currentAmount)은 그대로 정적 텍스트로 둔다.
function ReducedAmountText({ amount, animate }: { amount: number; animate: boolean }) {
  const display = useCountUp(amount, animate);
  return (
    <Text style={[styles.reducedAmount, styles.amountCol, { textAlign: 'right' }]}>
      {display.toLocaleString('ko-KR')}원
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.md, gap: spacing.md },
  status: { marginTop: spacing.xl },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center', marginTop: spacing.xl },

  sectionTitle: { fontSize: 19, fontWeight: '900', color: colors.textPrimary, marginLeft: spacing.xs, marginBottom: 6 },
  // 절감률 입력을 문장 중간에 끼워 넣기 위해 title을 Text 세 조각(그리고 PercentInput)으로
  // 나눠 한 줄(row)에 배치한다 — sectionTitle과 같은 폰트지만 마진은 row 쪽에 한 번만 준다.
  sectionTitleRow: { flexDirection: 'row', alignItems: 'baseline', marginLeft: spacing.xs, marginBottom: 6 },
  sectionTitleText: { fontSize: 19, fontWeight: '900', color: colors.textPrimary },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabelGray: { fontSize: 13, color: colors.textSecondary },
  rowLabelBlack: { fontSize: 13, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

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
});