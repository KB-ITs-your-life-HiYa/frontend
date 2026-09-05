import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../constants/colors';

// 홈 화면 맨 위, 온보딩과 같은 톤으로 "이 서비스가 어떤 곳인지"를 색과 마스코트로 보여주는
// 브랜드 배너. 정보 카드들(D-day/자산/지출 등)은 전부 흰 배경이라 화면이 자칫 밋밋해 보일 수
// 있어서, 여기 하나는 브랜드 컬러(colors.primary)를 꽉 채운 카드로 만들어 첫인상에 색이 있게 했다.
// 마스코트 쪽에는 1) 둥실+살짝 좌우로 흔들리는 움직임, 2) 은은하게 맥동하는 배경 글로우,
// 3) 밖으로 퍼졌다 사라지는 링 이펙트(물결처럼), 4) 뜰 때 옅어지고 내려올 때 진해지는 그림자,
// 5) 반짝이 세 개가 서로 다른 타이밍에 깜빡이는 것까지 겹쳐서 좀 더 화사하게 만들었다.
export default function HomeHeroCard() {
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
    <View style={styles.card}>
      <View style={styles.textCol}>
        <Text style={styles.headline}>오늘도 자립동행이{'\n'}함께하고 있어요</Text>
        <Text style={styles.sub}>보호종료 이전부터 자립수당 종료 이후까지,{'\n'}끊기지 않는 재무 플랜</Text>
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
    paddingVertical: spacing.lg + spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    overflow: 'hidden',
  },
  textCol: { flex: 1, gap: 6 },
  headline: { fontSize: 18, fontWeight: '800', color: colors.white, lineHeight: 24 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17 },
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
