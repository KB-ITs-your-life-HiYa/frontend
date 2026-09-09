import React from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import CareBanner from './CareBanner';
import HomeHeroCard from './HomeHeroCard';
import TodayPlayPreviewCard from './TodayPlayPreviewCard';
import { colors, spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useRiseIn } from '../../hooks/useRiseIn';
import AssetSummaryCard from './AssetSummaryCard';
import ExpenseSummaryCard from './ExpenseSummaryCard';
import SupportEndForecastCard from './SupportEndForecastCard';

// D-365 모드: 자립수당 종료까지 D-365 이하로 들어오면(백엔드 SupportEndForecastService의
// ELIGIBLE_WITHIN_DAYS=365 와 같은 기준) SupportEndForecastCard가 나타나는 것과 같은 조건.
// 그 카드는 자기 데이터를 스스로 불러오지만, 히어로 카드 문구를 바꾸는 데는 굳이 그 API를
// 다시 부르지 않고 이미 갖고 있는 member.daysUntilSupportEnd로 같은 기준을 재사용한다.
function isD365Mode(daysUntilSupportEnd: number | null | undefined) {
  return daysUntilSupportEnd != null && daysUntilSupportEnd <= 365;
}

// 홈 탭. 카드(수당 종료 예측/자산/지출)마다 자기 데이터를 알아서 불러와 그리기 때문에
// 화면 전체를 가리는 로딩 스피너가 없다. 그 대신 화면에 들어오는 순간 위에서부터
// 순서대로 살짝 떠오르며 나타나서(useRiseIn) 첫인상이 덜 밋밋하게 느껴지게 했다.
// 각 카드 안의 숫자·막대 애니메이션은 카드 컴포넌트 자체에 들어있다.
//
// 맨 위 브랜드 히어로 카드(HomeHeroCard)로 색을 한 번 보여주고, 그 아래로 기존 지표
// 카드들 → 맨 아래 오늘의 놀이 미리보기까지 배치했다. D-365 모드에 들어오면 히어로 카드의
// 문구가 바뀌고, 아래 SupportEndForecastCard도 노란 톤으로 눈에 띄게 바뀐다.
// (AI 안심 지수 히어로 카드 / 자립정착금 배분 진입점은 이번 라운드에서 다시 뺐다 — CareStatusHero.tsx,
// SettlementFundEntryCard.tsx 파일 자체는 남겨뒀으니 나중에 다시 붙이고 싶으면 import만 되살리면 된다.)
export default function HomeScreen() {
  const { member } = useAuth();
  const d365Mode = isD365Mode(member?.daysUntilSupportEnd);

  const heroRise = useRiseIn(0, true);
  const forecastRise = useRiseIn(140, true);
  const assetRise = useRiseIn(210, true);
  const expenseRise = useRiseIn(280, true);
  const playRise = useRiseIn(350, true);

  return (
    <View style={styles.screen}>
      <ScreenHeader showNotification />
      <CareBanner />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Animated.View style={heroRise}>
          <HomeHeroCard isD365Mode={d365Mode} days={member?.daysUntilSupportEnd ?? undefined} />
        </Animated.View>
        {/* d365Mode로 감싸서 렌더링 자체를 건너뛴다. SupportEndForecastCard 내부에서만
            null을 반환하면, 빈 Animated.View가 그대로 남아 있어 content의 gap이
            위아래로 두 번(히어로→빈 래퍼, 빈 래퍼→자산 카드) 적용돼 일반 모드일 때
            히어로 카드 아래 간격이 D-365 모드보다 두 배로 벌어진다. */}
        {d365Mode ? (
          <Animated.View style={forecastRise}>
            <SupportEndForecastCard />
          </Animated.View>
        ) : null}
        <Animated.View style={assetRise}>
          <AssetSummaryCard />
        </Animated.View>
        <Animated.View style={expenseRise}>
          <ExpenseSummaryCard />
        </Animated.View>
        <Animated.View style={playRise}>
          <TodayPlayPreviewCard />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
});
