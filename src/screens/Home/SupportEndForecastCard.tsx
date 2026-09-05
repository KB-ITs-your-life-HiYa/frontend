import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import PressableScale from '../../components/PressableScale';
import { colors, spacing } from '../../constants/colors';
import { api } from '../../services/api';
import { SupportEndForecastResponse } from '../../types';

// 예적금으로 몇 개월을 버틸 수 있는지, 숫자만 읽는 대신 "연료 게이지"처럼 칸을 채워서
// 한눈에 감이 오게 해준다. 12개월을 꽉 찬 걸로 보고, 그보다 길면 "+"만 살짝 붙인다.
const RUNWAY_MAX = 12;

function RunwayGauge({ months }: { months: number }) {
  const filled = Math.max(0, Math.min(RUNWAY_MAX, Math.round(months)));
  const overflow = months > RUNWAY_MAX;
  const anims = useRef(Array.from({ length: RUNWAY_MAX }, () => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((a) => a.setValue(0));
    Animated.parallel(
      anims.slice(0, filled).map((a, i) =>
        Animated.timing(a, {
          toValue: 1,
          duration: 240,
          delay: i * 45,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [filled]);

  return (
    <View style={styles.gaugeRow}>
      {anims.map((a, i) => (
        <View key={i} style={styles.gaugeTrack}>
          {i < filled ? (
            <Animated.View
              style={[
                styles.gaugeFill,
                { opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
              ]}
            />
          ) : null}
        </View>
      ))}
      {overflow ? <Text style={styles.gaugeOverflow}>+</Text> : null}
    </View>
  );
}

export default function SupportEndForecastCard() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<SupportEndForecastResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<SupportEndForecastResponse>('/members/me/support-end-forecast')
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        // 조용히 무시. 노출 여부가 불확실하면 카드를 그리지 않는다
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data?.eligible || !data.forecast || !data.forecast.dataAvailable) return null;

  const { monthlyShortfall, savingsRunwayMonths } = data.forecast;
  const shortfall = monthlyShortfall ?? 0;

  return (
    <PressableScale onPress={() => navigation.navigate('SupportEndForecastDetail')}>
      <Card>
        <Text style={styles.label}>수당이 끝나면 평균지출액 대비</Text>

        <View style={styles.shortfallRow}>
          {shortfall > 0 ? (
            <Text style={styles.sentence}>
              <Text style={styles.sentenceSmall}>매달 </Text>
              <MoneyText amount={shortfall} variant="large" color={colors.danger} />
              <Text style={styles.sentenceSmall}> 부족해요</Text>
            </Text>
          ) : (
            <Text style={styles.sentenceSmall}>매달 부족액 없이 잘 관리하고 있어요</Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>

        <View style={styles.divider} />

        {savingsRunwayMonths != null ? <RunwayGauge months={savingsRunwayMonths} /> : null}

        <Text style={styles.bottomText}>
          {savingsRunwayMonths != null ? (
            <>
              지금 예적금으로는 약 <Text style={styles.bottomEmphasis}>{savingsRunwayMonths}개월</Text> 버틸 수 있어요
            </>
          ) : (
            '지금처럼이면 예적금을 쓰지 않아도 될 것 같아요'
          )}
        </Text>
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.textSecondary },
  shortfallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sentence: { flexShrink: 1 },
  sentenceSmall: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  gaugeTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  gaugeFill: { flex: 1, borderRadius: 4, backgroundColor: colors.primary },
  gaugeOverflow: { fontSize: 13, fontWeight: '700', color: colors.primary, marginLeft: 2 },
  bottomText: { fontSize: 13, color: colors.textSecondary },
  bottomEmphasis: { fontWeight: '700', color: colors.primary },
});
