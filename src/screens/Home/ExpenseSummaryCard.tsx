import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import { colors, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { ExpenseSummary } from '../../types';
import { formatWonShort } from '../../utils/money';

export default function ExpenseSummaryCard() {
  const navigation = useNavigation<any>();
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<ExpenseSummary>('/members/me/expense-summary');
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
        <Text style={styles.error}>{error ?? '지출 정보를 불러오지 못했습니다'}</Text>
      </Card>
    );
  }

  return (
    <Pressable
      onPress={() => navigation.navigate('ExpenseReport')}
    >
      <Card>
        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={styles.label}>이번 달 지출</Text>
            <MoneyText amount={summary.currentMonthTotal} variant="large" />
            <DiffText difference={summary.difference} />
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
      </Card>
    </Pressable>
  );
}

function DiffText({ difference }: { difference: number }) {
  if (difference === 0) {
    return <Text style={styles.diff}>지난달 같은 기간과 비슷해요</Text>;
  }

  const spent = difference > 0;
  return (
    <Text style={styles.diff}>
      지난달 같은 기간보다{' '}
      <Text style={[styles.diffAmount, { color: spent ? colors.danger : colors.primary }]}>
        {formatWonShort(difference)}
      </Text>{' '}
      {spent ? '더' : '덜'} 썼어요
    </Text>
  );
}

const styles = StyleSheet.create({
  statusCard: { minHeight: 72, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  label: { fontSize: 13, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  textCol: { flex: 1, gap: 2 },
  diff: { fontSize: 12, color: colors.textSecondary },
  diffAmount: { fontWeight: '700' },
});