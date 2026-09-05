import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import { colors, spacing } from '../../constants/colors';
import { api } from '../../services/api';
import { SupportEndForecastResponse } from '../../types';

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
    <Pressable onPress={() => navigation.navigate('SupportEndForecastDetail')}>
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
    </Pressable>
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
  bottomText: { fontSize: 13, color: colors.textSecondary },
  bottomEmphasis: { fontWeight: '700', color: colors.primary },
});