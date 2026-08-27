import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/colors';

export interface StackedBarSegment {
  label: string;
  amount: number;
  color: string;
}

interface Props {
  segments: StackedBarSegment[];
  height?: number;
  unit?: string; // '원' | '%'
  showLegend?: boolean;
}

// 첫 목돈 배분, 월 생활비 배분처럼 "항목별 비율"을 한 줄 막대로 보여줄 때 쓰는 컴포넌트
export default function StackedBar({ segments, height = 12, unit = '원', showLegend = true }: Props) {
  const total = segments.reduce((sum, s) => sum + s.amount, 0) || 1;

  return (
    <View>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        {segments.map((s, i) => (
          <View
            key={s.label}
            style={{
              width: `${(s.amount / total) * 100}%`,
              backgroundColor: s.color,
              height: '100%',
              marginLeft: i === 0 ? 0 : 1,
            }}
          />
        ))}
      </View>
      {showLegend ? (
        <View style={styles.legend}>
          {segments.map((s) => (
            <View key={s.label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <Text style={styles.legendLabel}>{s.label}</Text>
              <Text style={styles.legendValue}>
                {unit === '원' ? `${s.amount.toLocaleString()}원` : `${s.amount}%`}
                {'  '}
                <Text style={styles.legendPct}>({Math.round((s.amount / total) * 100)}%)</Text>
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  legend: { marginTop: spacing.sm, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  legendLabel: { flex: 1, fontSize: 13, color: colors.textSecondary },
  legendValue: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  legendPct: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
});
