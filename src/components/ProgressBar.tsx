import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../constants/colors';

interface Props {
  progress: number; // 0~1
  color?: string;
  height?: number;
}

export default function ProgressBar({ progress, color = colors.primary, height = 8 }: Props) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct * 100}%`, backgroundColor: color, borderRadius: height / 2 },
        ]}
      />
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
