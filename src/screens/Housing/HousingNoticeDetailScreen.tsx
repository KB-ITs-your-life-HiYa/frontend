import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { colors, spacing } from '../../constants/colors';
import { ApiError } from '../../services/api';
import { housingApi } from '../../services/housing';
import { HousingNoticeDetail, HousingNoticeUnit, HousingTargetType } from '../../types/housing';
import { formatWon } from '../../utils/money';

type DetailRoute = RouteProp<{ HousingNoticeDetail: { noticeId: number } }, 'HousingNoticeDetail'>;

const TARGET_LABEL: Record<HousingTargetType, string> = {
  SELF_RELIANCE: '자립준비청년',
  YOUTH: '청년',
  GENERAL: '일반',
};

function formatIsoMonthDay(iso: string) {
  const [, m, d] = iso.split('-');
  return `${Number(m)}.${Number(d)}`;
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function UnitCard({ unit }: { unit: HousingNoticeUnit }) {
  const location = [unit.region, unit.district].filter(Boolean).join(' ');
  return (
    <Card style={styles.unitCard}>
      {unit.complexName ? <Text style={styles.unitTitle}>{unit.complexName}</Text> : null}
      {location ? <Text style={styles.unitMeta}>{location}</Text> : null}
      <InfoRow label="주소" value={unit.fullAddress} />
      <InfoRow label="난방" value={unit.heatingType} />
      <InfoRow label="총 세대" value={unit.totalHouseholds != null ? `${unit.totalHouseholds}세대` : null} />
      <InfoRow label="공급 호수" value={unit.supplyCount != null ? `${unit.supplyCount}호` : null} />
      <InfoRow label="보증금" value={unit.deposit != null ? formatWon(unit.deposit) : null} />
      <InfoRow label="월세" value={unit.monthlyRent != null ? formatWon(unit.monthlyRent) : null} />
      <InfoRow label="계약금" value={unit.contractDeposit != null ? formatWon(unit.contractDeposit) : null} />
      <InfoRow label="잔금" value={unit.balance != null ? formatWon(unit.balance) : null} />
    </Card>
  );
}

export default function HousingNoticeDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { noticeId } = route.params;

  const [detail, setDetail] = useState<HousingNoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await housingApi.getNoticeDetail(noticeId);
        if (!cancelled) setDetail(res);
      } catch (e) {
        if (!cancelled) {
          setDetail(null);
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
  }, [noticeId]);

  async function openUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      // 브라우저를 못 열면 조용히 무시. 링크 버튼은 그대로 둔다
    }
  }

  const period =
    detail?.beginDate && detail?.endDate
      ? `${formatIsoMonthDay(detail.beginDate)} ~ ${formatIsoMonthDay(detail.endDate)}`
      : detail?.beginDate
        ? `${formatIsoMonthDay(detail.beginDate)}부터`
        : detail?.endDate
          ? `${formatIsoMonthDay(detail.endDate)}까지`
          : null;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="공고 상세" showBack showProfile={false} flat extraTopPadding={14} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.statusWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error || !detail ? (
          <Card style={styles.statusWrap}>
            <Text style={styles.errorText}>{error ?? '공고를 불러오지 못했습니다'}</Text>
          </Card>
        ) : (
          <>
            <Card style={styles.headerCard}>
              <View style={styles.badgeRow}>
                <Badge label={TARGET_LABEL[detail.targetType]} tone="primary" />
                {detail.superseded ? <Badge label="정정됨" tone="gray" /> : null}
              </View>
              <Text style={styles.title}>{detail.title ?? '제목 없는 공고'}</Text>
              {(detail.institution || detail.supplyType) && (
                <Text style={styles.subtitle}>
                  {[detail.institution, detail.supplyType].filter(Boolean).join(' · ')}
                </Text>
              )}
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>공고 정보</Text>
              <InfoRow label="접수기간" value={period} />
              <InfoRow label="공고일" value={detail.announceDate ? formatIsoMonthDay(detail.announceDate) : null} />
              <InfoRow
                label="당첨자 발표"
                value={detail.winnerAnnounceDate ? formatIsoMonthDay(detail.winnerAnnounceDate) : null}
              />
              <InfoRow label="주택유형" value={detail.houseType} />
              <InfoRow label="공급유형" value={detail.supplyType} />
              <InfoRow label="공급기관" value={detail.institution} />
              <InfoRow label="문의처" value={detail.contact} />
            </Card>

            <Text style={styles.listHeading}>단지 · 임대조건</Text>
            {detail.units.length === 0 ? (
              <Card style={styles.statusWrap}>
                <Text style={styles.emptyText}>등록된 단지가 없어요</Text>
              </Card>
            ) : (
              detail.units.map((unit) => <UnitCard key={unit.id} unit={unit} />)
            )}

            {(detail.applyUrl || detail.myhomeUrl) && (
              <View style={styles.linkGroup}>
                {detail.applyUrl ? (
                  <Button label="원문 공고 보기" onPress={() => openUrl(detail.applyUrl!)} />
                ) : null}
                {detail.myhomeUrl ? (
                  <Pressable style={styles.secondaryLink} onPress={() => openUrl(detail.myhomeUrl!)}>
                    <Ionicons name="open-outline" size={16} color={colors.primary} />
                    <Text style={styles.secondaryLinkText}>마이홈포털에서 보기</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  statusWrap: { alignItems: 'center', paddingVertical: spacing.lg },
  errorText: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  headerCard: { gap: spacing.sm },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, lineHeight: 26 },
  subtitle: { fontSize: 13, color: colors.textSecondary },
  sectionCard: { gap: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 13, color: colors.textTertiary, minWidth: 72 },
  infoValue: { flex: 1, fontSize: 13, color: colors.textPrimary, textAlign: 'right', lineHeight: 18 },
  listHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  unitCard: { gap: 2 },
  unitTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  unitMeta: { fontSize: 12, color: colors.textTertiary, marginBottom: 4 },
  linkGroup: { gap: spacing.sm, marginTop: spacing.sm },
  secondaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  secondaryLinkText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
