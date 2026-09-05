import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import { colors, spacing } from '../../constants/colors';
import { benefitApi, surveyApi } from '../../services/benefit';
import SurveyScreen from './SurveyScreen';
import type { CategoryMatchResponse } from '../../types/benefit';

// 지원금 탭 진입점. 설문을 아직 안 했으면 설문 화면을, 했으면 매칭 결과를 보여준다.
// "설문을 했는지"는 기기가 아니라 서버(GET /members/me/survey)에 물어본다 — 계정을 바꿔가며
// 테스트할 때도 정확하도록.
export default function BenefitsScreen() {
  const [hasSurvey, setHasSurvey] = useState<boolean | null>(null); // null = 확인 중

  const checkSurvey = useCallback(async () => {
    setHasSurvey(null);
    try {
      const survey = await surveyApi.getMine();
      setHasSurvey(survey !== null);
    } catch {
      // 조회 실패 시 설문 화면을 다시 보여준다. 최악의 경우 다시 저장하면 되니 안전한 쪽으로 fallback
      setHasSurvey(false);
    }
  }, []);

  useEffect(() => {
    checkSurvey();
  }, [checkSurvey]);

  if (hasSurvey === null) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!hasSurvey) {
    return <SurveyScreen onComplete={checkSurvey} />;
  }

  return <BenefitMatchList />;
}

// TODO: 지원금 매칭 목록 화면(카테고리 탭 + 조건 체크리스트)으로 교체 예정. 지금은 매칭 API 연결 확인용 임시 화면
function BenefitMatchList() {
  const [categories, setCategories] = useState<CategoryMatchResponse[] | null>(null);

  useEffect(() => {
    benefitApi.matches().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (categories === null) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.placeholderNote}>매칭 목록 화면은 다음 작업에서 완성할 예정이에요</Text>
        {categories.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>매칭되는 지원금이 아직 없어요</Text>
          </Card>
        ) : (
          categories.map((cat) => (
            <View key={cat.category} style={styles.categoryBlock}>
              <SectionHeader title={cat.category} />
              {cat.items.map((item) => (
                <Card key={item.subsidyId} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  {item.summary ? <Text style={styles.itemSummary}>{item.summary}</Text> : null}
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  placeholderNote: { fontSize: 12, color: colors.textTertiary, marginBottom: spacing.md },
  categoryBlock: { marginBottom: spacing.lg },
  itemCard: { marginTop: spacing.sm, gap: 4 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  itemSummary: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { fontSize: 13, color: colors.textTertiary },
});
