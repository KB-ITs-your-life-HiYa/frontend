import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';

// "시작하기"를 누르면 메인 탭으로 이동
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

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
        <Image source={require('../../../assets/mascots.png')} style={styles.mascot} resizeMode="contain" />
      </View>

      <Button label="시작하기" onPress={() => navigation.replace('MainTabs' as never)} />
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
  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    marginVertical: spacing.lg,
  },
  mascot: { width: '70%', height: '70%' },
});
