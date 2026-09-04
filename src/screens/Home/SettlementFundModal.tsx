import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import { colors, radius, spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { getSettlementAmount, getSidoName } from './settlementFund';

const PURPLE = '#6C5CE7';
const PURPLE_DARK = '#4B3FBD';
const BROWN = '#946200';

const EMERGENCY_FUND = 3_000_000;
const INITIAL_SETUP_FUND = 2_000_000;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettlementFundModal({ visible, onClose }: Props) {
  const { member } = useAuth();
  const settlementAmount = getSettlementAmount(member?.homeRegionCode);
  const sidoName = getSidoName(member?.homeRegionCode);
  const housingFund = settlementAmount - EMERGENCY_FUND - INITIAL_SETUP_FUND;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.popup} onPress={() => {}}>
          <Text style={styles.title}>정착금 배분 제안</Text>
          <Text style={styles.subtitle}>처음 받은 목돈을 나눌 기준이에요</Text>

          <View style={styles.fundBox}>
            <View style={styles.fundLeft}>
              <Text style={styles.fundLabel}>예상 자립정착금</Text>
              <MoneyText amount={settlementAmount} variant="large" color={colors.white} />
            </View>
            <View style={styles.regionBadge}>
              <Text style={styles.regionBadgeText}>{sidoName}</Text>
            </View>
          </View>

          <View style={styles.itemsWrap}>
            <Card style={styles.itemsCard}>
              <FundItem label="비상금" amount={EMERGENCY_FUND} desc="예상 못 한 일 대비" />
              <View style={styles.itemDivider} />
              <FundItem label="초기 정착비" amount={INITIAL_SETUP_FUND} desc="이사비, 가전·가구, 생필품 등 구매" />
              <View style={styles.itemDivider} />
              <FundItem label="주거 마련" amount={housingFund} />
            </Card>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>공공임대를 이용하면 달라져요</Text>
            <Text style={styles.tipBody}>
              LH 전세임대는 보증금이 100만원이라 주거 마련에 드는 돈이 크게 줄어요.
            </Text>
            <Pressable
              style={styles.tipLinkWrap}
              onPress={() => {
                // TODO: 공공임대 안내 화면 연결
              }}
            >
              <Text style={styles.tipLink}>공공임대 알아보기 {'>'}</Text>
            </Pressable>
          </View>

          <Text style={styles.footnote}>복지부 2024년 기준 · 실제 금액은 다를 수 있어요</Text>

          <Pressable
            onPress={() => {
              // TODO: 자립정착금 신청 안내로 이동. 외부 링크/앱 내 화면은 추후 결정
            }}
          >
            <Text style={styles.applyLink}>아직 자립정착금을 신청하지 않았다면?</Text>
          </Pressable>

          <Button label="확인" onPress={onClose} style={styles.confirmButton} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FundItem({ label, amount, desc }: { label: string; amount: number; desc?: string }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemHeadRow}>
        <Text style={styles.itemLabel}>{label}</Text>
        <MoneyText amount={amount} variant="medium" />
      </View>
      {desc ? <Text style={styles.itemDesc}>{desc}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: colors.notificationBackdrop },
  popup: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingTop: spacing.md + 14,
    paddingBottom: spacing.md + 14,
    gap: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: -spacing.sm },
  fundBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: PURPLE,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  fundLeft: { gap: 4 },
  fundLabel: { fontSize: 12, color: colors.white },
  regionBadge: {
    backgroundColor: PURPLE_DARK,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  regionBadgeText: { fontSize: 12, fontWeight: '700', color: colors.white },
  itemsWrap: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm },
  itemsCard: { gap: 0, padding: spacing.sm },
  itemRow: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, gap: 4 },
  itemHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  itemDesc: { fontSize: 12, color: colors.textTertiary },
  itemDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  tipBox: { backgroundColor: colors.accentLight, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: BROWN },
  tipBody: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  tipLinkWrap: { alignSelf: 'flex-end', marginTop: 2 },
  tipLink: { fontSize: 12, fontWeight: '700', color: BROWN },
  footnote: { fontSize: 11, color: colors.textTertiary, textAlign: 'center' },
  applyLink: {
    fontSize: 13,
    fontWeight: '600',
    color: PURPLE,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  confirmButton: { backgroundColor: PURPLE },
});