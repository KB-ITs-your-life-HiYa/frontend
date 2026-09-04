import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View , Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../navigation/RootNavigator';
import { useCare } from '../../hooks/useCare';
import { colors, spacing } from '../../constants/colors';
import type { CareSignal } from '../../types/care';

function recheckMessage(signal: CareSignal) {
  switch (signal.type) {
    case 'MISSED_SAVING':
      return '적금 납입일로부터 일주일이 지났지만 아직 입금되지 않았어요. 혹시 확인이나 도움이 필요하신가요?';
    case 'MISSED_PAYMENT':
      return '납부 예정일로부터 일주일이 지났지만 아직 납부되지 않았어요. 혹시 확인이나 도움이 필요하신가요?';
    case 'INCOME_MISSING':
      return '입금 예정일로부터 일주일이 지났지만 아직 입금되지 않았어요. 혹시 확인이나 도움이 필요하신가요?';
  }
}

export default function CareBanner() {
  const { summary, error, busy } = useCare();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const focused = useIsFocused();
  const [dismissed, setDismissed] = useState<string>();
  const signal = useMemo(() => {
    const open = summary?.signals.filter(item => item.status === 'OPEN') ?? [];
    return open.filter(item => item.recheckedAt !== null).at(-1) ?? open.at(-1);
  }, [summary]);
  const reminder = summary?.reminders[0];
  const key = signal ? `signal-${signal.id}-${signal.recheckedAt ?? signal.detectedAt}` : reminder ? `reminder-${summary?.asOf}-${reminder.cycleId}` : undefined;
  const message = signal?.recheckedAt ? recheckMessage(signal) : signal?.prompt ?? reminder?.message;
  const close = () => setDismissed(key);
  const openChat = () => { close(); navigation.navigate('Chat', signal ? { signalId: signal.id } : undefined); };

  return <Modal animationType="fade" transparent visible={Boolean(focused && !busy && !error && message && key !== dismissed)} onRequestClose={close}>
    <View style={styles.backdrop}>
      <View accessibilityViewIsModal style={styles.popup}>
        <View style={styles.content}>
          <View style={styles.avatar}><Ionicons name="chatbox-ellipses" size={31} color={colors.white} /></View>
          <View style={styles.copy}>
            <View style={styles.heading}><Text style={styles.title}>자립동행 AI</Text><Text style={styles.time}>방금 전</Text></View>
            <Text style={styles.message}>{message}</Text>
          </View>
          <Pressable accessibilityLabel="알림 닫기" hitSlop={12} style={styles.close} onPress={close}><Ionicons name="close" size={22} color={colors.textTertiary} /></Pressable>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={close}><Text style={styles.later}>나중에 하기</Text></Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.action} onPress={openChat}><Text style={styles.confirm}>지금 확인하기</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, paddingHorizontal: spacing.md, paddingTop: 44, backgroundColor: colors.notificationBackdrop },
  popup: { alignSelf: 'center', width: '100%', maxWidth: 520, overflow: 'hidden', borderRadius: 32, backgroundColor: colors.white },
  content: { minHeight: 130, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 22, paddingTop: 25, paddingBottom: spacing.md, gap: spacing.md },
  avatar: { width: 66, height: 66, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.chatAvatar },
  copy: { flex: 1, paddingTop: 3 }, heading: { flexDirection: 'row', alignItems: 'center', paddingRight: 20, marginBottom: 5 },
  title: { flex: 1, color: colors.textPrimary, fontSize: 18, fontWeight: '700' }, time: { color: colors.textTertiary, fontSize: 12 },
  message: { color: colors.textPrimary, fontSize: 17, lineHeight: 25 }, close: { position: 'absolute', top: 20, right: 18 },
  actions: { height: 58, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, action: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border }, later: { color: colors.textTertiary, fontSize: 16 }, confirm: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
