import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { colors, radius, spacing } from '../../constants/colors';

// 놀이 탭 — 금융 습관 트레이닝을 "퍼즐 수집" 게임으로 만든 화면
const TOTAL_PIECES = 16;
const PIECE_COLORS = ['#1D4ED8', '#3B82F6', '#F5B300', '#B45309', '#2563EB', '#BFDBFE', '#FDE7B0'];

const QUIZ = {
  question: '신용카드를 사용할 때, 할부 결제는 신용점수에 어떤 영향을 미칠까요?',
  options: [
    { id: 'a', label: '할부금을 연체 없이 갚으면 문제되지 않는다', correct: true },
    { id: 'b', label: '할부 결제 자체가 신용점수를 무조건 낮춘다', correct: false },
  ],
};

const topics = [
  {
    id: '1',
    title: '신용, 대출',
    subtitle: '안전한 금융 생활의 첫걸음',
    icon: 'bank' as const,
    bg: colors.blueSoft,
    iconColor: colors.primary,
    detail: '신용점수는 연체 없이 꾸준히 상환한 이력, 신용 사용 비율(한도의 30~50%)로 관리하는 게 좋아요.',
  },
  {
    id: '2',
    title: '저축, 투자',
    subtitle: '미래를 위한 든든한 준비',
    icon: 'piggy-bank' as const,
    bg: colors.yellowSoft,
    iconColor: colors.warning,
    detail: '청년내일저축계좌, 청년도약계좌처럼 정부 매칭 지원이 있는 저축 상품부터 채우는 걸 추천해요.',
  },
  {
    id: '3',
    title: '소비 습관',
    subtitle: '현명하게 쓰고 관리하기',
    icon: 'clipboard-text-outline' as const,
    bg: colors.accentLight,
    iconColor: '#B78103',
    detail: '고정비·변동비·여유분을 나눠서 관리하면, 갑자기 지출이 늘어도 쉽게 알아챌 수 있어요.',
  },
];

export default function PlayScreen() {
  const navigation = useNavigation<any>();
  const [collected, setCollected] = useState(7);
  const [quizOpen, setQuizOpen] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const pieces = useMemo(() => {
    return Array.from({ length: TOTAL_PIECES }, (_, i) => (i < collected ? PIECE_COLORS[i % PIECE_COLORS.length] : null));
  }, [collected]);

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setResult('correct');
      setCollected((c) => Math.min(TOTAL_PIECES, c + 1));
    } else {
      setResult('incorrect');
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.puzzleCard}>
          <Text style={styles.puzzleTitle}>퍼즐 완성도</Text>
          <View style={styles.grid}>
            {pieces.map((color, i) => (
              <View key={i} style={[styles.piece, { backgroundColor: color ?? colors.track }]} />
            ))}
          </View>
          <View style={styles.puzzleFooter}>
            <Text style={styles.puzzleLabel}>진행률</Text>
            <Text style={styles.puzzleCount}>
              {collected} / {TOTAL_PIECES} 조각 모음
            </Text>
          </View>
          <ProgressBar progress={collected / TOTAL_PIECES} />
        </Card>

        <Card style={styles.quizCard}>
          <View style={styles.quizHeaderRow}>
            <Ionicons name="bulb-outline" size={18} color={colors.warning} />
            <Text style={styles.quizTitle}>오늘의 퀴즈</Text>
          </View>
          <Text style={styles.quizSubtitle}>퀴즈를 풀고 퍼즐 조각을 획득하세요!</Text>

          <View style={styles.quizQuestionBox}>
            <Text style={styles.quizQuestionText}>{QUIZ.question}</Text>
          </View>

          {!quizOpen ? (
            <Button label="퀴즈 풀기" onPress={() => setQuizOpen(true)} />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {QUIZ.options.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.optionRow,
                    result === 'correct' && opt.correct ? styles.optionCorrect : null,
                    result === 'incorrect' && !opt.correct ? styles.optionIncorrect : null,
                  ]}
                  onPress={() => handleAnswer(opt.correct)}
                  disabled={result === 'correct'}
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                </Pressable>
              ))}
              {result === 'correct' ? (
                <Text style={styles.resultCorrect}>정답이에요! 퍼즐 조각을 1개 획득했어요.</Text>
              ) : result === 'incorrect' ? (
                <Text style={styles.resultIncorrect}>아쉬워요, 다시 한번 골라보세요.</Text>
              ) : null}
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>금융 상식 쑥쑥</Text>
        {topics.map((t) => (
          <Pressable key={t.id} onPress={() => navigation.navigate('TopicDetail', { title: t.title })}>
            <Card style={styles.topicCard}>
              <View style={[styles.topicIcon, { backgroundColor: t.bg }]}>
                <MaterialCommunityIcons name={t.icon} size={22} color={t.iconColor} />
              </View>
              <Text style={styles.topicTitle}>{t.title}</Text>
              <Text style={styles.topicSubtitle}>{t.subtitle}</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  puzzleCard: { gap: spacing.sm },
  puzzleTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  piece: { width: '23%', aspectRatio: 1, borderRadius: 10 },
  puzzleFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  puzzleLabel: { fontSize: 13, color: colors.textSecondary },
  puzzleCount: { fontSize: 13, fontWeight: '700', color: colors.primary },
  quizCard: { gap: spacing.sm },
  quizHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quizTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  quizSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: -6 },
  quizQuestionBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  quizQuestionText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', lineHeight: 20 },
  optionRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
  },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.successLight },
  optionIncorrect: { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  optionText: { fontSize: 13, color: colors.textPrimary },
  resultCorrect: { fontSize: 12, color: colors.success, fontWeight: '600' },
  resultIncorrect: { fontSize: 12, color: colors.danger, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.xs },
  topicCard: { gap: 8, alignItems: 'flex-start' },
  topicIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  topicSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: -6 },
});
