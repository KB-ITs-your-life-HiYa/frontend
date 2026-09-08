import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View , Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useCare } from '../../hooks/useCare';
import { colors, spacing } from '../../constants/colors';
import type { CareSignal, CareSummary } from '../../types/care';
import AiAvatar from '../../components/AiAvatar';

function recheckMessage(signal: CareSignal) {
  switch (signal.type) {
    case 'MISSED_PAYMENT':
      return '공과금 납부 예정일로부터 일주일이 지났지만 아직 납부 내역이 확인되지 않았어요. 많이 걱정되실 것 같아 다시 확인해요.';
    case 'INCOME_MISSING':
      return '소득 입금 예정일로부터 일주일이 지났지만 아직 입금 내역이 확인되지 않았어요. 혹시 상황에 변화가 있으신가요?';
    default:
      return '적금 납입일로부터 일주일이 지났지만 아직 납입 내역이 확인되지 않았어요. 혹시 확인이나 도움이 필요하신가요?';
  }
}

type CareBannerProps = {
  summary?: CareSummary | null;
  busy?: boolean;
  error?: string | null;
};

export default function CareBanner(props: CareBannerProps = {}) {
  const ownCare = useCare();
  const summary = props.summary !== undefined ? props.summary : ownCare.summary;
  const error = props.error !== undefined ? props.error : ownCare.error;
  const busy = props.busy !== undefined ? props.busy : ownCare.busy;
  const focused = useIsFocused();
  const [dismissed, setDismissed] = useState<string>();
  const signal = summary?.signals.filter(item => item.status === 'OPEN' && item.recheckedAt !== null).at(-1);
  const reminder = summary?.reminders[0];
  const key = signal ? `signal-${signal.id}-${signal.recheckedAt}`
    : reminder ? `reminder-${summary?.asOf}-${reminder.cycleId}` : undefined;
  const message = signal ? recheckMessage(signal) : reminder?.message;
  const close = () => setDismissed(key);

  // statusBarTranslucent: 안드로이드에서 이 Modal이 떠 있는 동안 하단 탭 바의 세이프 에어리어
  // 계산이 잠깐 흐트러져 배경이 두 겹으로 보이는 문제가 있었다. Modal이 상태 바 영역까지
  // 자기 창을 확장하지 않고 기존 창 레이아웃 위에 그대로 그려지게 해서, 다른 화면 요소의
  // 세이프 에어리어 측정에 영향을 주지 않도록 했다.
  return <Modal animationType="fade" transparent statusBarTranslucent visible={Boolean(focused && !busy && !error && message && key !== dismissed)} onRequestClose={close}>
    <View style={styles.backdrop}>
      <View accessibilityViewIsModal style={styles.popup}>
        <View style={styles.content}>
          <AiAvatar variant="popup" />
          <View style={styles.copy}>
            <View style={styles.heading}><Text style={styles.title}>자립동행 AI</Text><Text style={styles.time}>방금 전</Text></View>
            <Text accessibilityLabel={message} style={styles.message}>{message}</Text>
          </View>
          <Pressable accessibilityLabel="알림 닫기" hitSlop={12} style={styles.close} onPress={close}><Ionicons name="close" size={22} color={colors.textTertiary} /></Pressable>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={close}><Text style={styles.confirm}>확인</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, paddingHorizontal: spacing.md, paddingTop: 44, backgroundColor: colors.notificationBackdrop },
  popup: { alignSelf: 'center', width: '100%', maxWidth: 520, overflow: 'hidden', borderRadius: 32, backgroundColor: colors.white },
  content: { minHeight: 130, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 22, paddingTop: 25, paddingBottom: spacing.md, gap: spacing.md },
  copy: { flex: 1, paddingTop: 3 }, heading: { flexDirection: 'row', alignItems: 'center', paddingRight: 20, marginBottom: 5 },
  title: { flex: 1, color: colors.textPrimary, fontSize: 18, fontWeight: '700' }, time: { color: colors.textTertiary, fontSize: 12 },
  message: { color: colors.textPrimary, fontSize: 17, lineHeight: 25 }, close: { position: 'absolute', top: 20, right: 18 },
  actions: { height: 58, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, action: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  confirm: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
