import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View , Text } from 'react-native';
import { colors, radius, spacing } from '../../constants/colors';
import type { CarePolicies, CareSignal } from '../../types/care';

export function PolicyCards({ policies, busy, retry }: {
  policies: CarePolicies; busy: boolean; retry: () => void;
}) {
  const [linkError, setLinkError] = useState(false);
  async function open(url: string) {
    setLinkError(false);
    try {
      if (!/^https:\/\/www\.youthcenter\.go\.kr\//.test(url)) throw new Error('Invalid policy link');
      await Linking.openURL(url);
    } catch { setLinkError(true); }
  }
  return <View style={styles.followUp}>
    {policies.status === 'PENDING' && <>
      {busy && <ActivityIndicator color={colors.chatAccent} />}
      <Text style={styles.caption}>관련 정책을 확인하고 있어요.</Text>
      {!busy && <Pressable accessibilityRole="button" onPress={retry}><Text style={styles.action}>정책 확인하기</Text></Pressable>}
    </>}
    {policies.cards.map(card => <View key={card.id} style={styles.card}>
      <Text style={styles.caption}>{card.category === 'FINANCE' ? '생활비·금융지원' : '취업·일경험'} · 온통청년</Text>
      <Text style={styles.title}>{card.name}</Text>
      <Text style={styles.body} numberOfLines={4}>{card.support}</Text>
      {!!card.organization && <Text style={styles.caption}>{card.organization}</Text>}
      <Text style={styles.caption}>신청 기간: {card.applicationPeriod}</Text>
      <Pressable accessibilityRole="link" onPress={() => { void open(card.detailUrl); }}>
        <Text style={styles.action}>정책 상세 보기</Text>
      </Pressable>
    </View>)}
    {policies.status === 'READY' && <Text style={styles.caption}>거주지역 등 신청 조건과 모집 여부는 정책 상세에서 확인해 주세요.</Text>}
    {(policies.status === 'ERROR' || policies.status === 'EMPTY') && <>
      <Text style={styles.body}>{policies.status === 'ERROR' ? '정책 정보를 불러오지 못했어요. 상담 내용은 저장되어 있어요.' : '현재 안내할 수 있는 관련 정책이 없어요.'}</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={retry}>
        <Text style={styles.action}>{busy ? '확인 중…' : '정책 다시 확인하기'}</Text>
      </Pressable>
    </>}
    {linkError && <Text style={styles.error} accessibilityRole="alert">정책 링크를 열지 못했어요. 다시 눌러 주세요.</Text>}
  </View>;
}

export function ReferralOffer({ signal, busy, accept, decline }: {
  signal: CareSignal; busy: boolean; accept: () => void; decline: () => void;
}) {
  return <View style={styles.followUp}>
    <View style={styles.card}>
      <Text style={styles.body}>{signal.recheckedAt
        ? '다시 확인했지만 아직 거래가 확인되지 않았어요. 담당자에게 연결을 요청할까요?'
        : '어려움이 이어지고 있어요. 담당자에게 연결을 요청할까요?'}</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={accept}>
        <Text style={styles.action}>{busy ? '처리 중…' : '연결 요청하기'}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={busy} onPress={decline}>
        <Text style={styles.action}>지금은 괜찮아요</Text>
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  followUp: { marginLeft: spacing.xl + spacing.md + spacing.xs, marginBottom: spacing.md, gap: spacing.sm },
  card: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: 17, lineHeight: 25, fontWeight: '600' },
  body: { color: colors.textPrimary, fontSize: 16, lineHeight: 24 },
  caption: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  action: { color: colors.chatAccent, fontSize: 16, lineHeight: 24, paddingVertical: spacing.xs },
  error: { color: colors.danger, fontSize: 13, lineHeight: 20 },
});
