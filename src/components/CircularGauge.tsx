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
}

// 온라인 케어 화면의 "안심 지수" 원형 게이지
export default function CircularGauge({ value, max = 100, size = 180, strokeWidth = 14, color = colors.primary }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));
  const dashOffset = circumference * (1 - pct);

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
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.max}>/{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  value: { fontSize: 36, fontWeight: '800', color: colors.textPrimary },
  max: { fontSize: 15, color: colors.textTertiary, marginLeft: 2, marginTop: 14 },
});
