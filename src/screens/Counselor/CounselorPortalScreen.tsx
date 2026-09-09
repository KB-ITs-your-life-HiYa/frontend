import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from '../../components/PressableScale';
import { colors, radius, spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import {
  COUNSELOR_DISPLAY_NAME,
  findConnectedYouthDemo,
  mockCareSignals,
  mockYouths,
} from '../../data/counselorMockData';
import { counselorApi } from '../../services/counselor';
import type {
  CareRequestStatus,
  CareSignalRequest,
  CounselorReferralApiResponse,
  CounselorYouth,
  CounselorYouthApiResponse,
  YouthMessage,
} from '../../types/counselor';
import CounselorCareSection from './CounselorCareSection';
import CounselorDashboardSection from './CounselorDashboardSection';
import CounselorYouthSection from './CounselorYouthSection';

// 상담사(담당자) 포털. PC 웹으로 접속해서 쓰는 화면이라, 청년용 앱과 달리 하단 탭 대신
// 왼쪽에 고정된 사이드바 + 오른쪽 콘텐츠 영역으로 구성했다(전형적인 관리자 대시보드 레이아웃).
// 담당 청년과 케어 요청은 API에서 받고, 화면 밀도를 위한 나머지 청년은 목 데이터로 채운다.
// 상태 변경과 메시지 발송은 아직 로컬 상태다.

type Section = 'dashboard' | 'care' | 'youths';

const NAV_ITEMS: { key: Section; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'dashboard', label: 'D-Day 생활비 관리', description: '자립수당·정착금 지급 현황', icon: 'speedometer-outline' },
  { key: 'care', label: '온라인 케어 시스템', description: '이상징후 스택 관리', icon: 'pulse-outline' },
  { key: 'youths', label: '자립청년 관리', description: '개별 관리 · 메시지 보내기', icon: 'people-outline' },
];

function toYouth(youth: CounselorYouthApiResponse): CounselorYouth {
  const demo = findConnectedYouthDemo(youth.id);
  return {
    id: youth.id,
    name: youth.name,
    phone: youth.phone,
    age: youth.age,
    gender: youth.gender,
    regionName: youth.regionName,
    protectionStatus: youth.protectionStatus,
    protectionEndDate: youth.protectionEndDate,
    daysUntilSupportEnd: youth.daysUntilSupportEnd,
    settlementFundPaid: demo?.settlementFundPaid ?? false,
    settlementFundPaidAt: demo?.settlementFundPaidAt ?? null,
    settlementFundAmount: demo?.settlementFundAmount ?? 0,
    monthlyAllowances: demo?.monthlyAllowances ?? [],
    riskLevel: demo?.riskLevel ?? 'NORMAL',
    memo: demo?.memo ?? '',
  };
}

function toCareSignal(referral: CounselorReferralApiResponse): CareSignalRequest {
  return {
    id: referral.id,
    youthId: referral.youthId,
    requesterName: referral.youthName,
    phone: referral.phone,
    age: referral.age,
    regionName: referral.regionName,
    protectionStatus: referral.protectionStatus,
    status: referral.status,
    aiRiskLevel: referral.riskLevel,
    reason: referral.situation,
    situation: referral.situation,
    latestUserMessage: referral.latestUserMessage,
    requestedAt: referral.requestedAt,
    contactedAt: referral.contactedAt,
    closedAt: referral.closedAt,
    source: 'API',
  };
}

export default function CounselorPortalScreen() {
  const { member, logout } = useAuth();
  const [section, setSection] = useState<Section>('dashboard');
  const [assignedYouths, setAssignedYouths] = useState<CounselorYouth[]>([]);
  const [connectedSignals, setConnectedSignals] = useState<CareSignalRequest[]>([]);
  const [mockSignals, setMockSignals] = useState<CareSignalRequest[]>(mockCareSignals);
  const [messages, setMessages] = useState<YouthMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // 대시보드 표의 "상세보기"를 누르면 자립청년 관리 탭의 이 청년 상세로 바로 넘어가야 해서,
  // 선택 상태를 청년 섹션 안이 아니라 여기(포털)에서 들고 있는다.
  const [selectedYouthId, setSelectedYouthId] = useState<number | null>(null);

  const loadConnectedData = useCallback(async () => {
    try {
      const [youths, referrals] = await Promise.all([
        counselorApi.youths(),
        counselorApi.referrals(),
      ]);
      setAssignedYouths(youths.map(toYouth));
      setConnectedSignals(referrals.map(toCareSignal));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '상담사 데이터를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadConnectedData();
      const timer = setInterval(() => void loadConnectedData(), 5000);
      return () => clearInterval(timer);
    }, [loadConnectedData])
  );

  const riskByYouth = new Map<number, CareSignalRequest['aiRiskLevel']>();
  connectedSignals.forEach((signal) => {
    if (!riskByYouth.has(signal.youthId)) riskByYouth.set(signal.youthId, signal.aiRiskLevel);
  });
  const youths = [
    ...assignedYouths.map((youth) => ({
      ...youth,
      riskLevel: riskByYouth.get(youth.id) ?? youth.riskLevel,
    })),
    ...mockYouths,
  ];
  const careSignals = [...connectedSignals, ...mockSignals];

  const requestedCount = careSignals.filter((c) => c.status === 'REQUESTED').length;

  function updateCareStatus(id: number, status: CareRequestStatus) {
    const now = new Date().toISOString();
    setMockSignals((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          status,
          contactedAt: status === 'CONTACTED' ? now : c.contactedAt,
          closedAt: status === 'CLOSED' ? now : c.closedAt,
        };
      })
    );
  }

  function sendMessage(youthId: number, content: string) {
    setMessages((prev) => [...prev, { id: Date.now(), youthId, content, sentAt: new Date().toISOString() }]);
  }

  function viewYouthDetail(youthId: number) {
    setSelectedYouthId(youthId);
    setSection('youths');
  }

  return (
    <View style={styles.screen}>
      <View style={styles.sidebar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="shield-checkmark" size={18} color={colors.white} />
          </View>
          <Text style={styles.brandText}>자립동행{'\n'}상담사 포털</Text>
        </View>

        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const active = section === item.key;
            return (
              <PressableScale
                key={item.key}
                onPress={() => setSection(item.key)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <Ionicons name={item.icon} size={18} color={active ? colors.primary : colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                  <Text style={styles.navDesc}>{item.description}</Text>
                </View>
                {item.key === 'care' && requestedCount > 0 ? (
                  <View style={styles.navBadge}>
                    <Text style={styles.navBadgeText}>{requestedCount}</Text>
                  </View>
                ) : null}
              </PressableScale>
            );
          })}
        </View>

        <View style={styles.sidebarFooter}>
          <View style={styles.counselorAvatar}>
            <Text style={styles.counselorAvatarText}>{COUNSELOR_DISPLAY_NAME.slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.counselorName}>{COUNSELOR_DISPLAY_NAME}</Text>
            <Text style={styles.counselorEmail} numberOfLines={1}>{member?.email}</Text>
          </View>
          <PressableScale onPress={() => logout()} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={16} color={colors.textSecondary} />
          </PressableScale>
        </View>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        <View style={styles.mainInner}>
          {loading && assignedYouths.length === 0 ? (
            <View style={styles.loadNotice}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadNoticeText}>담당 청년 정보를 불러오고 있어요</Text>
            </View>
          ) : null}
          {loadError ? (
            <View style={styles.errorNotice}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorNoticeText}>{loadError}</Text>
              <PressableScale onPress={() => void loadConnectedData()} style={styles.retryButton}>
                <Text style={styles.retryText}>다시 불러오기</Text>
              </PressableScale>
            </View>
          ) : null}
          {section === 'dashboard' && <CounselorDashboardSection youths={youths} onViewYouth={viewYouthDetail} />}
          {section === 'care' && <CounselorCareSection signals={careSignals} onUpdateStatus={updateCareStatus} />}
          {section === 'youths' && (
            <CounselorYouthSection
              youths={youths}
              messages={messages}
              onSendMessage={sendMessage}
              selectedId={selectedYouthId}
              onSelectId={setSelectedYouthId}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  sidebar: {
    width: 248,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs, marginBottom: spacing.lg },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, lineHeight: 17 },
  navList: { gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  navItemActive: { backgroundColor: colors.primaryLight },
  navLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  navLabelActive: { color: colors.primary },
  navDesc: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  navBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgeText: { fontSize: 11, fontWeight: '800', color: colors.white },
  sidebarFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  counselorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counselorAvatarText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  counselorName: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  counselorEmail: { fontSize: 10, color: colors.textTertiary },
  logoutButton: { padding: 4 },
  main: { flex: 1 },
  mainContent: { padding: spacing.lg },
  mainInner: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  loadNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  loadNoticeText: { fontSize: 12, color: colors.textSecondary },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
  },
  errorNoticeText: { flex: 1, fontSize: 12, color: colors.danger },
  retryButton: {
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
  },
  retryText: { fontSize: 11, fontWeight: '700', color: colors.danger },
});
