import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import CareBanner from './CareBanner';
import Badge from '../../components/Badge';
import { colors, spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { formatDday } from '../../utils/today';
import AssetSummaryCard from './AssetSummaryCard';
import ExpenseSummaryCard from './ExpenseSummaryCard';
import SupportEndForecastCard from './SupportEndForecastCard';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { member } = useAuth();

  return (
    <View style={styles.screen}>
      <ScreenHeader showNotification />
      <CareBanner />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {member?.daysUntilSupportEnd != null ? (
          <Badge
            label={`자립수당 종료까지 ${formatDday(member.daysUntilSupportEnd)}`}
            icon="flag"
            style={{ backgroundColor: '#FEBB00' }}
          />
        ) : null}
        <SupportEndForecastCard />
        <AssetSummaryCard />
        <ExpenseSummaryCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
});