import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
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
import PressableScale from '../../components/PressableScale';
import { useRiseIn } from '../../hooks/useRiseIn';
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
import { getCategoryIconStyle } from '../../constants/habitStyles';

// 놀이 탭 — 금융 습관 트레이닝을 "퍼즐 수집" 게임으로 만든 화면
// 퀴즈를 맞히면 현재 진행 중인 퍼즐 세트에 조각이 하나씩 쌓이고, 다 모으면 다음 세트로 넘어간다.
// "금융 상식 쑥쑥"은 카테고리(신용/대출, 저축/투자, 소비습관) 카드를 먼저 보여주고,
// 카드를 누르면 그 카테고리의 세부 토픽 목록(TopicCategoryScreen)으로 들어간다.
//
// 화면이 밋밋하다는 피드백을 받아서, 정보 전달과 무관한 순수 장식 애니메이션 대신
// "지금 뭘 하면 좋은지" / "방금 무슨 일이 있었는지"를 눈으로 알려주는 동적 요소를 넣었다.
//   1) 화면 진입 시 카드들이 순서대로 살짝 떠오르며 나타남 (퍼즐 → 퀴즈 → 금융 상식)
//   2) 오늘의 퀴즈를 아직 안 풀었으면 전구 아이콘 뒤에 은은한 펄스를 줘서 "여기 할 일 있어요" 신호
//   3) 퀴즈를 맞혀서 조각이 늘어나면 진행률 옆에 "+1 조각"이 떠올랐다 사라짐
//   4) 진행률 바가 순간이동 대신 부드럽게 채워짐(ProgressBar 자체 애니메이션)
//   5) 카드/버튼을 누르면 살짝 눌리는 느낌(PressableScale)
//   6) 정답이면 고른 선택지가 통통, 오답이면 좌우로 짧게 흔들려서 결과가 몸으로 느껴짐
//   7) 퍼즐을 다 모으면 기본 Alert 대신 화면 안에서 별이 퍼지는 축하 오버레이가 뜸
//   8) 잠겨 있던 다음 퍼즐 세트가 풀리는 순간, 그 썸네일만 반짝이며 팝업됨
//   (새 조각이 보드에 나타나는 등장 애니메이션은 PuzzleBoard 컴포넌트 쪽에 있음)
// (useRiseIn은 홈 화면에서도 똑같이 쓰려고 src/hooks/useRiseIn.ts로 뺐다.)

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

  // 1) 진입 애니메이션 — 로딩이 끝나는 순간 순서대로 떠오른다.
  const puzzleRise = useRiseIn(0, !loading);
  const quizRise = useRiseIn(90, !loading);
  const listRise = useRiseIn(180, !loading);

  // 2) 오늘의 퀴즈 전구 펄스 — 안 풀었을 때만 은은하게 반복
  const bulbPulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!quiz || quiz.answered) {
      bulbPulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bulbPulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(bulbPulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [quiz?.answered]);
  const bulbGlowStyle = {
    opacity: bulbPulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
    transform: [{ scale: bulbPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
  };

  // 3) "+1 조각" — 조각 수가 늘어난 순간에만 떠올랐다 사라진다.
  const prevPiecesRef = useRef<number | undefined>(undefined);
  const [showGain, setShowGain] = useState(false);
  const gainAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const prev = prevPiecesRef.current;
    if (progress && prev !== undefined && progress.collectedPieces > prev) {
      setShowGain(true);
      gainAnim.setValue(0);
      Animated.timing(gainAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setShowGain(false));
    }
    if (progress) prevPiecesRef.current = progress.collectedPieces;
  }, [progress?.collectedPieces]);
  const gainStyle = {
    opacity: gainAnim.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
    transform: [
      { translateY: gainAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }) },
      { scale: gainAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 1.2, 1] }) },
    ],
  };

  // 6) 퀴즈 정답/오답 피드백 — 정답이면 고른 선택지가 살짝 통통, 오답이면 좌우로 짧게 흔들림.
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!quiz?.answered || !quiz.result) return;
    feedbackAnim.setValue(0);
    if (quiz.result.correct) {
      Animated.spring(feedbackAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 14 }).start();
    } else {
      Animated.sequence([
        Animated.timing(feedbackAnim, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(feedbackAnim, { toValue: -1, duration: 55, useNativeDriver: true }),
        Animated.timing(feedbackAnim, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(feedbackAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
    }
  }, [quiz?.answered]);
  const getOptionFeedbackStyle = (isSelected: boolean) => {
    if (!isSelected || !quiz?.result) return undefined;
    if (quiz.result.correct) {
      return { transform: [{ scale: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] };
    }
    return { transform: [{ translateX: feedbackAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] }) }] };
  };

  // 7) 퍼즐 완성 축하 — 기본 Alert 팝업 대신, 별이 퍼지는 화면 안 축하 오버레이로 대체.
  const [celebrateTitle, setCelebrateTitle] = useState<string | null>(null);
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const openCelebration = (title: string) => {
    setCelebrateTitle(title);
    celebrateAnim.setValue(0);
    Animated.spring(celebrateAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }).start();
  };
  const closeCelebration = () => setCelebrateTitle(null);
  const STAR_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315].map((d) => (d * Math.PI) / 180);

  // 8) 잠긴 퍼즐 세트가 풀리는 순간 — LOCKED → 그 외 상태로 바뀐 세트만 반짝이며 팝업된다.
  // (세트별 Animated.Value를 ref 맵에 보관해서, 그 세트가 실제로 "이번 세션에서 방금" 풀렸을
  //  때만 만들어지게 한다 — 처음부터 풀려 있던 세트는 애니메이션 없이 조용히 나타난다.)
  const prevSetStatusRef = useRef<Record<number, string>>({});
  const unlockAnimsRef = useRef<Record<number, Animated.Value>>({});
  useEffect(() => {
    const prevMap = prevSetStatusRef.current;
    sets.forEach((s) => {
      if (prevMap[s.puzzleSetId] === 'LOCKED' && s.status !== 'LOCKED') {
        const anim = unlockAnimsRef.current[s.puzzleSetId] ?? (unlockAnimsRef.current[s.puzzleSetId] = new Animated.Value(0));
        anim.setValue(0);
        Animated.timing(anim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      }
    });
    const nextMap: Record<number, string> = {};
    sets.forEach((s) => {
      nextMap[s.puzzleSetId] = s.status;
    });
    prevSetStatusRef.current = nextMap;
  }, [sets]);

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
        openCelebration(res.progress.title);
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
        <Animated.View style={puzzleRise}>
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
              <View style={styles.puzzleCountWrap}>
                {showGain ? (
                  <Animated.Text style={[styles.gainText, gainStyle]}>+1 조각</Animated.Text>
                ) : null}
                <Text style={styles.puzzleCount}>
                  {progress.collectedPieces} / {progress.totalPieces} 조각 모음
                </Text>
              </View>
            </View>
            <ProgressBar progress={progress.collectedPieces / progress.totalPieces} />

            {sets.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.setStrip} contentContainerStyle={{ gap: spacing.sm }}>
                {sets.map((s) => {
                  const cover = PUZZLE_COVERS[s.assetKey];
                  const locked = s.status === 'LOCKED';
                  const unlockAnim = unlockAnimsRef.current[s.puzzleSetId];
                  const unlockScale = unlockAnim
                    ? unlockAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 1.15, 1] })
                    : undefined;
                  return (
                    <View key={s.puzzleSetId} style={styles.setThumbWrap}>
                      <Animated.View
                        style={[styles.setThumb, unlockScale ? { transform: [{ scale: unlockScale }] } : null]}
                      >
                        {cover ? (
                          <Image source={cover} style={[styles.setThumbImage, locked && styles.setThumbLocked]} />
                        ) : null}
                        {locked ? (
                          <View style={styles.lockOverlay}>
                            <Ionicons name="lock-closed" size={14} color={colors.white} />
                          </View>
                        ) : unlockAnim ? (
                          <Animated.View
                            pointerEvents="none"
                            style={[styles.lockOverlay, { opacity: unlockAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
                          >
                            <Ionicons name="lock-closed" size={14} color={colors.white} />
                          </Animated.View>
                        ) : s.status === 'COMPLETED' ? (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={12} color={colors.white} />
                          </View>
                        ) : null}
                        {unlockAnim ? (
                          <Animated.View
                            pointerEvents="none"
                            style={[
                              styles.unlockFlash,
                              { opacity: unlockAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.6, 0] }) },
                            ]}
                          />
                        ) : null}
                      </Animated.View>
                      <Text style={styles.setThumbLabel} numberOfLines={1}>
                        {locked ? '???' : s.title}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}
          </Card>
        </Animated.View>

        <Animated.View style={quizRise}>
          <Card style={styles.quizCard}>
            <View style={styles.quizHeaderRow}>
              <View style={styles.bulbWrap}>
                {!quiz.answered ? <Animated.View style={[styles.bulbGlow, bulbGlowStyle]} /> : null}
                <Ionicons name="bulb-outline" size={18} color={colors.warning} />
              </View>
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
                    <Animated.View key={opt.id} style={getOptionFeedbackStyle(isSelected)}>
                      <PressableScale
                        style={[
                          styles.optionRow,
                          showCorrect ? styles.optionCorrect : null,
                          showIncorrect ? styles.optionIncorrect : null,
                        ]}
                        onPress={() => handleAnswer(opt.id)}
                        disabled={submitting || quiz.answered}
                      >
                        <Text style={styles.optionText}>{opt.label}</Text>
                      </PressableScale>
                    </Animated.View>
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
        </Animated.View>

        <Animated.View style={[listRise, { gap: spacing.md }]}>
          <Text style={styles.sectionTitle}>금융 상식 쑥쑥</Text>
          {categories.map((cat) => {
            const style = getCategoryIconStyle(cat.id);
            return (
              <PressableScale
                key={cat.id}
                style={styles.topicCard}
                onPress={() => navigation.navigate('TopicCategory', { categoryId: cat.id, title: cat.title })}
              >
                <View style={[styles.topicIcon, { backgroundColor: style.bg }]}>
                  <MaterialCommunityIcons name={cat.icon as any} size={22} color={style.iconColor} />
                </View>
                <Text style={styles.topicTitle}>{cat.title}</Text>
                <Text style={styles.topicSubtitle}>{cat.subtitle}</Text>
              </PressableScale>
            );
          })}
        </Animated.View>
      </ScrollView>

      {celebrateTitle ? (
        <Animated.View style={[styles.celebrateBackdrop, { opacity: celebrateAnim }]}>
          <View style={styles.celebrateStars}>
            {STAR_ANGLES.map((angle, i) => {
              const dist = 76;
              const tx = celebrateAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] });
              const ty = celebrateAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist] });
              const op = celebrateAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] });
              return (
                <Animated.View
                  key={i}
                  style={[styles.celebrateStar, { opacity: op, transform: [{ translateX: tx }, { translateY: ty }] }]}
                >
                  <Ionicons name="sparkles" size={16} color={colors.accent} />
                </Animated.View>
              );
            })}
          </View>
          <Animated.View
            style={[
              styles.celebrateCard,
              { opacity: celebrateAnim, transform: [{ scale: celebrateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] },
            ]}
          >
            <View style={styles.celebrateTrophyWrap}>
              <Ionicons name="trophy" size={36} color={colors.warning} />
            </View>
            <Text style={styles.celebrateTitle}>퍼즐 완성!</Text>
            <Text style={styles.celebrateSubtitle}>
              {`'${celebrateTitle}' 퍼즐을 모두 모았어요.\n다음 퍼즐이 열렸어요!`}
            </Text>
            <Button label="확인" onPress={closeCelebration} style={{ marginTop: spacing.xs }} />
          </Animated.View>
        </Animated.View>
      ) : null}
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
  puzzleCountWrap: { alignItems: 'flex-end' },
  puzzleCount: { fontSize: 13, fontWeight: '700', color: colors.primary },
  gainText: {
    position: 'absolute',
    bottom: 14,
    right: 0,
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
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
  bulbWrap: { alignItems: 'center', justifyContent: 'center', width: 22, height: 22 },
  bulbGlow: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.warning,
  },
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
  topicCard: { gap: 8, alignItems: 'flex-start', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  topicIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  topicSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: -6 },

  // 잠긴 세트가 풀리는 순간 썸네일 위를 스치는 골드 플래시
  unlockFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent,
  },

  // 퍼즐 완성 축하 오버레이
  celebrateBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 31, 40, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  // 화면 정중앙 한 점에 고정해두고, 별들은 그 점을 기준으로 사방으로 퍼진다
  // (부모(celebrateBackdrop)가 flex 중앙 정렬이라 그냥 두면 왼쪽 위 모서리에 붙어버려서
  //  top/left 50%로 직접 중앙에 앵커를 박아야 한다).
  celebrateStars: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
  },
  celebrateStar: {
    position: 'absolute',
  },
  celebrateCard: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  celebrateTrophyWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  celebrateTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  celebrateSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 },
});
