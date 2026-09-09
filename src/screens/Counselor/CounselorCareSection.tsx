import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import PressableScale from '../../components/PressableScale';
import { colors, radius, spacing } from '../../constants/colors';
import {
  CARE_REQUEST_STATUS_META,
  CareRequestStatus,
  CareSignalRequest,
  PROTECTION_STATUS_LABEL,
  RISK_LEVEL_META,
} from '../../types/counselor';

// 온라인 케어 시스템 · 이상징후 스택. AI가 감지해서 담당자 연계를 요청한 건들을
// 큐(스택)처럼 쌓아두고, 담당자가 위에서부터 훑으며 전화하기 / 상담 시작 / 종결로
// 처리한다. API에서 받은 요청은 현재 상황과 청년의 최근 답변을 함께 보여준다.

const FILTERS: { key: 'ALL' | CareRequestStatus; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'REQUESTED', label: '신규' },
  { key: 'CONTACTED', label: '상담 중' },
  { key: 'CLOSED', label: '종결' },
  { key: 'CANCELLED', label: '취소' },
];

function formatElapsed(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 경과`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 경과`;
  const days = Math.floor(hours / 24);
  return `${days}일 경과`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  signals: CareSignalRequest[];
  onUpdateStatus: (id: number, status: CareRequestStatus) => void;
}

export default function CounselorCareSection({ signals, onUpdateStatus }: Props) {
  const [filter, setFilter] = useState<'ALL' | CareRequestStatus>('ALL');

  const visible = filter === 'ALL' ? signals : signals.filter((s) => s.status === filter);
  // 처리가 급한 순서: 신규 → 상담 중 → 그 외, 같은 상태면 최근 요청이 위로
  const sorted = [...visible].sort((a, b) => {
    const order: Record<CareRequestStatus, number> = { REQUESTED: 0, CONTACTED: 1, CLOSED: 2, CANCELLED: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  return (
    <View style={{ gap: spacing.md }}>
      <View>
        <Text style={styles.title}>온라인 케어 시스템</Text>
        <Text style={styles.subtitle}>AI가 감지한 이상징후 연계 요청을 상태별로 관리해요</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const count = f.key === 'ALL' ? signals.length : signals.filter((s) => s.status === f.key).length;
          const active = filter === f.key;
          return (
            <PressableScale key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterChip, active && styles.filterChipActive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label} {count}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <View style={{ gap: spacing.sm }}>
        {sorted.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={22} color={colors.textTertiary} />
            <Text style={styles.emptyText}>해당하는 요청이 없어요</Text>
          </Card>
        ) : (
          sorted.map((s) => (
            <CareSignalCard key={s.id} signal={s} onUpdateStatus={onUpdateStatus} />
          ))
        )}
      </View>
    </View>
  );
}

function CareSignalCard({ signal, onUpdateStatus }: { signal: CareSignalRequest; onUpdateStatus: Props['onUpdateStatus'] }) {
  const statusMeta = CARE_REQUEST_STATUS_META[signal.status];
  const riskMeta = RISK_LEVEL_META[signal.aiRiskLevel];
  const canStartCare = signal.source === 'MOCK' && signal.status === 'REQUESTED';
  const canClose = signal.source === 'MOCK' && (signal.status === 'REQUESTED' || signal.status === 'CONTACTED');

  return (
    <Card style={styles.signalCard}>
      <View style={styles.signalHeader}>
        <View style={styles.signalHeaderLeft}>
          <Text style={styles.requesterName}>{signal.requesterName}</Text>
          {signal.source === 'API' ? (
            <View style={[styles.badge, styles.connectedBadge]}>
              <Ionicons name="sync" size={11} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>실시간 전달</Text>
            </View>
          ) : null}
          <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.badgeText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: riskMeta.bg }]}>
            <Ionicons name="pulse" size={11} color={riskMeta.color} />
            <Text style={[styles.badgeText, { color: riskMeta.color }]}>AI 위험도 · {riskMeta.label}</Text>
          </View>
        </View>
        <View style={styles.elapsedCol}>
          <Text style={styles.elapsedText}>{formatElapsed(signal.requestedAt)}</Text>
          <Text style={styles.requestedAtText}>{formatDateTime(signal.requestedAt)} 요청</Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <MetaItem icon="call-outline" label="전화번호" value={signal.phone} />
        <MetaItem icon="person-outline" label="나이" value={`${signal.age}세`} />
        <MetaItem icon="location-outline" label="거주 지역" value={signal.regionName} />
        <MetaItem icon="shield-outline" label="보호 상태" value={PROTECTION_STATUS_LABEL[signal.protectionStatus]} />
      </View>

      <View style={styles.reasonBox}>
        <Text style={styles.reasonLabel}>{signal.source === 'API' ? '감지된 현재 상황' : '담당자 연계 요청 사유'}</Text>
        <Text style={styles.reasonText}>{signal.situation ?? signal.reason}</Text>
      </View>

      {signal.latestUserMessage ? (
        <View style={styles.messageBox}>
          <Text style={styles.reasonLabel}>청년의 최근 답변</Text>
          <Text style={styles.messageText}>“{signal.latestUserMessage}”</Text>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <PressableScale
          style={[styles.actionButton, styles.callButton]}
          onPress={() => Linking.openURL(`tel:${signal.phone}`)}
        >
          <Ionicons name="call" size={14} color={colors.white} />
          <Text style={styles.actionTextLight}>전화하기</Text>
        </PressableScale>

        {signal.source === 'MOCK' ? (
          <>
            <PressableScale
              style={[styles.actionButton, canStartCare ? styles.startButton : styles.actionDisabled]}
              disabled={!canStartCare}
              onPress={() => onUpdateStatus(signal.id, 'CONTACTED')}
            >
              <Ionicons name="chatbubbles-outline" size={14} color={canStartCare ? colors.primary : colors.textTertiary} />
              <Text style={[styles.actionTextDark, !canStartCare && styles.actionTextMuted]}>상담 시작</Text>
            </PressableScale>

            <PressableScale
              style={[styles.actionButton, canClose ? styles.closeButton : styles.actionDisabled]}
              disabled={!canClose}
              onPress={() => onUpdateStatus(signal.id, 'CLOSED')}
            >
              <Ionicons name="checkmark-done-outline" size={14} color={canClose ? colors.success : colors.textTertiary} />
              <Text style={[styles.actionTextDark, !canClose && styles.actionTextMuted, canClose && { color: colors.success }]}>종결</Text>
            </PressableScale>
          </>
        ) : null}
      </View>
    </Card>
  );
}

function MetaItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={colors.textTertiary} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  filterChip: {
    borderRadius: radius.full,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  emptyCard: { alignItems: 'center', gap: 6, paddingVertical: spacing.lg },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  signalCard: { gap: spacing.sm },
  signalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  signalHeaderLeft: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, flex: 1 },
  requesterName: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginRight: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.full,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  connectedBadge: { backgroundColor: colors.primaryLight },
  elapsedCol: { alignItems: 'flex-end' },
  elapsedText: { fontSize: 12, fontWeight: '800', color: colors.danger },
  requestedAtText: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  metaLabel: { fontSize: 11, color: colors.textTertiary },
  metaValue: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  reasonBox: { backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.sm, gap: 2 },
  reasonLabel: { fontSize: 11, color: colors.textTertiary, fontWeight: '700' },
  reasonText: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  messageBox: {
    gap: 5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  messageText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, lineHeight: 19 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1.5,
  },
  callButton: { backgroundColor: colors.primary, borderColor: colors.primary },
  startButton: { borderColor: colors.primary },
  closeButton: { borderColor: colors.success },
  actionDisabled: { borderColor: colors.border },
  actionTextLight: { fontSize: 13, fontWeight: '700', color: colors.white },
  actionTextDark: { fontSize: 13, fontWeight: '700', color: colors.primary },
  actionTextMuted: { color: colors.textTertiary },
});
