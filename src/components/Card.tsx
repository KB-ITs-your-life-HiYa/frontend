import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, spacing } from '../constants/colors';

// 토스 스타일 카드 컨테이너. 화면 곳곳에서 재사용합니다.
export default function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
