import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { colors, radius, spacing } from '../../constants/colors';

// 금융 습관 트레이닝 화면
// TODO: 콘텐츠/퀴즈 데이터를 서버에서 받아오도록 교체
const topics = [
  { id: '1', label: '신용·대출', icon: 'card-outline' as const, bg: colors.blueSoft },
  { id: '2', label: '저축·투자', icon: 'wallet-outline' as const, bg: colors.yellowSoft },
  { id: '3', label: '소비 습관', icon: 'cart-outline' as const, bg: colors.greenSoft },
];

export default function EducationScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>오늘의 금융 지식</Text>
        <Text style={styles.subtitle}>하루 1분, 경제 근육을 키우는 시간</Text>

        <Pressable style={styles.featureCard}>
          <View style={styles.featureImage}>
            <View style={styles.featureTag}>
              <Text style={styles.featureTagText}>습관 트레이닝</Text>
            </View>
            <View style={styles.featureTime}>
              <Ionicons name="time-outline" size={12} color={colors.white} />
              <Text style={styles.featureTimeText}>1분</Text>
            </View>
            <View style={styles.bookmark}>
              <Ionicons name="bookmark-outline" size={18} color={colors.white} />
            </View>
            <MaterialCommunityIcons
              name="finance"
              size={56}
              color="rgba(255,255,255,0.55)"
              style={styles.featureIcon}
            />
          </View>
          <View style={styles.featureBody}>
            <Text style={styles.featureKicker}>필수 상식</Text>
            <Text style={styles.featureTitle}>신용점수는 왜 중요할까?</Text>
            <Text style={styles.featureDesc} numberOfLines={2}>
              독립의 첫걸음, 좋은 신용점수 만들기. 앞으로 집을 구하거나 대출을 받을 때 신용점수가 중요한 이유를 알아봐요.
            </Text>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>관심 주제 탐색</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicRow}>
          {topics.map((t) => (
            <View key={t.id} style={[styles.topicCard, { backgroundColor: t.bg }]}>
              <View style={styles.topicIconCircle}>
                <Ionicons name={t.icon} size={20} color={colors.textPrimary} />
              </View>
              <Text style={styles.topicLabel}>{t.label}</Text>
            </View>
          ))}
        </ScrollView>

        <Card style={styles.quizCard}>
          <View style={styles.quizHeader}>
            <View style={styles.quizHeaderLeft}>
              <Ionicons name="trophy-outline" size={18} color={colors.accent} />
              <Text style={styles.quizTitle}>오늘의 퀴즈</Text>
            </View>
            <Text style={styles.quizProgress}>1 / 3</Text>
          </View>
          <Text style={styles.quizQuestion}>신용카드를 한도 꽉 채워 쓰는 것이 신용점수를 올리는 데 도움이 될까?</Text>
          <View style={styles.quizOption}>
            <Text style={styles.quizOptionText}>도움이 된다. 많이 쓸수록 좋다.</Text>
          </View>
          <View style={styles.quizOption}>
            <Text style={styles.quizOptionText}>도움이 안 된다. 한도의 30~50%만 쓰는 것이 좋다.</Text>
          </View>
          <Button label="정답 확인하기" onPress={() => {}} />
        </Card>

        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>이번 주 학습 진행도</Text>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressDays}>3/5일 달성</Text>
            <Text style={styles.progressPct}>60%</Text>
          </View>
          <ProgressBar progress={0.6} />
          <View style={styles.rewardRow}>
            <View style={styles.rewardBadges}>
              <View style={[styles.rewardCircle, styles.rewardUnlocked]}>
                <Ionicons name="trophy" size={16} color={colors.white} />
              </View>
              <View style={[styles.rewardCircle, styles.rewardLocked]}>
                <Ionicons name="lock-closed" size={14} color={colors.textTertiary} />
              </View>
            </View>
            <Text style={styles.rewardLink}>보상 확인 &gt;</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  featureImage: {
    height: 130,
    backgroundColor: colors.primary,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  featureIcon: { position: 'absolute', right: 16, bottom: 8 },
  featureTag: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  featureTagText: { fontSize: 11, fontWeight: '700', color: colors.white },
  featureTime: {
    position: 'absolute',
    top: spacing.md,
    left: 110,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 3,
  },
  featureTimeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  bookmark: { position: 'absolute', top: spacing.md, right: spacing.md },
  featureBody: { padding: spacing.md, gap: 4 },
  featureKicker: { fontSize: 12, fontWeight: '700', color: colors.primary },
  featureTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  featureDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  topicRow: { gap: spacing.sm, paddingBottom: spacing.lg },
  topicCard: { width: 110, borderRadius: radius.md, padding: spacing.sm, alignItems: 'flex-start', gap: spacing.sm },
  topicIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  quizCard: { gap: spacing.sm, marginBottom: spacing.md },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quizTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  quizProgress: { fontSize: 13, color: colors.textTertiary, fontWeight: '600' },
  quizQuestion: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 20 },
  quizOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
  },
  quizOptionText: { fontSize: 13, color: colors.textPrimary },
  progressCard: {},
  progressLabel: { fontSize: 12, color: colors.textTertiary },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4, marginBottom: spacing.sm },
  progressDays: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  progressPct: { fontSize: 15, fontWeight: '800', color: colors.primary },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  rewardBadges: { flexDirection: 'row', gap: spacing.sm },
  rewardCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rewardUnlocked: { backgroundColor: colors.accent },
  rewardLocked: { backgroundColor: colors.graySoft },
  rewardLink: { fontSize: 12, color: colors.primary, fontWeight: '600' },
});
