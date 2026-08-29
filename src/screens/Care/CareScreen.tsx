import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ToggleRow from '../../components/ToggleRow';
import CircularGauge from '../../components/CircularGauge';
import { colors, spacing } from '../../constants/colors';

// 온라인 케어 — 위험 신호 감지 대시보드
const timeline = [
  { id: '1', title: '주거지원금 수령 완료', meta: '오늘 오전 10:30', active: true },
  { id: '2', title: '자립 멘토 상담 예약', meta: '어제 오후 2:15' },
  { id: '3', title: '공과금 자동이체 설정', meta: '3일 전' },
];

// 돌봄 신호 감지: 납부 누락·소비 패턴 급변 등을 일 단위로 모니터링하는 지표
const signals = [
  { id: '1', label: '정기 납입·납부', status: '정상', ok: true },
  { id: '2', label: '소비 패턴 변화', status: '정상', ok: true },
  { id: '3', label: '앱 접속 주기', status: '정상', ok: true },
  { id: '4', label: '잔액·거래 변동폭', status: '관찰 중', ok: false },
];

export default function CareScreen() {
  const [rentAutoPay, setRentAutoPay] = useState(true);
  const [savingsAutoPay, setSavingsAutoPay] = useState(true);

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack showProfile={false} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.gaugeCard}>
          <Text style={styles.gaugeTitle}>이번 주 나의 안심 지수</Text>
          <Text style={styles.gaugeSubtitle}>현재 모든 금융 및 자립 활동이 안정적으로 관리되고 있습니다.</Text>
          <View style={{ marginVertical: spacing.sm }}>
            <Badge label="안정 상태" tone="primary" icon="checkmark-circle" />
          </View>
          <View style={styles.gaugeWrap}>
            <CircularGauge value={85} />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>정기 결제 관리</Text>
            <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
          </View>
          <ToggleRow
            title="월세 자동이체"
            description="매월 25일 · 450,000원"
            value={rentAutoPay}
            onValueChange={setRentAutoPay}
          />
          <View style={styles.divider} />
          <ToggleRow
            title="청년도약계좌 납입"
            description="매월 10일 · 100,000원"
            value={savingsAutoPay}
            onValueChange={setSavingsAutoPay}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이상징후 감지 지표</Text>
            <Ionicons name="pulse-outline" size={18} color={colors.textSecondary} />
          </View>
          <Text style={styles.signalDesc}>
            아래 지표를 매일 확인하고 있어요. 이상징후가 감지되면 AI가 먼저 말을 걸고, 계속되면 담당자에게 알림을
            보내드려요.
          </Text>
          <View style={styles.signalGrid}>
            {signals.map((s) => (
              <View key={s.id} style={styles.signalItem}>
                <View style={styles.signalHeaderRow}>
                  <View style={[styles.signalDot, { backgroundColor: s.ok ? colors.success : colors.warning }]} />
                  <Text style={styles.signalLabel}>{s.label}</Text>
                </View>
                <Text style={[styles.signalStatus, { color: s.ok ? colors.success : colors.warning }]}>{s.status}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 활동 내역</Text>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
          </View>
          {timeline.map((item, index) => (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineMarkerCol}>
                <View style={[styles.dot, item.active ? styles.dotActive : styles.dotInactive]} />
                {index < timeline.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.timelineTextCol}>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                <Text style={styles.timelineMeta}>{item.meta}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  gaugeCard: { alignItems: 'center', paddingVertical: spacing.lg },
  gaugeTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  gaugeSubtitle: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 6, paddingHorizontal: spacing.md },
  gaugeWrap: { marginTop: spacing.sm },
  sectionCard: { gap: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border },
  timelineRow: { flexDirection: 'row', gap: spacing.sm },
  timelineMarkerCol: { alignItems: 'center', width: 14 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { backgroundColor: colors.track },
  line: { flex: 1, width: 1, backgroundColor: colors.border, marginVertical: 2 },
  timelineTextCol: { flex: 1, paddingBottom: spacing.md },
  timelineTitle: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  timelineMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  signalDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginBottom: spacing.sm },
  signalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  signalItem: {
    width: '47%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    gap: 4,
  },
  signalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signalDot: { width: 8, height: 8, borderRadius: 4 },
  signalLabel: { fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  signalStatus: { fontSize: 13, fontWeight: '700' },
});
