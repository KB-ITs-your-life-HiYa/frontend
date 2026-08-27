import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { colors, spacing } from '../../constants/colors';

// 온보딩 첫 화면. 앱 최초 실행 시 노출 (네비게이션에는 아직 미연결 — 필요 시 RootNavigator에서 조건부 렌더링)
export default function WelcomeScreen({ onStart }: { onStart?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.progressRow}>
        <View style={[styles.progressSegment, styles.progressActive]} />
        <View style={styles.progressSegment} />
        <View style={styles.progressSegment} />
      </View>

      <Text style={styles.title}>자립준비청년의 홀로서기,{'\n'}끝까지 함께할게요</Text>
      <Text style={styles.sub}>보호종료 이전부터 자립수당 종료 이후까지,{'\n'}끊기지 않는 재무 플랜</Text>

      <View style={styles.illustrationWrap}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <View style={styles.iconBubble}>
              <Ionicons name="rocket" size={32} color={colors.primary} />
            </View>
          </View>
        </View>
      </View>

      <Button label="시작하기" onPress={onStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.lg, justifyContent: 'flex-start' },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.xl },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.track },
  progressActive: { backgroundColor: colors.primary },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, lineHeight: 32 },
  sub: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.md, lineHeight: 20 },
  illustrationWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ringOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(49,130,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble: {
    width: 88,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
