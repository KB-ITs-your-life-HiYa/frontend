import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import CenterModal from '../../components/CenterModal';
import MoneyText from '../../components/MoneyText';
import { colors, radius, spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { getSettlementAmount, getSidoName } from './settlementFund';

const BROWN = '#946200';

const EMERGENCY_FUND = 3_000_000;
const INITIAL_SETUP_FUND = 2_000_000;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettlementFundModal({ visible, onClose }: Props) {
  const { member } = useAuth();
  const navigation = useNavigation();
  const settlementAmount = getSettlementAmount(member?.homeRegionCode);
  const sidoName = getSidoName(member?.homeRegionCode);
  const housingFund = settlementAmount - EMERGENCY_FUND - INITIAL_SETUP_FUND;

  const goToHousing = () => {
    onClose();
    // 이 모달은 탭 안(홈 화면)과 탭 밖(알림 화면) 양쪽에서 열려서, 어느 쪽에서 호출해도
    // 안전하게 동작하도록 루트 스택 화면 이름으로 중첩 이동한다. RootStackParamList 는
    // MainTabs 를 파라미터 없는 화면으로만 선언하고 있어 nested screen 이동은 타입이 안 맞는다.
    const nav = navigation as unknown as { navigate: (name: string, params?: object) => void };
    nav.navigate('MainTabs', { screen: 'Housing' });
  };

  return (
    <CenterModal visible={visible} onClose={onClose} contentStyle={styles.content}>
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

      <View style={styles.itemsSection}>
        <Text style={styles.itemsTitle}>추천 배분</Text>
        <View>
          <FundItem icon="shield-outline" label="비상금" amount={EMERGENCY_FUND} desc="예상 못 한 일 대비" />
          <View style={styles.itemDivider} />
          <FundItem icon="briefcase-outline" label="초기 정착비" amount={INITIAL_SETUP_FUND} desc="이사비, 가전·가구, 생필품 등 구매" />
          <View style={styles.itemDivider} />
          <FundItem icon="home-outline" label="주거 마련" amount={housingFund} desc="장기적인 주거 준비를 위한 자금" />
        </View>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>공공임대로 주거비 부담을 줄여보세요</Text>
        <Text style={styles.tipBody}>내게 맞는 공공임대주택 공고를 확인해보세요.</Text>
        <Pressable style={styles.tipLinkWrap} onPress={goToHousing}>
          <Text style={styles.tipLink}>공공임대 공고 보기 {'>'}</Text>
        </Pressable>
      </View>

      <Text style={styles.footnote}>복지부 2024년 기준 · 실제 금액은 다를 수 있어요</Text>

      <Button label="확인" onPress={onClose} style={styles.confirmButton} />
    </CenterModal>
  );
}

function FundItem({
  icon,
  label,
  amount,
  desc,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amount: number;
  desc: string;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemIconCircle}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.itemMid}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
      </View>
      <MoneyText amount={amount} variant="medium" />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
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
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  fundLeft: { gap: 4 },
  fundLabel: { fontSize: 12, color: colors.white },
  regionBadge: {
    backgroundColor: colors.chatAccent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  regionBadgeText: { fontSize: 12, fontWeight: '700', color: colors.white },
  itemsSection: { gap: spacing.sm, paddingHorizontal: spacing.md },
  itemsTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  itemIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemMid: { flex: 1, gap: 2 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  itemDesc: { fontSize: 12, color: colors.textTertiary },
  itemDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  tipBox: { backgroundColor: colors.accentLight, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: BROWN },
  tipBody: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  tipLinkWrap: { alignSelf: 'flex-end', marginTop: 2 },
  tipLink: { fontSize: 12, fontWeight: '700', color: BROWN },
  footnote: { fontSize: 11, color: colors.textTertiary, textAlign: 'center' },
  confirmButton: { backgroundColor: colors.primary },
});