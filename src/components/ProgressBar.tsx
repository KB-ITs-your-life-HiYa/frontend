import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, radius } from '../constants/colors';

interface Props {
  progress: number; // 0~1
  color?: string;
  height?: number;
}

// progress가 바뀔 때마다(퀴즈를 맞혀서 조각이 늘어날 때 등) 순간이동하듯 툭 채워지는 대신
// 부드럽게 차오르도록 애니메이션을 준다. width는 네이티브 드라이버가 지원하지 않는 레이아웃
// 속성이라 useNativeDriver: false로 돌린다(퍼센트 하나짜리 값이라 성능 부담은 없음).
export default function ProgressBar({ progress, color = colors.primary, height = 8 }: Props) {
  const pct = Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
