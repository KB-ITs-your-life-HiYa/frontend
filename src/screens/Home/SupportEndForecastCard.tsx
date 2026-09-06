import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import PressableScale from '../../components/PressableScale';
import { colors, radius, spacing } from '../../constants/colors';
import { api } from '../../services/api';
import { SupportEndForecastResponse } from '../../types';
import { TODAY } from '../../utils/today';

// 예적금으로 몇 개월을 버틸 수 있는지 보여주는 부분. 네모 게이지 → 막대 → 원형 게이지까지
// 다 "그래프" 느낌이 강하다는 피드백을 받아서, 이번엔 아예 그래프를 버리고 "돈이 흐르다가
// 어느 순간 끊긴다"는 걸 작은 장면처럼 보여주기로 했다.
//   1) 동전이 선을 따라 계속 흘러가다가, 끝에서 살짝 아래로 떨어지며 사라진다(반복)
//   2) 그 지점(절벽)에 배터리 아이콘을 두어 "여기서 바닥난다"는 걸 표시하고
//   3) 그 뒤로는 점선만 흐릿하게 이어져서 "이후엔 아무것도 없다"는 느낌을 준다
//   4) 아래에 "언제(몇 개월 후, 몇 년 몇 월경)" 끊기는지 구체적으로 적어준다
const RUNWAY_MAX = 12;

type RunwayTier = 'safe' | 'caution' | 'risk';

function getTier(months: number): RunwayTier {
  if (months >= 12) return 'safe';
  if (months >= 6) return 'caution';
  return 'risk';
}

const TIER_META: Record<RunwayTier, { color: string; bg: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  safe: { color: colors.primary, bg: colors.primaryLight, label: '여유 있어요', icon: 'battery-full' },
  caution: { color: colors.warning, bg: colors.warningLight, label: '관리가 필요해요', icon: 'battery-half' },
  risk: { color: colors.danger, bg: colors.dangerLight, label: '곧 소진돼요', icon: 'battery-dead' },
};

const DASH_TICKS = 6;

function RunwayMeter({ months }: { months: number }) {
  const rounded = Math.max(0, Math.round(months));
  const overflow = months > RUNWAY_MAX;
  const tier = getTier(rounded);
  const meta = TIER_META[tier];

  const depletion = new Date(TODAY);
  depletion.setMonth(depletion.getMonth() + rounded);
  const depletionLabel = `${depletion.getFullYear()}년 ${depletion.getMonth() + 1}월`;

  // 동전이 흘러가는 구간의 실제 픽셀 너비를 재서, 그 안에서만 왕복하게 한다
  const [trackWidth, setTrackWidth] = useState(0);
  const travel = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trackWidth) return;
    // 처음엔 1.5초 만에 왕복해서 너무 빠르고 시선을 뺏는다는 피드백을 받았다.
    // 훨씬 느리게(4.2초) 흐르게 하고, 한 바퀴 돌고 나면 잠깐 쉬었다가 다시 시작하게 해서
    // 눈에 계속 걸리는 대신 가끔 눈에 띄는 정도의 은은한 디테일이 되도록 했다.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(travel, { toValue: 1, duration: 4200, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(travel, { toValue: 0, duration: 0, useNativeDriver: true }), // 즉시 처음 위치로
        Animated.delay(900),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [trackWidth]);

  const coinTranslateX = travel.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(trackWidth - 8, 0)],
  });
  const coinTranslateY = travel.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [0, 0, 10],
  });
  const coinOpacity = travel.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [0.75, 0.75, 0],
  });

  return (
    <View>
      <View style={[styles.tierBadge, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={13} color={meta.color} />
        <Text style={[styles.tierLabel, { color: meta.color }]}>{meta.label}</Text>
      </View>

      <View style={styles.flowRow}>
        <View style={[styles.nodeDot, { backgroundColor: meta.color }]} />

        <View
          style={styles.flowSolidTrack}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        >
          <View style={[styles.flowLine, { backgroundColor: meta.color }]} />
          <Animated.View
            style={[
              styles.coin,
              {
                backgroundColor: meta.color,
                opacity: coinOpacity,
                transform: [{ translateX: coinTranslateX }, { translateY: coinTranslateY }],
              },
            ]}
          />
        </View>

        <View style={[styles.cliffMarker, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={13} color={meta.color} />
        </View>

        <View style={styles.flowDashedTrack}>
          {Array.from({ length: DASH_TICKS }).map((_, i) => (
            <View key={i} style={[styles.flowTick, { opacity: 1 - i / DASH_TICKS }]} />
          ))}
        </View>
      </View>

      <View style={styles.flowLabelsRow}>
        <Text style={styles.flowLabelStart}>지금</Text>
        <Text style={[styles.flowLabelEnd, { color: meta.color }]}>
          약 {rounded}개월{overflow ? '+' : ''} 후 끊겨요
        </Text>
      </View>
      <Text style={styles.meterDate}>{depletionLabel}경 소진 예상 · 미리 대비해두세요</Text>
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

        {savingsRunwayMonths != null ? (
          <RunwayMeter months={savingsRunwayMonths} />
        ) : (
          <Text style={styles.meterMonths}>지금처럼이면 예적금을 쓰지 않아도 될 것 같아요</Text>
        )}
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
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  tierLabel: { fontSize: 12, fontWeight: '700' },
  flowRow: { flexDirection: 'row', alignItems: 'center' },
  nodeDot: { width: 8, height: 8, borderRadius: 4 },
  flowSolidTrack: { flex: 2, height: 16, justifyContent: 'center', marginHorizontal: 4 },
  flowLine: { height: 3, borderRadius: 1.5 },
  coin: { position: 'absolute', top: 4, width: 8, height: 8, borderRadius: 4 },
  cliffMarker: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flowDashedTrack: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 6 },
  flowTick: { width: 4, height: 3, borderRadius: 1.5, backgroundColor: colors.textTertiary },
  flowLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  flowLabelStart: { fontSize: 11, color: colors.textTertiary },
  flowLabelEnd: { fontSize: 12, fontWeight: '800' },
  meterMonths: { fontSize: 13, color: colors.textSecondary },
  meterDate: { fontSize: 12, color: colors.textTertiary, marginTop: 6 },
});
