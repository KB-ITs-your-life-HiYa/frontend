import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import { colors, spacing } from '../../constants/colors';

// 홈 "할 일 목록 — 모두 보기" 진입 화면
// TODO: 전체 할 일 목록 API 연동 및 필터/정렬 기능 추가 예정
export default function TodoListScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="할 일 목록" showBack showProfile={false} />
      <View style={styles.content}>
        <Card style={styles.emptyCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="construct-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>추후 업데이트 예정입니다</Text>
          <Text style={styles.desc}>할 일 전체 목록을 한눈에 모아보는 화면을 준비하고 있어요. 조금만 기다려주세요!</Text>
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
