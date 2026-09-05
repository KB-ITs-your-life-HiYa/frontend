import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import PressableScale from '../../components/PressableScale';
import { colors, radius, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { ExpenseSummary } from '../../types';
import { formatWonShort } from '../../utils/money';

// 이번 달 지출 vs 지난달 같은 기간 지출을 막대 두 개로 나란히 보여준다.
// 텍스트로 "2만원 덜 썼어요"만 읽는 것보다, 막대 높이 차이가 바로 눈에 들어온다.
function CompareBars({ current, previous }: { current: number; previous: number }) {
  const max = Math.max(current, previous, 1);
  const curAnim = useRef(new Animated.Value(0)).current;
  const prevAnim = useRef(new Animated.Value(0)).current;
  const spentMore = current > previous;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(prevAnim, {
        toValue: previous / max,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // height % 보간이라 native driver 불가
      }),
      Animated.timing(curAnim, {
        toValue: current / max,
        duration: 600,
        delay: 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [current, previous]);

  return (
    <View style={styles.compareWrap}>
      <View style={styles.compareCol}>
        <View style={styles.compareTrack}>
          <Animated.View
            style={[
              styles.compareFill,
              { height: prevAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: colors.track },
            ]}
          />
        </View>
        <Text style={styles.compareLabel}>지난달</Text>
      </View>
      <View style={styles.compareCol}>
        <View style={styles.compareTrack}>
          <Animated.View
            style={[
              styles.compareFill,
              {
                height: curAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                backgroundColor: spentMore ? colors.danger : colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.compareLabel}>이번달</Text>
      </View>
    </View>
  );
}

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
    <PressableScale onPress={() => navigation.navigate('ExpenseReport')}>
      <Card>
        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={styles.label}>이번 달 지출</Text>
            <MoneyText amount={summary.currentMonthTotal} variant="large" />
            <DiffText difference={summary.difference} />
          </View>
          <CompareBars current={summary.currentMonthTotal} previous={summary.lastMonthSamePeriodTotal} />
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
      </Card>
    </PressableScale>
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
  compareWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  compareCol: { alignItems: 'center', gap: 4, width: 30 },
  compareTrack: {
    width: 16,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  compareFill: { width: '100%', borderRadius: radius.sm },
  compareLabel: { fontSize: 10, color: colors.textTertiary },
});
