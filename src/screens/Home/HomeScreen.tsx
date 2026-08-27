import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import SectionHeader from '../../components/SectionHeader';
import StackedBar from '../../components/StackedBar';
import { colors, radius, spacing } from '../../constants/colors';

// 홈 화면 — D-Day 생활비 관리 대시보드
// 기획서 "1. D-Day 생활비 관리" 항목을 화면 단위로 구현:
//   첫 목돈 배분 제안 / 소비 패턴 진단·절약 제안 / 월 생활비 배분 / D-365 대비 모드
// TODO: 하드코딩된 값들을 services/api.ts 연동 후 서버 데이터로 교체
const firstFund = [
  { label: '보증금', amount: 9_000_000, color: colors.primary },
  { label: '생활 초기비', amount: 3_000_000, color: colors.accent },
  { label: '비상금', amount: 3_000_000, color: colors.success },
];

const monthlyBudget = [
  { label: '고정비', amount: 700_000, color: colors.primary },
  { label: '변동비', amount: 400_000, color: colors.accent },
  { label: '여유분', amount: 140_000, color: colors.success },
];

const savingActions = [
  '외식비가 지난달보다 25% 늘었어요 — 월 15만원 절감을 목표로 해보세요.',
  '고정비 비중이 56%로 평균보다 높아요 — 통신비 요금제를 확인해보세요.',
  '이번 달 제안대로 아끼면, 자립수당 종료 전까지 약 180만원을 더 모을 수 있어요.',
];

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Badge label="자립수당 종료까지 D-1,647" icon="flag" />

        <Card style={styles.balanceCard}>
          <Text style={styles.label}>이번 달 잔액</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balance}>8,420,000</Text>
            <Text style={styles.won}>원</Text>
          </View>
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={14} color={colors.warning} />
            <Text style={styles.warningText}>지금 페이스라면 약 30개월 뒤 소진 예상</Text>
          </View>
        </Card>
        <Button label="자세히 보기 →" onPress={() => {}} />

        {/* 첫 목돈(초기 지원금) 배분 제안 */}
        <SectionHeader title="첫 목돈 배분 제안" />
        <Card style={styles.gapCard}>
          <Text style={styles.cardCaption}>초기 지원금 15,000,000원을 이렇게 나눠보는 걸 추천해요</Text>
          <StackedBar segments={firstFund} />
        </Card>

        {/* 소비 패턴 진단 → 상태 판정 + 절약·저축 액션 제안 */}
        <SectionHeader title="이번 달 소비 진단" />
        <Card style={styles.gapCard}>
          <View style={styles.diagnosisRow}>
            <Badge label="과소비 주의" tone="danger" icon="alert-circle" />
            <Text style={styles.diagnosisHint}>평균보다 지출이 8% 많아요</Text>
          </View>
          {savingActions.map((action) => (
            <View key={action} style={styles.actionRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginTop: 1 }} />
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </Card>

        {/* 월 생활비 배분: 고정비 · 변동비 · 여유분 */}
        <SectionHeader title="월 생활비 배분" />
        <Card style={styles.gapCard}>
          <Text style={styles.cardCaption}>이번 달 지출 1,240,000원 기준</Text>
          <StackedBar segments={monthlyBudget} />
        </Card>

        {/* D-365 대비 모드: 자립수당 종료 1년 전부터 활성화되는 누적 진단 기능 */}
        <SectionHeader title="D-365 대비 모드" />
        <Card style={styles.futureCard}>
          <View style={styles.futureIconWrap}>
            <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Badge label="D-365부터 자동 활성화" tone="gray" />
            <Text style={styles.futureTitle}>지원금 없이도 생활이 가능한지 미리 진단해드려요</Text>
            <Text style={styles.futureDesc}>
              자립수당 종료 1년 전이 되면, 그동안 누적된 지출 패턴을 분석해서 지원금이 빠진 소득만으로 생활이
              가능한지 진단하고 대비 전략을 안내해드릴게요.
            </Text>
          </View>
        </Card>

        <SectionHeader title="할 일 목록" actionLabel="모두 보기" />
        <TodoCard
          ddayLabel="D-4"
          ddayTone="primary"
          title="청년내일저축계좌 납입"
          iconBg={colors.primaryLight}
          iconColor={colors.primary}
          icon="piggy-bank"
        />
        <TodoCard
          ddayLabel="D-60"
          ddayTone="accent"
          title="청년내일저축계좌 만기 안내"
          iconBg={colors.yellowSoft}
          iconColor={colors.warning}
          icon="calendar-month"
        />
      </ScrollView>
    </View>
  );
}

function TodoCard({
  ddayLabel,
  ddayTone,
  title,
  iconBg,
  iconColor,
  icon,
}: {
  ddayLabel: string;
  ddayTone: 'primary' | 'accent';
  title: string;
  iconBg: string;
  iconColor: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <Card style={styles.todoCard}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.todoTextCol}>
        <Badge label={ddayLabel} tone={ddayTone} />
        <Text style={styles.todoTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  balanceCard: { gap: 6, marginTop: spacing.sm },
  label: { fontSize: 13, color: colors.textSecondary },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  balance: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  won: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginLeft: 4, marginBottom: 4 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginTop: 6,
    gap: 6,
  },
  warningText: { fontSize: 12, color: colors.warning, fontWeight: '600', flexShrink: 1 },
  gapCard: { gap: spacing.sm, marginBottom: spacing.xs },
  cardCaption: { fontSize: 12, color: colors.textTertiary },
  diagnosisRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  diagnosisHint: { fontSize: 12, color: colors.textTertiary },
  actionRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  actionText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  futureCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  futureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.graySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  futureTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  futureDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  todoCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  todoTextCol: { flex: 1, gap: 4 },
  todoTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
});
