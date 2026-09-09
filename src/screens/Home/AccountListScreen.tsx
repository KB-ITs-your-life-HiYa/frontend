import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import { colors, spacing } from '../../constants/colors';
import { api, ApiError } from '../../services/api';
import { AccountItem, AccountListResponse, AccountType } from '../../types';

const TITLES: Record<AccountType, string> = { DEPOSIT: '계좌·현금', SAVINGS: '예적금' };
const SUM_LABELS: Record<AccountType, string> = { DEPOSIT: '계좌 · 현금 잔액', SAVINGS: '예적금 합계' };
const TYPE_LABELS: Record<AccountType, string> = { DEPOSIT: '입출금', SAVINGS: '적금' };

// 은행 로고. 은행명에 포함된 키워드로 찾고, 목록에 없으면 이니셜 원으로 대체한다
const BANK_LOGOS: { keyword: string; source: number }[] = [
  { keyword: 'KB', source: require('../../../assets/kb.png') },
  { keyword: '신한', source: require('../../../assets/shinhan.png') },
  { keyword: '우리', source: require('../../../assets/woori.png') },
];
function findBankLogo(bankName: string) {
  return BANK_LOGOS.find((logo) => bankName.includes(logo.keyword))?.source ?? null;
}

const BANK_ICON_COLORS: Record<string, string> = {
  K: colors.primary,
  신: colors.success,
};
const DEFAULT_BANK_ICON_COLOR = colors.textTertiary;

export default function AccountListScreen() {
  const route = useRoute<any>();
  const type: AccountType = route.params?.type === 'SAVINGS' ? 'SAVINGS' : 'DEPOSIT';

  const [data, setData] = useState<AccountListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<AccountListResponse>(`/members/me/accounts?type=${type}`);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError ? e.message : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title={TITLES[type]} showBack showProfile={false} flat extraTopPadding={14} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.status} />
        ) : error || !data ? (
          <Text style={styles.error}>{error ?? '계좌 정보를 불러오지 못했습니다'}</Text>
        ) : (
          <Card style={styles.listCard}>
            <View style={styles.summaryBlock}>
              <Text style={styles.sumLabel}>{SUM_LABELS[type]}</Text>
              <MoneyText amount={data.totalBalance} variant="large" />
            </View>
            <View style={styles.divider} />

            {data.accounts.length === 0 ? (
              <Text style={styles.empty}>등록된 계좌가 없어요</Text>
            ) : (
              data.accounts.map((account, index) => (
                <React.Fragment key={`${account.bankName}-${index}`}>
                  <AccountRow account={account} />
                  {index < data.accounts.length - 1 ? <View style={styles.divider} /> : null}
                </React.Fragment>
              ))
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

function AccountRow({ account }: { account: AccountItem }) {
  const logo = findBankLogo(account.bankName);
  const initial = account.bankName.charAt(0);
  const iconColor = BANK_ICON_COLORS[initial] ?? DEFAULT_BANK_ICON_COLOR;

  return (
    <View style={styles.row}>
      {logo ? (
        <View style={styles.iconCircleLogo}>
          <Image source={logo} style={styles.iconLogo} resizeMode="contain" />
        </View>
      ) : (
        <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
          <Text style={styles.iconInitial}>{initial}</Text>
        </View>
      )}
      <View style={styles.rowTextCol}>
        <Text style={styles.rowBankName}>{account.bankName}</Text>
        <Text style={styles.rowType}>{TYPE_LABELS[account.accountType]}</Text>
      </View>
      <MoneyText amount={account.balance} variant="medium" animate={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  status: { marginTop: spacing.xl },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center', marginTop: spacing.xl },
  summaryBlock: { gap: 4, paddingVertical: 10 },
  sumLabel: { fontSize: 13, color: colors.textSecondary },
  listCard: { paddingVertical: spacing.sm },
  empty: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconInitial: { color: colors.white, fontSize: 18, fontWeight: '700' },
  iconCircleLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconLogo: { width: 34, height: 34 },
  rowTextCol: { flex: 1, gap: 2 },
  rowBankName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  rowType: { fontSize: 12, color: colors.textTertiary },
});