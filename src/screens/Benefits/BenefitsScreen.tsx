import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';
import { surveyApi } from '../../services/benefit';
import SurveyScreen from './SurveyScreen';
import BenefitMatchScreen from './BenefitMatchScreen';

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

  return <BenefitMatchScreen />;
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
});
