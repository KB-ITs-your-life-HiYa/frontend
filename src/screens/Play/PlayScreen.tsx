import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import PuzzleBoard from '../../components/PuzzleBoard';
import { colors, radius, spacing } from '../../constants/colors';
import { PUZZLE_COVERS } from '../../constants/puzzleAssets';
import { habitApi } from '../../services/habit';
import { ApiError } from '../../services/api';
import {
  HabitPuzzleProgress,
  HabitPuzzleSetSummary,
  HabitTodayQuiz,
  HabitTopicCategory,
} from '../../types/habit';

// 놀이 탭 — 금융 습관 트레이닝을 "퍼즐 수집" 게임으로 만든 화면
// 퀴즈를 맞히면 현재 진행 중인 퍼즐 세트에 조각이 하나씩 쌓이고, 다 모으면 다음 세트로 넘어간다.
// "금융 상식 쑥쑥"은 카테고리(신용/대출, 저축/투자, 소비습관) 카드를 먼저 보여주고,
// 카드를 누르면 그 카테고리의 세부 토픽 목록(TopicCategoryScreen)으로 들어간다.
const TOPIC_STYLES: { bg: string; iconColor: string }[] = [
  { bg: colors.blueSoft, iconColor: colors.primary },
  { bg: colors.yellowSoft, iconColor: colors.warning },
  { bg: colors.accentLight, iconColor: '#B78103' },
  { bg: colors.greenSoft, iconColor: colors.success },
];

export default function PlayScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - spacing.md * 2 - spacing.md * 2, 320);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState<HabitPuzzleProgress | null>(null);
  const [sets, setSets] = useState<HabitPuzzleSetSummary[]>([]);
  const [quiz, setQuiz] = useState<HabitTodayQuiz | null>(null);
  const [categories, setCategories] = useState<HabitTopicCategory[]>([]);

  const [quizOpen, setQuizOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [progressRes, setsRes, quizRes, categoriesRes] = await Promise.all([
        habitApi.getPuzzleProgress(),
        habitApi.listPuzzleSets(),
        habitApi.getTodayQuiz(),
        habitApi.listTopicCategories(),
      ]);
      setProgress(progressRes);
      setSets(setsRes);
      setQuiz(quizRes);
      setCategories(categoriesRes);
    } catch {
      setError('놀이 탭 정보를 불러오지 못했어요. 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAnswer = async (optionId: number) => {
    if (submitting || !quiz || quiz.answered) return;
    setSubmitting(true);
    setAnswerError(null);
    try {
      const res = await habitApi.submitAnswer(optionId);
      setQuiz((prev) =>
        prev
          ? {
              ...prev,
              answered: true,
              result: { selectedOptionId: optionId, correct: res.correct, explanation: res.explanation },
            }
          : prev
      );
      setProgress(res.progress);
      habitApi.listPuzzleSets().then(setSets).catch(() => {});

      if (res.justCompleted) {
        Alert.alert('퍼즐 완성!', `'${res.progress.title}' 퍼즐을 모두 모았어요. 다음 퍼즐이 열렸어요!`);
      }
    } catch (e) {
      if (e instanceof ApiError && e.code === 'HABIT_QUIZ_ALREADY_ANSWERED') {
        const fresh = await habitApi.getTodayQuiz().catch(() => null);
        if (fresh) setQuiz(fresh);
      } else {
        setAnswerError('답변 제출에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader />
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !progress || !quiz) {
    return (
      <View style={styles.screen}>
        <ScreenHeader />
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>{error ?? '정보를 불러오지 못했어요.'}</Text>
          <Button label="다시 시도" size="sm" onPress={() => { setLoading(true); loadAll(); }} style={{ marginTop: spacing.md }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.puzzleCard}>
          <View style={styles.puzzleHeaderRow}>
            <Text style={styles.puzzleTitle}>{progress.title}</Text>
            {progress.allSetsCompleted ? (
              <View style={styles.doneBadge}>
                <Ionicons name="trophy" size={12} color={colors.warning} />
                <Text style={styles.doneBadgeText}>모든 퍼즐 완성</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.boardWrap}>
            <PuzzleBoard assetKey={progress.assetKey} collectedPieces={progress.collectedPieces} size={boardSize} />
          </View>

          <View style={styles.puzzleFooter}>
            <Text style={styles.puzzleLabel}>진행률</Text>
            <Text style={styles.puzzleCount}>
              {progress.collectedPieces} / {progress.totalPieces} 조각 모음
            </Text>
          </View>
          <ProgressBar progress={progress.collectedPieces / progress.totalPieces} />

          {sets.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.setStrip} contentContainerStyle={{ gap: spacing.sm }}>
              {sets.map((s) => {
                const cover = PUZZLE_COVERS[s.assetKey];
                const locked = s.status === 'LOCKED';
                return (
                  <View key={s.puzzleSetId} style={styles.setThumbWrap}>
                    <View style={styles.setThumb}>
                      {cover ? (
                        <Image source={cover} style={[styles.setThumbImage, locked && styles.setThumbLocked]} />
                      ) : null}
                      {locked ? (
                        <View style={styles.lockOverlay}>
                          <Ionicons name="lock-closed" size={14} color={colors.white} />
                        </View>
                      ) : s.status === 'COMPLETED' ? (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={12} color={colors.white} />
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.setThumbLabel} numberOfLines={1}>
                      {locked ? '???' : s.title}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : null}
        </Card>

        <Card style={styles.quizCard}>
          <View style={styles.quizHeaderRow}>
            <Ionicons name="bulb-outline" size={18} color={colors.warning} />
            <Text style={styles.quizTitle}>오늘의 퀴즈</Text>
          </View>
          <Text style={styles.quizSubtitle}>퀴즈를 풀고 퍼즐 조각을 획득하세요!</Text>

          <View style={styles.quizQuestionBox}>
            <Text style={styles.quizQuestionText}>{quiz.question}</Text>
          </View>

          {!quizOpen && !quiz.answered ? (
            <Button label="퀴즈 풀기" onPress={() => setQuizOpen(true)} />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {quiz.options.map((opt) => {
                const isSelected = quiz.result?.selectedOptionId === opt.id;
                const showCorrect = quiz.answered && isSelected && quiz.result?.correct;
                const showIncorrect = quiz.answered && isSelected && quiz.result?.correct === false;
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.optionRow,
                      showCorrect ? styles.optionCorrect : null,
                      showIncorrect ? styles.optionIncorrect : null,
                    ]}
                    onPress={() => handleAnswer(opt.id)}
                    disabled={submitting || quiz.answered}
                  >
                    <Text style={styles.optionText}>{opt.label}</Text>
                  </Pressable>
                );
              })}
              {quiz.answered && quiz.result ? (
                <>
                  <Text style={quiz.result.correct ? styles.resultCorrect : styles.resultIncorrect}>
                    {quiz.result.correct ? '정답이에요! 퍼즐 조각을 1개 획득했어요.' : '아쉬워요, 오늘 퀴즈는 여기까지예요.'}
                  </Text>
                  <Text style={styles.explanationText}>{quiz.result.explanation}</Text>
                </>
              ) : null}
              {answerError ? <Text style={styles.resultIncorrect}>{answerError}</Text> : null}
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>금융 상식 쑥쑥</Text>
        {categories.map((c, i) => {
          const style = TOPIC_STYLES[i % TOPIC_STYLES.length];
          return (
            <Pressable
              key={c.id}
              onPress={() => navigation.navigate('TopicCategory', { categoryId: c.id, title: c.title })}
            >
              <Card style={styles.topicCard}>
                <View style={[styles.topicIcon, { backgroundColor: style.bg }]}>
                  <MaterialCommunityIcons name={c.icon as any} size={22} color={style.iconColor} />
                </View>
                <Text style={styles.topicTitle}>{c.title}</Text>
                <Text style={styles.topicSubtitle}>{c.subtitle}</Text>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  errorText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  puzzleCard: { gap: spacing.sm },
  puzzleHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  puzzleTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  doneBadgeText: { fontSize: 11, fontWeight: '700', color: colors.warning },
  boardWrap: { alignItems: 'center' },
  puzzleFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  puzzleLabel: { fontSize: 13, color: colors.textSecondary },
  puzzleCount: { fontSize: 13, fontWeight: '700', color: colors.primary },
  setStrip: { marginTop: spacing.xs },
  setThumbWrap: { width: 64, alignItems: 'center', gap: 4 },
  setThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.track,
  },
  setThumbImage: { width: '100%', height: '100%' },
  setThumbLocked: { opacity: 0.35 },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25,31,40,0.25)',
  },
  checkBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setThumbLabel: { fontSize: 10, color: colors.textTertiary },
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
  explanationText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.xs },
  topicCard: { gap: 8, alignItems: 'flex-start' },
  topicIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  topicSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: -6 },
});
