import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import { colors, radius, spacing } from '../../constants/colors';
import { EMPLOYMENT_STATUS_LABELS, HOUSING_TYPE_LABELS, SURVEY_TAG_LABELS } from '../../constants/benefitLabels';
import { benefitApi } from '../../services/benefit';
import { useAuth } from '../../contexts/AuthContext';
import type { CategoryMatchResponse, MatchCondition, SubsidyMatchResponse, SurveyResponse } from '../../types/benefit';

function formatYearMonth(iso: string) {
  const [y, m] = iso.split('-');
  return `${y}.${m}`;
}

interface Props {
  survey: SurveyResponse;
  onRetake: () => void;
}

export default function BenefitMatchScreen({ survey, onRetake }: Props) {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<CategoryMatchResponse[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    benefitApi
      .matches()
      .then((data) => {
        setCategories(data);
        setActiveCategory(data[0]?.category ?? null);
      })
      .catch(() => setError(true));
  }, []);

  const activeItems = useMemo(
    () => categories?.find((c) => c.category === activeCategory)?.items ?? [],
    [categories, activeCategory]
  );

  if (error) {
    return (
      <View style={styles.screen}>
        <ScreenHeader />
        <ScrollView contentContainerStyle={styles.content}>
          <InfoCard survey={survey} onRetake={onRetake} />
          <View style={styles.centerFill}>
            <Text style={styles.emptyText}>매칭 결과를 불러오지 못했어요</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (categories === null) {
    return (
      <View style={styles.screen}>
        <ScreenHeader />
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.screen}>
        <ScreenHeader />
        <ScrollView contentContainerStyle={styles.content}>
          <InfoCard survey={survey} onRetake={onRetake} />
          <View style={styles.centerFill}>
            <Text style={styles.emptyText}>아직 매칭되는 지원금이 없어요</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <InfoCard survey={survey} onRetake={onRetake} />

        <SectionHeader title="추천 지원 정책" />
        <Text style={styles.filterHint}>위 내 정보를 기준으로 필터링된 결과예요</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabBarContent}
        >
          {categories.map((cat) => {
            const active = activeCategory === cat.category;
            return (
              <Pressable
                key={cat.category}
                onPress={() => setActiveCategory(cat.category)}
                style={[styles.tab, active ? styles.tabActive : null]}
              >
                <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{cat.category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeItems.map((item) => (
          <SubsidyCard
            key={item.subsidyId}
            item={item}
            onPress={() => navigation.navigate('BenefitDetail', { item })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function InfoCard({ survey, onRetake }: { survey: SurveyResponse; onRetake: () => void }) {
  const { member } = useAuth();
  const [open, setOpen] = useState(true);

  const acctChips: string[] = [];
  if (member) {
    acctChips.push(`만 ${member.age}세`);
    acctChips.push(member.protectionEndDate ? `보호종료 ${formatYearMonth(member.protectionEndDate)}` : '보호중');
    if (member.regionName) acctChips.push(member.regionName);
  }

  const surveyChips: string[] = [];
  if (survey.householdSize != null) {
    surveyChips.push(survey.householdSize >= 6 ? '6인 이상 가구' : `${survey.householdSize}인 가구`);
  }
  if (survey.incomePctBracket != null) {
    surveyChips.push(survey.incomePctBracket === 999 ? '소득 150% 초과' : `소득 ${survey.incomePctBracket}% 이하`);
  }
  if (survey.isBenefitRecipient) surveyChips.push('기초생활수급자 등');
  if (survey.employmentStatus) surveyChips.push(EMPLOYMENT_STATUS_LABELS[survey.employmentStatus]);
  if (survey.housingType) surveyChips.push(HOUSING_TYPE_LABELS[survey.housingType]);
  survey.tags.forEach((tag) => surveyChips.push(SURVEY_TAG_LABELS[tag]));

  return (
    <Card style={styles.infoCard}>
      <Pressable style={styles.infoHeader} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.infoTitle}>내 정보</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textTertiary}
          style={styles.infoHeaderIcon}
        />
      </Pressable>

      {open ? (
        <>
          {acctChips.length > 0 ? (
            <View>
              <Text style={styles.infoGroupLabel}>계정 정보</Text>
              <View style={styles.infoChipRow}>
                {acctChips.map((label, idx) => (
                  <View key={idx} style={styles.infoChipOutline}>
                    <Text style={styles.infoChipOutlineText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <Text style={styles.infoGroupLabel}>설문 응답</Text>
          {surveyChips.length > 0 ? (
            <View style={styles.infoChipRow}>
              {surveyChips.map((label, idx) => (
                <View key={idx} style={styles.infoChip}>
                  <Text style={styles.infoChipText}>{label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.infoEmptyText}>아직 입력한 정보가 없어요</Text>
          )}

          <Pressable style={styles.retakeButton} onPress={onRetake}>
            <Text style={styles.retakeButtonText}>설문 다시하기</Text>
          </Pressable>
        </>
      ) : null}
    </Card>
  );
}

function SubsidyCard({ item, onPress }: { item: SubsidyMatchResponse; onPress: () => void }) {
  const metaLine = [item.orgName, item.applyDeadlineRaw].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.summary ? (
          <Text style={styles.cardSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        ) : null}

        {item.conditions.length > 0 ? (
          <View style={styles.conditionRow}>
            {item.conditions.map((condition, idx) => (
              <ConditionChip key={idx} condition={condition} />
            ))}
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {metaLine}
          </Text>
          <View style={styles.detailLinkRow}>
            <Text style={styles.detailLink}>상세보기</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function ConditionChip({ condition }: { condition: MatchCondition }) {
  const met = condition.status === 'MET';
  return (
    <View style={[styles.conditionChip, met ? styles.conditionChipMet : styles.conditionChipReview]}>
      <Ionicons name={met ? 'checkmark-circle' : 'alert-circle'} size={13} color={met ? colors.success : colors.warning} />
      <Text style={[styles.conditionChipText, { color: met ? colors.success : colors.warning }]}>{condition.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  tabScroll: {},
  tabBarContent: { gap: spacing.sm, paddingBottom: spacing.md },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  infoCard: { gap: spacing.sm, marginBottom: spacing.md },
  infoHeader: { flexDirection: 'row', alignItems: 'center' },
  infoHeaderIcon: { marginLeft: 4 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  infoGroupLabel: { fontSize: 11, fontWeight: '700', color: colors.textTertiary, marginBottom: spacing.xs },
  infoChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs },
  infoChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  infoChipText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  infoChipOutline: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  infoChipOutlineText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  infoEmptyText: { fontSize: 12, color: colors.textTertiary, marginBottom: spacing.xs },
  filterHint: { fontSize: 12, color: colors.textTertiary, marginTop: 4, marginBottom: spacing.sm },
  retakeButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.graySoft,
  },
  retakeButtonText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  card: { gap: 6, marginBottom: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  cardSummary: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  conditionChipMet: { backgroundColor: colors.successLight },
  conditionChipReview: { backgroundColor: colors.warningLight },
  conditionChipText: { fontSize: 11, fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  cardMeta: { flex: 1, fontSize: 12, color: colors.textTertiary, marginRight: spacing.sm },
  detailLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailLink: { fontSize: 12, color: colors.primary, fontWeight: '700' },
});
