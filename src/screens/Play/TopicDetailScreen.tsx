import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';
import { habitApi } from '../../services/habit';
import { HabitTopicDetail } from '../../types/habit';

// 놀이 탭 "금융 상식 쑥쑥" 주제 상세 화면 — GET /habit/topics/{topicId}
export default function TopicDetailScreen() {
  const route = useRoute<any>();
  const topicId: number | undefined = route.params?.topicId;

  const [topic, setTopic] = useState<HabitTopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!topicId) {
      setError('토픽 정보를 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    habitApi
      .getTopicDetail(topicId)
      .then(setTopic)
      .catch(() => setError('토픽 내용을 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [topicId]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title={topic?.title ?? '금융 상식'} showBack showProfile={false} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error || !topic ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.title}>{error ?? '내용을 찾을 수 없어요'}</Text>
            <Button label="다시 시도" size="sm" onPress={load} style={{ marginTop: spacing.sm }} />
          </Card>
        ) : (
          <ScrollView contentContainerStyle={{ gap: spacing.md }}>
            <Card style={styles.headerCard}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name={topic.icon as any} size={26} color={colors.primary} />
              </View>
              <Text style={styles.title}>{topic.title}</Text>
              <Text style={styles.subtitle}>{topic.subtitle}</Text>
            </Card>
            <Card>
              <Text style={styles.body}>{topic.body}</Text>
            </Card>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.md },
  emptyCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  headerCard: { alignItems: 'center', gap: 6, paddingVertical: spacing.lg },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.textTertiary, textAlign: 'center' },
  body: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },
});
