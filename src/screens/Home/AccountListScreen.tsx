import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
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

// 계좌 이니셜 원형 배경색. 은행명 첫 글자로 찾고, 목록에 없으면 기본색을 쓴다
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
      <ScreenHeader title={TITLES[type]} showBack showProfile={false} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.status} />
        ) : error || !data ? (
          <Text style={styles.error}>{error ?? '계좌 정보를 불러오지 못했습니다'}</Text>
        ) : (
          <>
            <View style={styles.summaryBlock}>
              <Text style={styles.sumLabel}>{SUM_LABELS[type]}</Text>
              <MoneyText amount={data.totalBalance} variant="large" />
            </View>

            <Card style={styles.listCard}>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}

function AccountRow({ account }: { account: AccountItem }) {
  const initial = account.bankName.charAt(0);
  const iconColor = BANK_ICON_COLORS[initial] ?? DEFAULT_BANK_ICON_COLOR;

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
        <Text style={styles.iconInitial}>{initial}</Text>
      </View>
      <View style={styles.rowTextCol}>
        <Text style={styles.rowBankName}>{account.bankName}</Text>
        <Text style={styles.rowType}>{TYPE_LABELS[account.accountType]}</Text>
      </View>
      <MoneyText amount={account.balance} variant="medium" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  status: { marginTop: spacing.xl },
  error: { fontSize: 13, color: colors.danger, textAlign: 'center', marginTop: spacing.xl },
  summaryBlock: { gap: 4 },
  sumLabel: { fontSize: 13, color: colors.textSecondary },
  listCard: { paddingVertical: spacing.sm, marginTop: spacing.sm },
  empty: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconInitial: { color: colors.white, fontSize: 15, fontWeight: '700' },
  rowTextCol: { flex: 1, gap: 2 },
  rowBankName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  rowType: { fontSize: 12, color: colors.textTertiary },
});