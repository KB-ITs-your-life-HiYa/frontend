import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import PressableScale from '../../components/PressableScale';
import { colors, radius, spacing } from '../../constants/colors';
import { PROTECTION_STATUS_LABEL, RISK_LEVEL_META } from '../../types/counselor';
import type { AiRiskLevel, CounselorYouth, YouthMessage } from '../../types/counselor';
import { formatDday } from '../../utils/today';

// 공통 기능: 자립청년 각각 관리 + 메시지 보내기.
// 목록 위 툴바에 "엑셀 다운로드"(현재 필터된 목록을 CSV로 저장 — 웹에서만 동작)와
// "메시지 일괄 발송"(현재 필터에 걸린 청년 전원에게 같은 메시지 한 번에 보내기)을 추가했다.
// 청년을 고르면 그 청년의 상세(디데이/정착금/월별 지급 이력/메모)와 메시지 작성창이 뜬다.
// 대시보드의 "상세보기"에서 특정 청년으로 바로 들어올 수 있도록 선택 상태는 부모
// (CounselorPortalScreen)가 들고 있고, 이 컴포넌트는 selectedId/onSelectId로 제어된다.

type FilterKey = 'ALL' | AiRiskLevel | 'IN_CARE';

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'NORMAL', label: '정상' },
  { key: 'CARE', label: '관찰 필요' },
  { key: 'HUMAN_CARE', label: '긴급 케어' },
  { key: 'IN_CARE', label: '보호중' },
];

function matchesFilter(y: CounselorYouth, key: FilterKey): boolean {
  if (key === 'ALL') return true;
  if (key === 'IN_CARE') return y.protectionStatus === 'IN_CARE';
  return y.riskLevel === key;
}

function toCsvValue(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(youths: CounselorYouth[]): 'ok' | 'unsupported' {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return 'unsupported';
  const header = ['이름', '전화번호', '나이', '거주지역', '보호상태', '자립수당종료Dday', '정착금지급', '이번달수당지급', 'AI위험도'];
  const lines = [header.join(',')];
  youths.forEach((y) => {
    const cur = y.monthlyAllowances[y.monthlyAllowances.length - 1];
    lines.push(
      [
        toCsvValue(y.name),
        toCsvValue(y.phone),
        toCsvValue(y.age),
        toCsvValue(y.regionName),
        toCsvValue(PROTECTION_STATUS_LABEL[y.protectionStatus]),
        toCsvValue(y.daysUntilSupportEnd != null ? formatDday(y.daysUntilSupportEnd) : '보호중'),
        toCsvValue(y.settlementFundPaid ? '지급완료' : '미지급'),
        toCsvValue(cur ? (cur.paid ? '지급완료' : '미지급') : '대상 아님'),
        toCsvValue(RISK_LEVEL_META[y.riskLevel].label),
      ].join(',')
    );
  });
  const csv = '﻿' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `자립청년_목록_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return 'ok';
}

interface Props {
  youths: CounselorYouth[];
  messages: YouthMessage[];
  onSendMessage: (youthId: number, content: string) => void;
  selectedId: number | null;
  onSelectId: (id: number | null) => void;
}

export default function CounselorYouthSection({ youths, messages, onSendMessage, selectedId, onSelectId }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkDraft, setBulkDraft] = useState('');
  const [bulkSentCount, setBulkSentCount] = useState<number | null>(null);
  const [exportHint, setExportHint] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    return youths.filter((y) => matchesFilter(y, filter) && (!q || y.name.includes(q) || y.regionName.includes(q)));
  }, [youths, query, filter]);

  const selected = youths.find((y) => y.id === selectedId) ?? null;

  function handleExport() {
    const result = downloadCsv(filtered);
    setExportHint(result === 'ok' ? `${filtered.length}명을 CSV로 저장했어요` : '앱에서는 지원하지 않아요. 웹에서 열어주세요');
    setTimeout(() => setExportHint(null), 2500);
  }

  function handleBulkSend() {
    const content = bulkDraft.trim();
    if (!content) return;
    filtered.forEach((y) => onSendMessage(y.id, content));
    setBulkSentCount(filtered.length);
    setBulkDraft('');
    setBulkOpen(false);
    setTimeout(() => setBulkSentCount(null), 2800);
  }

  if (selected) {
    return (
      <YouthDetail
        youth={selected}
        messages={messages.filter((m) => m.youthId === selected.id)}
        onBack={() => onSelectId(null)}
        onSendMessage={(content) => onSendMessage(selected.id, content)}
      />
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>자립청년 관리</Text>
          <Text style={styles.subtitle}>청년을 선택하면 상세 정보 확인과 메시지 발송을 할 수 있어요</Text>
        </View>
        <View style={styles.toolbarRow}>
          <PressableScale style={styles.toolbarButtonOutline} onPress={handleExport}>
            <Ionicons name="download-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.toolbarButtonOutlineText}>엑셀 다운로드</Text>
          </PressableScale>
          <PressableScale style={styles.toolbarButtonFilled} onPress={() => setBulkOpen((v) => !v)}>
            <Ionicons name="megaphone-outline" size={14} color={colors.white} />
            <Text style={styles.toolbarButtonFilledText}>메시지 일괄 발송</Text>
          </PressableScale>
        </View>
      </View>

      {exportHint && (
        <View style={styles.hintBanner}>
          <Ionicons name="information-circle" size={14} color={colors.primary} />
          <Text style={styles.hintBannerText}>{exportHint}</Text>
        </View>
      )}

      {bulkOpen && (
        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.bulkTitle}>지금 필터에 걸린 {filtered.length}명에게 한 번에 보내기</Text>
          <TextInput
            style={styles.messageInput}
            value={bulkDraft}
            onChangeText={setBulkDraft}
            placeholder="모두에게 보낼 메시지를 입력하세요"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />
          <View style={styles.bulkFooter}>
            <PressableScale onPress={() => setBulkOpen(false)}>
              <Text style={styles.bulkCancel}>취소</Text>
            </PressableScale>
            <PressableScale
              style={[styles.toolbarButtonFilled, !bulkDraft.trim() && styles.toolbarButtonDisabled]}
              disabled={!bulkDraft.trim()}
              onPress={handleBulkSend}
            >
              <Ionicons name="send" size={13} color={colors.white} />
              <Text style={styles.toolbarButtonFilledText}>{filtered.length}명에게 발송</Text>
            </PressableScale>
          </View>
        </Card>
      )}

      {bulkSentCount != null && (
        <View style={styles.hintBanner}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={styles.hintBannerText}>{bulkSentCount}명에게 발송했어요</Text>
        </View>
      )}

      <View style={styles.filterRow}>
        <View style={styles.filterTabs}>
          {FILTER_TABS.map((f) => {
            const count = f.key === 'ALL' ? youths.length : youths.filter((y) => matchesFilter(y, f.key)).length;
            const active = filter === f.key;
            return (
              <PressableScale key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterTab, active && styles.filterTabActive]}>
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {f.label} {count}
                </Text>
              </PressableScale>
            );
          })}
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={14} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="청년 이름, 지역 검색"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      <View style={styles.grid}>
        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>해당하는 청년이 없어요</Text>
          </Card>
        ) : (
          filtered.map((y) => {
            const risk = RISK_LEVEL_META[y.riskLevel];
            return (
              <PressableScale key={y.id} style={styles.youthCardWrap} onPress={() => onSelectId(y.id)}>
                <Card style={styles.youthCard}>
                  <View style={styles.youthCardHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{y.name.slice(-2)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.youthName}>{y.name}</Text>
                      <Text style={styles.youthMeta}>
                        {y.age}세 · {PROTECTION_STATUS_LABEL[y.protectionStatus]}
                      </Text>
                    </View>
                    <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                      <Text style={[styles.riskBadgeText, { color: risk.color }]}>{risk.label}</Text>
                    </View>
                  </View>
                  <View style={styles.youthCardFooter}>
                    <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                    <Text style={styles.youthRegion} numberOfLines={1}>{y.regionName}</Text>
                    <Text style={styles.youthDday}>
                      {y.daysUntilSupportEnd != null ? formatDday(y.daysUntilSupportEnd) : '보호중'}
                    </Text>
                  </View>
                </Card>
              </PressableScale>
            );
          })
        )}
      </View>
    </View>
  );
}

function YouthDetail({
  youth,
  messages,
  onBack,
  onSendMessage,
}: {
  youth: CounselorYouth;
  messages: YouthMessage[];
  onBack: () => void;
  onSendMessage: (content: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [justSent, setJustSent] = useState(false);
  const risk = RISK_LEVEL_META[youth.riskLevel];

  function handleSend() {
    const content = draft.trim();
    if (!content) return;
    onSendMessage(content);
    setDraft('');
    setJustSent(true);
    setTimeout(() => setJustSent(false), 2200);
  }

  return (
    <View style={{ gap: spacing.md }}>
      <PressableScale style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
        <Text style={styles.backText}>목록으로</Text>
      </PressableScale>

      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, styles.avatarLarge]}>
            <Text style={[styles.avatarText, styles.avatarTextLarge]}>{youth.name.slice(-2)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{youth.name}</Text>
            <Text style={styles.profileMeta}>
              {youth.age}세 · {PROTECTION_STATUS_LABEL[youth.protectionStatus]} · {youth.regionName}
            </Text>
            <Text style={styles.profilePhone}>{youth.phone}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
            <Text style={[styles.riskBadgeText, { color: risk.color }]}>AI 위험도 · {risk.label}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <InfoBox
            label="자립수당 종료 D-day"
            value={youth.daysUntilSupportEnd != null ? formatDday(youth.daysUntilSupportEnd) : '보호중'}
          />
          <InfoBox label="자립정착금 지급" value={youth.settlementFundPaid ? '지급완료' : '미지급'} tone={youth.settlementFundPaid ? colors.success : colors.danger} />
          <InfoBox
            label="이번달 자립수당"
            value={youth.monthlyAllowances[youth.monthlyAllowances.length - 1]?.paid ? '지급완료' : '미지급/대상 아님'}
          />
        </View>

        {youth.monthlyAllowances.length > 0 && (
          <View style={styles.historyBox}>
            <Text style={styles.historyLabel}>최근 자립수당 지급 이력</Text>
            <View style={styles.historyRow}>
              {youth.monthlyAllowances.map((a) => (
                <View key={a.month} style={styles.historyItem}>
                  <Text style={styles.historyMonth}>{a.month}</Text>
                  <Ionicons
                    name={a.paid ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={a.paid ? colors.success : colors.danger}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.memoBox}>
          <Text style={styles.historyLabel}>담당자 메모</Text>
          <Text style={styles.memoText}>{youth.memo}</Text>
        </View>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={styles.messageTitle}>자립청년에게 메시지 보내기</Text>
        <TextInput
          style={styles.messageInput}
          value={draft}
          onChangeText={setDraft}
          placeholder={`${youth.name}님에게 보낼 메시지를 입력하세요`}
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
        />
        <View style={styles.messageFooter}>
          {justSent ? (
            <View style={styles.sentBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.sentBadgeText}>발송됐어요</Text>
            </View>
          ) : (
            <Text style={styles.messageHint}>앱 알림으로 바로 전달돼요</Text>
          )}
          <PressableScale
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
            disabled={!draft.trim()}
            onPress={handleSend}
          >
            <Ionicons name="send" size={13} color={colors.white} />
            <Text style={styles.sendButtonText}>보내기</Text>
          </PressableScale>
        </View>

        {messages.length > 0 && (
          <View style={styles.messageHistory}>
            <Text style={styles.historyLabel}>발송 이력</Text>
            {[...messages].reverse().map((m) => (
              <View key={m.id} style={styles.messageHistoryItem}>
                <Text style={styles.messageHistoryContent}>{m.content}</Text>
                <Text style={styles.messageHistoryTime}>{new Date(m.sentAt).toLocaleString('ko-KR')}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}

function InfoBox({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, tone ? { color: tone } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  toolbarRow: { flexDirection: 'row', gap: spacing.sm },
  toolbarButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
  },
  toolbarButtonOutlineText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  toolbarButtonFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
  },
  toolbarButtonFilledText: { fontSize: 12, fontWeight: '700', color: colors.white },
  toolbarButtonDisabled: { backgroundColor: colors.graySoft },
  hintBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.sm },
  hintBannerText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  bulkTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  bulkFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.md },
  bulkCancel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  filterTabs: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  filterTab: {
    borderRadius: radius.full,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  filterTabTextActive: { color: colors.white },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    width: 220,
  },
  searchInput: { flex: 1, fontSize: 12, color: colors.textPrimary, padding: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  emptyCard: { width: '100%', alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  youthCardWrap: { width: '31.5%', minWidth: 260 },
  youthCard: { gap: spacing.sm },
  youthCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLarge: { width: 54, height: 54, borderRadius: 27 },
  avatarText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  avatarTextLarge: { fontSize: 16 },
  youthName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  youthMeta: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  riskBadge: { borderRadius: radius.full, paddingVertical: 3, paddingHorizontal: spacing.sm },
  riskBadgeText: { fontSize: 11, fontWeight: '700' },
  youthCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  youthRegion: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  youthDday: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  backText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  profileCard: { gap: spacing.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileName: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  profileMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  profilePhone: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  infoGrid: { flexDirection: 'row', gap: spacing.sm },
  infoBox: { flex: 1, backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.sm, gap: 4 },
  infoLabel: { fontSize: 11, color: colors.textTertiary },
  infoValue: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  historyBox: { gap: 6 },
  historyLabel: { fontSize: 12, fontWeight: '700', color: colors.textTertiary },
  historyRow: { flexDirection: 'row', gap: spacing.md },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyMonth: { fontSize: 12, color: colors.textSecondary },
  memoBox: { gap: 4, backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.sm },
  memoText: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  messageTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 72,
    textAlignVertical: 'top',
    backgroundColor: colors.background,
  },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  messageHint: { fontSize: 11, color: colors.textTertiary },
  sentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sentBadgeText: { fontSize: 12, fontWeight: '700', color: colors.success },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  sendButtonDisabled: { backgroundColor: colors.graySoft },
  sendButtonText: { fontSize: 12, fontWeight: '700', color: colors.white },
  messageHistory: { gap: 6, marginTop: spacing.xs },
  messageHistoryItem: { backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.sm, gap: 2 },
  messageHistoryContent: { fontSize: 13, color: colors.textPrimary },
  messageHistoryTime: { fontSize: 11, color: colors.textTertiary },
});
