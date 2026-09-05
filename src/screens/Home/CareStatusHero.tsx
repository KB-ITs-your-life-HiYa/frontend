import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import CircularGauge from '../../components/CircularGauge';
import PressableScale from '../../components/PressableScale';
import { colors, spacing } from '../../constants/colors';
import { useCare } from '../../hooks/useCare';

// 홈 화면 최상단 히어로 카드. "AI가 우리 자립준비를 계속 챙겨보고 있다"는 이 서비스의
// 핵심 가치를 한눈에 보여주는 자리라서, 새로운 점수를 따로 만들지 않고 온라인 케어가
// 이미 계산해두는 riskScore를 그대로 가져와 "안심 지수"로 뒤집어(100-riskScore) 보여준다.
// 케어 탭과 다른 숫자가 떠서 혼란을 주는 일이 없도록 한 값을 그대로 재사용하는 게 핵심.
const TONE = {
  NORMAL: {
    color: colors.primary,
    headline: '안정적으로 잘 관리되고 있어요',
    caption: '지금처럼만 유지하면 걱정 없어요',
  },
  CARE: {
    color: colors.warning,
    headline: '조금 더 살펴봐야 할 부분이 있어요',
    caption: 'AI 케어에서 자세한 내용을 확인해보세요',
  },
  HUMAN_CARE: {
    color: colors.danger,
    headline: '도움이 필요할 수 있어요',
    caption: '지금 바로 AI 케어를 확인해주세요',
  },
} as const;

export default function CareStatusHero() {
  const navigation = useNavigation<any>();
  const { summary, error } = useCare();

  if (error) return null;

  if (!summary) {
    return (
      <Card style={styles.loadingCard}>
        <ActivityIndicator color={colors.primary} />
      </Card>
    );
  }

  const peaceScore = Math.max(0, Math.min(100, 100 - summary.riskScore));
  const tone = TONE[summary.riskLevel] ?? TONE.NORMAL;

  return (
    <PressableScale onPress={() => navigation.navigate('Care' as never)}>
      <Card style={styles.card}>
        <CircularGauge value={peaceScore} size={68} strokeWidth={7} color={tone.color} showMax={false} />
        <View style={styles.textCol}>
          <Text style={styles.eyebrow}>AI 안심 지수</Text>
          <Text style={styles.headline}>{tone.headline}</Text>
          <Text style={styles.caption}>{tone.caption}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  loadingCard: { minHeight: 96, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  textCol: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary },
  headline: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  caption: { fontSize: 12, color: colors.textSecondary },
});
