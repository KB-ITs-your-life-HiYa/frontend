import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import PressableScale from '../../components/PressableScale';
import SettlementFundModal from './SettlementFundModal';
import { colors, radius, spacing } from '../../constants/colors';

// 자립정착금 배분 안내로 들어가는 진입점. 계산 로직과 모달은 이미 알림 화면(NotificationsScreen)에서
// 쓰고 있는 SettlementFundModal을 그대로 재사용한다 — 홈 화면에서는 열고 닫는 버튼만 하나 추가.
export default function SettlementFundEntryCard() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <PressableScale onPress={() => setVisible(true)}>
        <Card style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet" size={22} color={colors.white} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>자립정착금, 어떻게 나눠쓰면 좋을까요?</Text>
            <Text style={styles.subtitle}>내 지역 기준으로 배분안을 확인해보세요</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Card>
      </PressableScale>
      <SettlementFundModal visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary },
});
