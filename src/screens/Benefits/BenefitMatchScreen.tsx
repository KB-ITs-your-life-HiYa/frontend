import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import { colors, radius, spacing } from '../../constants/colors';
import { benefitApi } from '../../services/benefit';
import type { CategoryMatchResponse, MatchCondition, SubsidyMatchResponse } from '../../types/benefit';

export default function BenefitMatchScreen() {
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
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>매칭 결과를 불러오지 못했어요</Text>
        </View>
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
        <View style={styles.centerFill}>
          <Text style={styles.emptyText}>아직 매칭되는 지원금이 없어요</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
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

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
  tabBar: { flexGrow: 0, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBarContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
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
