import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import CenterModal from '../../components/CenterModal';
import MoneyInput from '../../components/MoneyInput';
import { colors, radius, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { BudgetResponse, ExpenseCategory } from '../../types';
import { formatWon } from '../../utils/money';
import { CATEGORY_ICONS, CATEGORY_LABELS } from './expenseCategoryMeta';

interface Props {
  visible: boolean;
  month: string; // YYYY-MM. 리포트에서 보고 있는 달
  onClose: () => void;
  onSaved: () => void; // 저장/삭제 성공 시 호출 — 리포트 재조회용
}

type Amounts = Record<ExpenseCategory, number>;

function emptyAmounts(): Amounts {
  return { HOUSING_UTILITY: 0, FOOD: 0, TRANSPORT: 0, LIVING_MEDICAL: 0, LEISURE_SHOPPING: 0, SAVINGS: 0 };
}

export default function BudgetModal({ visible, month, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [totalAmount, setTotalAmount] = useState(0);
  const [amounts, setAmounts] = useState<Amounts>(emptyAmounts);
  const [lastMonthAmounts, setLastMonthAmounts] = useState<Amounts>(emptyAmounts);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      setSaveError(null);
      try {
        const res = await api.get<BudgetResponse>(`/members/me/budget?month=${month}`);
        if (cancelled) return;
        setTotalAmount(res.totalAmount ?? 0);
        const nextAmounts = emptyAmounts();
        const nextLastMonth = emptyAmounts();
        for (const item of res.categories) {
          nextAmounts[item.category] = item.amount ?? 0;
          nextLastMonth[item.category] = item.lastMonthAmount;
        }
        setAmounts(nextAmounts);
        setLastMonthAmounts(nextLastMonth);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof ApiError ? e.message : '예산을 불러오지 못했습니다');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [visible, month]);

  const categorySum = (Object.keys(amounts) as ExpenseCategory[])
      .filter((c) => c !== 'SAVINGS')
      .reduce((sum, c) => sum + amounts[c], 0);
  const remaining = totalAmount - categorySum;
  // 0원도 저장 가능한 값이다 — "예산 없음" 으로 취급해 DELETE 로 이어진다.
  const canSave = !saving && remaining >= 0;

  const setAmount = (category: ExpenseCategory, next: number) => {
    setAmounts((prev) => ({ ...prev, [category]: next }));
  };

  const handleReset = () => {
    setTotalAmount(0);
    setAmounts(emptyAmounts());
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (totalAmount > 0) {
        const categories = (Object.keys(amounts) as ExpenseCategory[])
            .filter((c) => amounts[c] > 0)
            .map((c) => ({ category: c, amount: amounts[c] }));
        await api.put(`/members/me/budget`, { month, totalAmount, categories });
      } else {
        try {
          await api.delete(`/members/me/budget?month=${month}`);
        } catch (e) {
          // 원래도 예산이 없던 달이면 지울 것도 없다 — 이미 원하는 상태이므로 에러로 보여주지 않는다.
          if (!(e instanceof ApiError && e.code === 'BUDGET_NOT_FOUND')) throw e;
        }
      }
      onSaved();
      onClose();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : '예산을 저장하지 못했습니다. 잠시 후 다시 시도해주세요');
    } finally {
      setSaving(false);
    }
  };

  const categoryList = Object.keys(CATEGORY_LABELS) as ExpenseCategory[];

  return (
    <CenterModal visible={visible} onClose={onClose} contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>예산 설정</Text>
        <Pressable style={styles.headerSide} onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.status} />
      ) : loadError ? (
        <Text style={styles.error}>{loadError}</Text>
      ) : (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.totalBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>월 예산</Text>
                <MoneyInput value={totalAmount} onChange={setTotalAmount} size="lg" editable={!saving} />
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>설정 가능 예산</Text>
                <Text style={[styles.remaining, remaining < 0 ? styles.remainingNegative : null]}>
                  {remaining >= 0 ? `${formatWon(remaining)} 남음` : `${formatWon(-remaining)} 초과`}
                </Text>
              </View>
            </View>

            <View style={styles.categoryList}>
              {categoryList.map((category) => (
                <View key={category} style={styles.categoryCard}>
                  <View style={styles.categoryIcon}>
                    <Ionicons name={CATEGORY_ICONS[category]} size={18} color={colors.textSecondary} />
                  </View>
                  <View style={styles.categoryMid}>
                    <Text style={styles.categoryName}>{CATEGORY_LABELS[category]}</Text>
                    <Text style={styles.categoryPrev}>지난달 {formatWon(lastMonthAmounts[category])}</Text>
                  </View>
                  <MoneyInput
                    value={amounts[category]}
                    onChange={(next) => setAmount(category, next)}
                    size="md"
                    editable={!saving}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          {saveError ? <Text style={styles.error}>{saveError}</Text> : null}

          <View style={styles.footer}>
            <Button
                label={saving ? '저장 중…' : '저장'}
                onPress={handleSave}
                disabled={!canSave}
                style={styles.saveButton}
            />
            <Pressable onPress={handleReset} disabled={saving} hitSlop={8}>
              <Text style={styles.resetText}>초기화</Text>
            </Pressable>
          </View>
        </>
      )}
    </CenterModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md + 14,
    paddingBottom: spacing.lg,
  },
  status: { marginVertical: spacing.xl },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center', marginHorizontal: spacing.md, marginVertical: spacing.sm },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm + 14,
  },
  headerSide: { width: 36, alignItems: 'flex-end', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },

  scroll: { flexShrink: 1 },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md },

  totalBox: { gap: spacing.xs },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  totalLabel: { fontSize: 13, color: colors.textSecondary },
  remaining: { fontSize: 15, fontWeight: '700', color: colors.primary },
  remainingNegative: { color: colors.danger },

  categoryList: { gap: spacing.sm },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryMid: { flex: 1, gap: 2 },
  categoryName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  categoryPrev: { fontSize: 12, color: colors.textTertiary },

  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm + 14, gap: spacing.sm },
  saveButton: { width: '100%' },
  resetText: { fontSize: 13, color: colors.textTertiary, textAlign: 'center' },
});