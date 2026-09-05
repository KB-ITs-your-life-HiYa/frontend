import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../constants/colors';

interface Props {
  value: number; // 0~100
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showMax?: boolean; // 기본 true. 작은 사이즈로 쓸 때(예: 홈 화면 히어로 카드)는 "/100"을 생략하고 싶을 수 있어서
}

// 온라인 케어 화면의 "안심 지수" 원형 게이지.
// size=180(기본값) 기준으로 숫자 폰트 크기를 눈대중으로 맞췄었는데, 홈 화면 히어로 카드처럼
// 훨씬 작은 사이즈로도 쓰게 되면서 숫자가 원 밖으로 넘치는 문제가 있었다. 그래서 폰트 크기를
// size에 비례하도록 바꿨다 — size=180일 땐 정확히 예전과 같은 36px/15px이 나오도록 비율을
// 맞춰서, 기존 화면(케어 탭)은 픽셀 하나 안 바뀐다.
export default function CircularGauge({
  value,
  max = 100,
  size = 180,
  strokeWidth = 14,
  color = colors.primary,
  showMax = true,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));
  const dashOffset = circumference * (1 - pct);

  const valueFontSize = size * (36 / 180);
  const maxFontSize = size * (15 / 180);
  const maxMarginTop = size * (14 / 180);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.value, { fontSize: valueFontSize }]}>{value}</Text>
        {showMax ? <Text style={[styles.max, { fontSize: maxFontSize, marginTop: maxMarginTop }]}>/{max}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  value: { fontWeight: '800', color: colors.textPrimary },
  max: { color: colors.textTertiary, marginLeft: 2 },
});
