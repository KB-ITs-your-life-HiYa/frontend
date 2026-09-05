import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import PressableScale from '../../components/PressableScale';
import { colors, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { AccountSummary, AccountType } from '../../types';

// 계좌·현금 vs 예적금이 순자산에서 차지하는 비중을 막대 하나로 보여준다.
// 아래 두 행의 아이콘 색(주황=계좌·현금, 파랑=예적금)과 그대로 맞춰서 별도 범례 없이도
// 뭐가 뭔지 바로 알아보게 했다.
function CompositionBar({ deposit, savings }: { deposit: number; savings: number }) {
  const total = deposit + savings;
  const depositPct = total > 0 ? deposit / total : 0;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: depositPct,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width 보간이라 native driver 불가
    }).start();
  }, [depositPct]);

  if (total <= 0) return null;

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.compTrack}>
      <Animated.View style={[styles.compFill, { width }]} />
    </View>
  );
}

export default function AssetSummaryCard() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<AccountSummary>('/members/me/accounts/summary');
        if (!cancelled) setSummary(data);
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

  if (loading) {
    return (
      <Card style={styles.statusCard}>
        <ActivityIndicator color={colors.primary} />
      </Card>
    );
  }

  if (error || !summary) {
    return (
      <Card style={styles.statusCard}>
        <Text style={styles.error}>{error ?? '자산 정보를 불러오지 못했습니다'}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.label}>순자산</Text>
      <MoneyText amount={summary.netAsset} variant="large" />
      <CompositionBar deposit={summary.depositTotal} savings={summary.savingsTotal} />

      <View style={styles.divider} />
      <AssetRow symbol="₩" iconBg={colors.accent} label="계좌·현금" amount={summary.depositTotal} type="DEPOSIT" />

      <View style={styles.divider} />
      <AssetRow symbol="=" iconBg={colors.primary} label="예적금" amount={summary.savingsTotal} type="SAVINGS" />
    </Card>
  );
}

function AssetRow({
  symbol,
  iconBg,
  label,
  amount,
  type,
}: {
  symbol: string;
  iconBg: string;
  label: string;
  amount: number;
  type: AccountType;
}) {
  const navigation = useNavigation<any>();

  return (
    <PressableScale style={styles.row} onPress={() => navigation.navigate('AccountList', { type })}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Text style={styles.iconSymbol}>{symbol}</Text>
      </View>
      <View style={styles.rowTextCol}>
        <Text style={styles.rowLabel}>{label}</Text>
        <MoneyText amount={amount} variant="medium" />
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  statusCard: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  label: { fontSize: 13, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  compTrack: {
    marginTop: spacing.sm,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  compFill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconSymbol: { color: colors.white, fontSize: 16, fontWeight: '700' },
  rowTextCol: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 13, color: colors.textSecondary },
});
