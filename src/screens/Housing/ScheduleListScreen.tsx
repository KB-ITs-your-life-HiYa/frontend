import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import { colors, spacing } from '../../constants/colors';
import { ApiError } from '../../services/api';
import { housingApi } from '../../services/housing';
import { HousingNoticeSummary } from '../../types/housing';
import ScheduleItemRow from './ScheduleItemRow';
import { buildScheduleEvents, upcomingScheduleEvents } from './scheduleEvents';
import { TODAY } from '../../utils/today';

// 독립 지원 — "주거지원 일정" 전체보기. 이번 달·다음 달 공고의 시작/마감 일정
export default function ScheduleListScreen() {
  const navigation = useNavigation<any>();
  const [notices, setNotices] = useState<HousingNoticeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const y = TODAY.getFullYear();
        const m = TODAY.getMonth() + 1;
        const next = m === 12 ? { year: y + 1, month: 1 } : { year: y, month: m + 1 };
        const [cur, nxt] = await Promise.all([
          housingApi.getCalendar({ year: y, month: m }),
          housingApi.getCalendar({ year: next.year, month: next.month }),
        ]);
        if (cancelled) return;
        const byId = new Map<number, HousingNoticeSummary>();
        for (const n of [...cur.notices, ...cur.ongoingNotices, ...nxt.notices, ...nxt.ongoingNotices]) {
          byId.set(n.id, n);
        }
        setNotices([...byId.values()]);
      } catch (e) {
        if (!cancelled) {
          setNotices([]);
          setError(
            e instanceof ApiError ? e.message : '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const events = useMemo(
    () => upcomingScheduleEvents(buildScheduleEvents(notices)),
    [notices]
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="주거지원 일정" showBack showProfile={false} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.statusWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <Card style={styles.statusWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : events.length === 0 ? (
          <Card style={styles.statusWrap}>
            <Text style={styles.emptyText}>다가오는 일정이 없어요</Text>
          </Card>
        ) : (
          <Card style={styles.listCard}>
            {events.map((item, index) => (
              <React.Fragment key={item.id}>
                <ScheduleItemRow
                  item={item}
                  onPress={() =>
                    navigation.navigate('HousingNoticeDetail', { noticeId: item.noticeId })
                  }
                />
                {index < events.length - 1 ? <View style={styles.divider} /> : null}
              </React.Fragment>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  listCard: { paddingVertical: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  statusWrap: { alignItems: 'center', paddingVertical: spacing.lg },
  errorText: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  emptyText: { fontSize: 13, color: colors.textTertiary },
});
