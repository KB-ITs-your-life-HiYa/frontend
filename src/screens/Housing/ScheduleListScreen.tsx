import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import { colors, spacing } from '../../constants/colors';
import { scheduleItems } from './scheduleData';
import ScheduleItemRow from './ScheduleItemRow';

// 독립 지원 — "주거지원 일정" 전체보기 화면
export default function ScheduleListScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="주거지원 일정" showBack showProfile={false} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.caption}>내 정보를 기반으로 지원 대상 충족 여부를 자동으로 확인했어요</Text>
        <Card style={styles.listCard}>
          {scheduleItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <ScheduleItemRow item={item} />
              {index < scheduleItems.length - 1 ? <View style={styles.divider} /> : null}
            </React.Fragment>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  caption: { fontSize: 12, color: colors.textTertiary, marginBottom: spacing.sm },
  listCard: { paddingVertical: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
