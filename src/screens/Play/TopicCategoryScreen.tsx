import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';
import { habitApi } from '../../services/habit';
import { HabitTopicSummary } from '../../types/habit';

// 놀이 탭 "금융 상식 쑥쑥" 카테고리 상세 — 카테고리 누르면
// 그 안의 세부 토픽 목록을 보여줌 GET /habit/topics/{categoryId}/subtopics
const TOPIC_STYLES: { bg: string; iconColor: string }[] = [
  { bg: colors.blueSoft, iconColor: colors.primary },
  { bg: colors.yellowSoft, iconColor: colors.warning },
  { bg: colors.accentLight, iconColor: '#B78103' },
  { bg: colors.greenSoft, iconColor: colors.success },
];

export default function TopicCategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryId: number | undefined = route.params?.categoryId;
  const title: string = route.params?.title ?? '금융 상식';

  const [topics, setTopics] = useState<HabitTopicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!categoryId) {
      setError('카테고리 정보를 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    habitApi
      .listTopicsByCategory(categoryId)
      .then(setTopics)
      .catch(() => setError('토픽 목록을 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, [categoryId]);

  useEffect(load, [load]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title={title} showBack showProfile={false} />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerFill}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>{error}</Text>
            <Button label="다시 시도" size="sm" onPress={load} style={{ marginTop: spacing.sm }} />
          </Card>
        ) : (
          <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
            {topics.map((t, i) => {
              const style = TOPIC_STYLES[i % TOPIC_STYLES.length];
              return (
                <Pressable key={t.id} onPress={() => navigation.navigate('TopicDetail', { topicId: t.id })}>
                  <Card style={styles.topicCard}>
                    <View style={[styles.topicIcon, { backgroundColor: style.bg }]}>
                      <MaterialCommunityIcons name={t.icon as any} size={22} color={style.iconColor} />
                    </View>
                    <Text style={styles.topicTitle}>{t.title}</Text>
                    <Text style={styles.topicSubtitle}>{t.subtitle}</Text>
                  </Card>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.md },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  topicCard: { gap: 8, alignItems: 'flex-start' },
  topicIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  topicSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: -6 },
});
