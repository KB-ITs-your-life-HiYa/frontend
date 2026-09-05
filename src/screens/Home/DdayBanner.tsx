import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../constants/colors';
import { formatDday } from '../../utils/today';

const BROWN = '#946200'; // SettlementFundModal에서 쓰는 것과 같은 톤 — 옅은 노란 배경 위 텍스트용

interface Props {
  days: number;
}

// 홈 화면의 "자립수당 종료까지 D-180" 표시.
// 원래는 화면 폭을 꽉 채우는 카드형 배너였는데, 위에 브랜드 히어로 카드가 새로 생기면서
// 두 개가 겹쳐 화면 상단이 너무 무거워 보였다. 그래서 내용물 크기만큼만 차지하는 작은
// 알약(pill) 한 줄로 줄였다 — 정보는 그대로 살아있지만 존재감은 훨씬 가벼워졌다.
// 아이콘 뒤 은은한 펄스는 그대로 남겨서 "지금도 하루하루 줄어들고 있다"는 느낌을 유지했다.
export default function DdayBanner({ days }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const glowStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.05] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
  };

  return (
    <View style={styles.pill}>
      <View style={styles.iconWrap}>
        <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
        <Ionicons name="flag" size={11} color={BROWN} />
      </View>
      <Text style={styles.text}>
        자립수당 종료까지 <Text style={styles.dday}>{formatDday(days)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.accentLight,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
  },
  text: { fontSize: 12, fontWeight: '600', color: BROWN },
  dday: { fontSize: 13, fontWeight: '800', color: BROWN },
});
