import React from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import CareBanner from './CareBanner';
import DdayBanner from './DdayBanner';
import HomeHeroCard from './HomeHeroCard';
import TodayPlayPreviewCard from './TodayPlayPreviewCard';
import { colors, spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useRiseIn } from '../../hooks/useRiseIn';
import AssetSummaryCard from './AssetSummaryCard';
import ExpenseSummaryCard from './ExpenseSummaryCard';
import SupportEndForecastCard from './SupportEndForecastCard';

// 홈 탭. 카드(수당 종료 예측/자산/지출)마다 자기 데이터를 알아서 불러와 그리기 때문에
// 화면 전체를 가리는 로딩 스피너가 없다. 그 대신 화면에 들어오는 순간 위에서부터
// 순서대로 살짝 떠오르며 나타나서(useRiseIn) 첫인상이 덜 밋밋하게 느껴지게 했다.
// 각 카드 안의 숫자·막대 애니메이션은 카드 컴포넌트 자체에 들어있다.
//
// 맨 위 브랜드 히어로 카드(HomeHeroCard)로 색을 한 번 보여주고, D-day 배너 → 기존 지표
// 카드들 → 맨 아래 오늘의 놀이 미리보기까지 배치했다.
// (AI 안심 지수 히어로 카드 / 자립정착금 배분 진입점은 이번 라운드에서 다시 뺐다 — CareStatusHero.tsx,
// SettlementFundEntryCard.tsx 파일 자체는 남겨뒀으니 나중에 다시 붙이고 싶으면 import만 되살리면 된다.)
export default function HomeScreen() {
  const { member } = useAuth();

  const heroRise = useRiseIn(0, true);
  const ddayRise = useRiseIn(70, true);
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
          <HomeHeroCard />
        </Animated.View>
        {member?.daysUntilSupportEnd != null ? (
          <Animated.View style={ddayRise}>
            <DdayBanner days={member.daysUntilSupportEnd} />
          </Animated.View>
        ) : null}
        <Animated.View style={forecastRise}>
          <SupportEndForecastCard />
        </Animated.View>
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
