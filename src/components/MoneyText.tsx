import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  amount: number;
  variant?: 'large' | 'medium';
}

// 금액 표시. 숫자와 "원"을 다른 크기·굵기로 분리해서 렌더링한다
export default function MoneyText({ amount, variant = 'medium' }: Props) {
  return (
    <Text>
      <Text style={styles[variant].number}>{amount.toLocaleString('ko-KR')}</Text>
      <Text style={styles[variant].won}>원</Text>
    </Text>
  );
}

const styles = {
  large: StyleSheet.create({
    number: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
    won: { fontSize: 19, fontWeight: '600', color: colors.textPrimary },
  }),
  medium: StyleSheet.create({
    number: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    won: { fontSize: 12, fontWeight: '500', color: colors.textPrimary },
  }),
} as const;