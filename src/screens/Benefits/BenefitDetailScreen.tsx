import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';
import { formatWon } from '../../utils/money';
import type { MatchCondition, SubsidyMatchResponse } from '../../types/benefit';

type DetailRoute = RouteProp<{ BenefitDetail: { item: SubsidyMatchResponse } }, 'BenefitDetail'>;

function formatIsoDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${y}.${Number(m)}.${Number(d)}`;
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

function ConditionRow({ condition }: { condition: MatchCondition }) {
  const met = condition.status === 'MET';
  return (
    <View style={styles.conditionRow}>
      <Ionicons name={met ? 'checkmark-circle' : 'alert-circle'} size={18} color={met ? colors.success : colors.warning} />
      <Text style={styles.conditionLabel}>{condition.label}</Text>
      <Text style={[styles.conditionStatus, { color: met ? colors.success : colors.warning }]}>
        {met ? '충족' : '확인 필요'}
      </Text>
    </View>
  );
}

export default function BenefitDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { item } = route.params;

  const deadline = item.applyDeadlineDate ? formatIsoDate(item.applyDeadlineDate) : item.applyDeadlineRaw;

  async function openUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      // 브라우저를 못 열면 조용히 무시. 링크 버튼은 그대로 둔다
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="지원금 상세" showBack showProfile={false} flat extraTopPadding={14} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.headerCard}>
          <Badge label={item.category} tone="primary" />
          <Text style={styles.title}>{item.name}</Text>
          {(item.orgName || deadline) && (
            <Text style={styles.subtitle}>{[item.orgName, deadline].filter(Boolean).join(' · ')}</Text>
          )}
          {item.summary ? <Text style={styles.summary}>{item.summary}</Text> : null}
        </Card>

        {item.benefits.length > 0 ? (
          <>
            <Text style={styles.listHeading}>혜택</Text>
            <Card style={styles.sectionCard}>
              {item.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <Text style={styles.benefitName}>{benefit.benefitName}</Text>
                  {benefit.amountKrw != null ? (
                    <Text style={styles.benefitAmount}>
                      {formatWon(benefit.amountKrw)}
                      {benefit.cycle ? ` · ${benefit.cycle}` : ''}
                    </Text>
                  ) : benefit.cycle ? (
                    <Text style={styles.benefitAmount}>{benefit.cycle}</Text>
                  ) : null}
                </View>
              ))}
            </Card>
          </>
        ) : null}

        {item.conditions.length > 0 ? (
          <>
            <Text style={styles.listHeading}>신청 조건 확인</Text>
            <Card style={styles.sectionCard}>
              {item.conditions.map((condition, idx) => (
                <ConditionRow key={idx} condition={condition} />
              ))}
              {item.needsReviewCount > 0 ? (
                <Text style={styles.reviewHint}>
                  확인 필요 항목은 본인이 실제로 해당하는지 직접 확인해봐야 해요
                </Text>
              ) : null}
            </Card>
          </>
        ) : null}

        <Text style={styles.listHeading}>신청 정보</Text>
        <Card style={styles.sectionCard}>
          <InfoRow label="신청 방법" value={item.applyMethod} />
          <InfoRow label="신청 마감" value={deadline} />
        </Card>

        {item.detailUrl ? (
          <Button label="자세히 보러가기" style={styles.linkButton} onPress={() => openUrl(item.detailUrl!)} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  headerCard: { gap: spacing.sm },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, lineHeight: 26 },
  subtitle: { fontSize: 13, color: colors.textSecondary },
  summary: { fontSize: 14, color: colors.textPrimary, lineHeight: 20, marginTop: 2 },
  listHeading: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm, marginBottom: 2 },
  sectionCard: { gap: 2 },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  benefitName: { flex: 1, fontSize: 13, color: colors.textPrimary },
  benefitAmount: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  conditionLabel: { flex: 1, fontSize: 13, color: colors.textPrimary },
  conditionStatus: { fontSize: 12, fontWeight: '700' },
  reviewHint: { fontSize: 11, color: colors.textTertiary, marginTop: spacing.xs, lineHeight: 16 },
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
  linkButton: { marginTop: spacing.sm },
});
