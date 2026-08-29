import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import { colors, spacing } from '../../constants/colors';

// 놀이 탭 "금융 상식 쑥쑥" 주제 상세 화면
// TODO: 주제별 실제 학습 콘텐츠 연동 예정
export default function TopicDetailScreen() {
  const route = useRoute<any>();
  const title: string = route.params?.title ?? '금융 상식';

  return (
    <View style={styles.screen}>
      <ScreenHeader title={title} showBack showProfile={false} />
      <View style={styles.content}>
        <Card style={styles.emptyCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="construct-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>추후 업데이트 예정입니다</Text>
          <Text style={styles.desc}>{`'${title}' 학습 콘텐츠를 준비하고 있어요. 조금만 기다려주세요!`}</Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  emptyCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  desc: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', lineHeight: 19, paddingHorizontal: spacing.md },
});
