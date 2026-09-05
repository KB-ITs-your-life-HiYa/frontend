import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../navigation/RootNavigator';
import Card from '../../components/Card';
import PressableScale from '../../components/PressableScale';
import { colors, spacing } from '../../constants/colors';
import { habitApi } from '../../services/habit';
import { HabitTodayQuiz } from '../../types/habit';

// 홈 화면 맨 아래 "오늘의 퀴즈" 티저. 퍼즐 진행률 대신 오늘 퀴즈를 풀었는지/안 풀었는지에만
// 집중해서, 눌렀을 때 할 일이 명확한 CTA로 만들었다. 실제 정답 선택은 여기서 하지 않고
// 항상 놀이 탭으로 이동시켜서 상호작용은 그쪽에서만 일어나게 한다.
export default function TodayPlayPreviewCard() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [quiz, setQuiz] = useState<HabitTodayQuiz | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    habitApi
      .getTodayQuiz()
      .then((q) => {
        if (!cancelled) setQuiz(q);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error || !quiz) return null;

  const solved = quiz.answered;

  return (
    <PressableScale onPress={() => navigation.navigate('Play')}>
      <Card style={styles.card}>
        <View style={[styles.iconCircle, { backgroundColor: solved ? colors.successLight : colors.warningLight }]}>
          <Ionicons
            name={solved ? 'checkmark-circle' : 'bulb'}
            size={22}
            color={solved ? colors.success : colors.warning}
          />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.label}>오늘의 퀴즈</Text>
          {solved ? (
            <>
              <Text style={styles.headline}>오늘의 퀴즈를 다 풀었어요</Text>
              <Text style={styles.caption}>내일 새로운 퀴즈가 준비돼요</Text>
            </>
          ) : (
            <Text style={styles.headline} numberOfLines={2}>
              {quiz.question}
            </Text>
          )}
        </View>
        {!solved ? (
          <View style={styles.cta}>
            <Text style={styles.ctaText}>풀러 가기</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        )}
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textCol: { flex: 1, gap: 2 },
  label: { fontSize: 12, color: colors.textSecondary },
  headline: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  caption: { fontSize: 11, color: colors.textTertiary },
  cta: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  ctaText: { fontSize: 12, fontWeight: '700', color: colors.white },
});
