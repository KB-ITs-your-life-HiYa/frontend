import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../constants/colors';
import { formatDday } from '../../utils/today';

// 홈 화면 맨 위, 온보딩과 같은 톤으로 "이 서비스가 어떤 곳인지"를 색과 마스코트로 보여주는
// 브랜드 배너. 정보 카드들(D-day/자산/지출 등)은 전부 흰 배경이라 화면이 자칫 밋밋해 보일 수
// 있어서, 여기 하나는 브랜드 컬러(colors.primary)를 꽉 채운 카드로 만들어 첫인상에 색이 있게 했다.
// 마스코트 쪽에는 1) 둥실+살짝 좌우로 흔들리는 움직임, 2) 은은하게 맥동하는 배경 글로우,
// 3) 밖으로 퍼졌다 사라지는 링 이펙트(물결처럼), 4) 뜰 때 옅어지고 내려올 때 진해지는 그림자,
// 5) 반짝이 세 개가 서로 다른 타이밍에 깜빡이는 것까지 겹쳐서 좀 더 화사하게 만들었다.
//
// D-day 배지("자립수당 종료까지 D-N")는 평소(파랑)/D-365 모드(주황) 둘 다에서 뜨고,
// days가 있을 때만 나타난다 — 칩 자체는 두 모드가 완전히 같은 마크업을 공유하고
// 배경·글자색만 분기한다(modeChipDefault/D365, modeChipTextDefault/D365).
//
// isD365Mode가 true면(자립수당 종료까지 D-365 이하로 들어와서 SupportEndForecastCard가
// 뜨는 것과 같은 조건) 문구가 "D-365 모드에 들어갔어요"로 바뀌고, 배경색도 평소의
// 브랜드 블루 대신 주황(colors.warning)으로 바뀐다 — "더 강조해달라"는 요청을 받아서,
// 문구만 바꾸는 대신 색까지 확실히 달라지게 했다. 아래 SupportEndForecastCard도
// 같은 주황 톤을 테두리·배지에 써서 두 카드가 "지금은 D-365 모드"라는 같은 이야기를 한다.
interface Props {
  isD365Mode?: boolean;
  days?: number;
}

export default function HomeHeroCard({ isD365Mode = false, days }: Props) {
  const float = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const sparkleA = useRef(new Animated.Value(0)).current;
  const sparkleB = useRef(new Animated.Value(0)).current;
  const sparkleC = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    // 물결 링 — 0으로 순간 복귀한 뒤 다시 천천히 퍼져나가길 반복
    const rippleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ripple, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    const makeSparkleLoop = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 500, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.delay(1300),
        ])
      );
    const sparkleALoop = makeSparkleLoop(sparkleA, 400);
    const sparkleBLoop = makeSparkleLoop(sparkleB, 1400);
    const sparkleCLoop = makeSparkleLoop(sparkleC, 900);

    floatLoop.start();
    glowLoop.start();
    rippleLoop.start();
    sparkleALoop.start();
    sparkleBLoop.start();
    sparkleCLoop.start();
    return () => {
      floatLoop.stop();
      glowLoop.stop();
      rippleLoop.stop();
      sparkleALoop.stop();
      sparkleBLoop.stop();
      sparkleCLoop.stop();
    };
  }, []);

  const mascotStyle = {
    transform: [
      { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -9] }) },
      { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) },
    ],
  };
  const shadowStyle = {
    opacity: float.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0.14] }),
    transform: [{ scaleX: float.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] }) }],
  };
  const glowStyle = {
    opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0.14] }),
    transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
  };
  const rippleStyle = {
    opacity: ripple.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.4, 0] }),
    transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.55] }) }],
  };
  const sparkleAStyle = {
    opacity: sparkleA,
    transform: [{ scale: sparkleA.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  };
  const sparkleBStyle = {
    opacity: sparkleB,
    transform: [{ scale: sparkleB.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  };
  const sparkleCStyle = {
    opacity: sparkleC,
    transform: [{ scale: sparkleC.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  };

  return (
    <View style={[styles.card, isD365Mode && styles.cardD365]}>
      <View style={styles.textCol}>
        {days != null ? (
          <View style={[styles.modeChip, isD365Mode ? styles.modeChipD365 : styles.modeChipDefault]}>
            <Text style={[styles.modeChipText, isD365Mode ? styles.modeChipTextD365 : styles.modeChipTextDefault]}>
              자립수당 종료까지 {formatDday(days)}
            </Text>
          </View>
        ) : null}
        {isD365Mode ? (
          <>
            <Text style={[styles.headline, styles.headlineD365]}>자립동행과 함께{'\n'}D-365 모드에 들어갔어요</Text>
            <Text style={[styles.sub, styles.subD365]}>지금부터는 지출·예적금을 더 촘촘하게{'\n'}챙겨드릴게요</Text>
          </>
        ) : (
          <>
            <Text style={styles.headline}>오늘도 자립동행이{'\n'}함께하고 있어요</Text>
            <Text style={styles.sub}>보호종료 이전부터 자립수당 종료 이후까지,{'\n'}끊기지 않는 재무 플랜</Text>
          </>
        )}
      </View>
      <View style={styles.mascotWrap}>
        <Animated.View pointerEvents="none" style={[styles.ring, rippleStyle]} />
        <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
        <Animated.View pointerEvents="none" style={[styles.shadow, shadowStyle]} />
        <Animated.View style={mascotStyle}>
          <Image source={require('../../../assets/mascots.png')} style={styles.mascot} resizeMode="contain" />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.sparkle, styles.sparkleTop, sparkleAStyle]}>
          <Ionicons name="sparkles" size={14} color={colors.accent} />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.sparkle, styles.sparkleBottom, sparkleBStyle]}>
          <Ionicons name="sparkles" size={10} color={colors.white} />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.sparkle, styles.sparkleLeft, sparkleCStyle]}>
          <Ionicons name="sparkles" size={8} color={colors.accentLight} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg - spacing.xs + 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    overflow: 'hidden',
  },
  cardD365: { backgroundColor: colors.warning },
  textCol: { flex: 1, gap: 6 },
  // 평소(파랑 배경)엔 흰 텍스트, D-365 모드(주황 배경)일 땐 짙은 네이비 톤 텍스트 —
  // 배경색이 바뀌는 데 맞춰 각각 대비가 잘 나오는 색으로 따로 지정했다.
  headline: { fontSize: 18, fontWeight: '800', color: colors.white, lineHeight: 24 },
  headlineD365: { color: 'rgba(0, 32, 83, 0.68)' },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17 },
  subD365: { color: 'rgba(0, 32, 83, 0.68)' },
  modeChip: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    marginBottom: 4,
  },
  modeChipDefault: { backgroundColor: colors.primaryDark },
  modeChipD365: { backgroundColor: colors.white },
  modeChipText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  modeChipTextDefault: { color: colors.white },
  modeChipTextD365: { color: colors.warning },
  mascotWrap: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.sm },
  ring: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  glow: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.white,
  },
  mascot: { width: 84, height: 84 },
  shadow: {
    position: 'absolute',
    bottom: 6,
    width: 46,
    height: 10,
    borderRadius: 23,
    backgroundColor: '#0B1E3D',
  },
  sparkle: { position: 'absolute' },
  sparkleTop: { top: -4, right: -2 },
  sparkleBottom: { bottom: 14, left: -8 },
  sparkleLeft: { top: 30, left: -10 },
});
