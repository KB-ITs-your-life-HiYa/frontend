import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';

// 온보딩 3단계. 최상단 진행 바가 처음부터 3칸으로 되어 있던 걸 실제로 채워 넣었다.
// 마스코트 그림은 하나뿐이라 세 화면 모두 같은 그림을 쓰되, 화면마다 배경 글로우 색과
// 우측 하단 기능 배지 아이콘을 바꿔서 "이 화면은 이 얘기를 하고 있다"는 느낌을 준다.
//   1) 서비스 전체 소개 (기존 화면 그대로)
//   2) AI 케어 — 입금이 늦으면 AI가 먼저 챙겨준다는, 다른 앱엔 없는 차별점
//   3) 지원금·정착금 안내 — 내 지역 기준 정착금 배분안 + 지원금 정보
type Slide = {
  title: string;
  sub: string;
  glow: string;
  badge?: { icon: keyof typeof Ionicons.glyphMap; bg: string };
};

const SLIDES: Slide[] = [
  {
    title: '자립준비청년의 홀로서기,\n끝까지 함께할게요',
    sub: '보호종료 이전부터 자립수당 종료 이후까지,\n끊기지 않는 재무 플랜',
    glow: colors.primaryLight,
  },
  {
    title: '돈이 안 들어와도\n혼자 걱정하지 않도록',
    sub: '적금·지원금이 예정일에 들어오지 않으면\nAI가 먼저 알아차리고 챙겨드려요',
    glow: colors.blueSoft,
    badge: { icon: 'chatbox-ellipses', bg: colors.chatAvatar },
  },
  {
    title: '받을 수 있는 지원금과\n정착금까지 한 번에',
    sub: '내 지역 기준 자립정착금 배분안부터\n놓치기 쉬운 지원금 정보까지 알려드려요',
    glow: colors.accentLight,
    badge: { icon: 'wallet', bg: colors.accent },
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  // 슬라이드가 바뀔 때마다 다시 재생되는 진입 애니메이션 —
  // 진행 바의 "현재 칸"이 채워지는 것과, 제목/설명/마스코트가 살짝 떠오르며 나타나는 것.
  const progressAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const mascotEnter = useRef(new Animated.Value(0)).current;
  // 360도 회전은 1번째 → 2번째(AI 케어 소개) 화면으로 넘어갈 때만 재생되는 별도 값.
  // mascotEnter(스케일/투명도)와 분리해뒀기 때문에 다른 슬라이드 전환에서는 항상 0deg로 고정된다.
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);
    contentAnim.setValue(0);
    mascotEnter.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width 보간이라 native driver 불가
    }).start();
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(mascotEnter, {
      toValue: 1,
      duration: 600,
      delay: 160,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();

    // step 1(두 번째 화면, AI 케어 소개)로 들어올 때만 한 바퀴 빙그르르.
    // 뒤로 가기가 없는 온보딩이라 step이 1이 되는 경우는 항상 "1번째 → 2번째" 전환뿐이다.
    spinAnim.setValue(0);
    if (step === 1) {
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 600,
        delay: 160,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }).start();
    }
  }, [step]);

  // 마스코트가 둥실둥실 떠 있는 느낌 — 슬라이드가 바뀌어도 끊기지 않고 계속 반복
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 마스코트 뒤 은은한 글로우 — 슬라이드별 glow 색은 그대로 두고 커졌다 작아지는 것만 반복
  const glowPulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 첫 화면 손 흔드는 연출용 반짝이 — 계속 반복
  const sparkleA = useRef(new Animated.Value(0)).current;
  const sparkleB = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const makeLoop = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 500, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.delay(900),
        ])
      );
    const loopA = makeLoop(sparkleA, 300);
    const loopB = makeLoop(sparkleB, 1100);
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, []);

  const handleNext = () => {
    if (isLast) {
      navigation.replace('Login' as never);
    } else {
      setStep((s) => s + 1);
    }
  };

  const titleStyle = {
    opacity: contentAnim,
    transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };
  const subStyle = {
    opacity: contentAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0, 1] }),
    transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };
  const mascotStyle = {
    opacity: mascotEnter,
    transform: [
      { scale: mascotEnter.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
      { rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
      { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
    ],
  };
  const glowStyle = {
    backgroundColor: slide.glow,
    opacity: glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.25] }),
    transform: [{ scale: glowPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
  };
  const sparkleAStyle = {
    opacity: sparkleA,
    transform: [{ scale: sparkleA.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  };
  const sparkleBStyle = {
    opacity: sparkleB,
    transform: [{ scale: sparkleB.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  };
  const badgeStyle = {
    opacity: mascotEnter,
    transform: [{ scale: mascotEnter.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.topRow}>
        <View style={styles.progressRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={styles.progressSegment}>
              {i < step ? (
                <View style={[styles.progressFill, { width: '100%' }]} />
              ) : i === step ? (
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>
        {!isLast ? (
          <Text style={styles.skip} onPress={() => navigation.replace('Login' as never)}>
            건너뛰기
          </Text>
        ) : null}
      </View>

      <Animated.View style={titleStyle}>
        <Text style={styles.title}>{slide.title}</Text>
      </Animated.View>
      <Animated.View style={subStyle}>
        <Text style={styles.sub}>{slide.sub}</Text>
      </Animated.View>

      <View style={styles.illustrationWrap}>
        <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
        <Animated.View style={mascotStyle}>
          <Image source={require('../../../assets/mascots.png')} style={styles.mascot} resizeMode="contain" />
          {step === 0 ? (
            <>
              <Animated.View pointerEvents="none" style={[styles.sparkle, styles.sparkleTop, sparkleAStyle]}>
                <Ionicons name="sparkles" size={16} color={colors.accent} />
              </Animated.View>
              <Animated.View pointerEvents="none" style={[styles.sparkle, styles.sparkleSide, sparkleBStyle]}>
                <Ionicons name="sparkles" size={11} color={colors.primary} />
              </Animated.View>
            </>
          ) : null}
          {slide.badge ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.badge, { backgroundColor: slide.badge.bg }, badgeStyle]}
            >
              <Ionicons name={slide.badge.icon} size={20} color={colors.white} />
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>

      <Button label={isLast ? '시작하기' : '다음'} onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.lg, justifyContent: 'flex-start' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  progressRow: { flex: 1, flexDirection: 'row', gap: 6 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.track, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.primary },
  skip: { fontSize: 13, color: colors.textTertiary, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, lineHeight: 32 },
  sub: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.md, lineHeight: 20 },
  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    marginVertical: spacing.lg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  mascot: { width: 220, height: 220 },
  sparkle: { position: 'absolute' },
  sparkleTop: { top: 18, right: 26 },
  sparkleSide: { top: 56, right: 4 },
  badge: {
    position: 'absolute',
    bottom: 6,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
});
