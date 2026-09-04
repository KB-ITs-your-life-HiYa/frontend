import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import CareBanner from './CareBanner';
import Badge from '../../components/Badge';
import { colors, spacing } from '../../constants/colors';
import AssetSummaryCard from './AssetSummaryCard';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <CareBanner />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Badge label="자립수당 종료까지 D-1,647" icon="flag" style={{ backgroundColor: '#FEBB00' }} />
        <AssetSummaryCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
});