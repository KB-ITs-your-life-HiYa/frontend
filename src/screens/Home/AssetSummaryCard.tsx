import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import { colors, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { AccountSummary, AccountType } from '../../types';

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
    <Pressable style={styles.row} onPress={() => navigation.navigate('AccountList', { type })}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Text style={styles.iconSymbol}>{symbol}</Text>
      </View>
      <View style={styles.rowTextCol}>
        <Text style={styles.rowLabel}>{label}</Text>
        <MoneyText amount={amount} variant="medium" />
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statusCard: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  label: { fontSize: 13, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconSymbol: { color: colors.white, fontSize: 16, fontWeight: '700' },
  rowTextCol: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 13, color: colors.textSecondary },
});