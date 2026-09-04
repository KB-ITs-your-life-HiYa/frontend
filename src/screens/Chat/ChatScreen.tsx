import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View , Text, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { PolicyCards, ReferralOffer } from './CareFollowUp';
import ScheduleChangeForm from './ScheduleChangeForm';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radius, spacing } from '../../constants/colors';
import { useCare } from '../../hooks/useCare';
import { careApi } from '../../services/care';
import type { CareButtonRequest, CareChoice, CareFreeTextRequest } from '../../types/care';

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' });
}

function Message({ text, time, user = false }: { text: string; time?: string; user?: boolean }) {
  return <View style={[styles.messageRow, user && styles.messageRowUser]}>
    {!user && <View style={styles.avatar}>
      <MaterialCommunityIcons name="robot" size={24} color={colors.chatAccent} />
    </View>}
    <View style={[styles.messageColumn, user && styles.messageColumnUser]}>
      {!user && <Text style={styles.botName}>자립동행 AI</Text>}
      <View style={[styles.bubble, user ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={user ? styles.textUser : styles.textBot}>{text}</Text>
      </View>
      {time && <Text style={[styles.timestamp, user && styles.timestampRight]}>{formatTime(time)}</Text>}
    </View>
  </View>;
}

export default function ChatScreen() {
  const { summary, busy, error, run, refresh } = useCare();
  const [editingSignal, setEditingSignal] = useState<number | null>(null);
  const [declined, setDeclined] = useState<number[]>([]);
  const [input, setInput] = useState('');
  const policyAttempts = useRef(new Set<number>());
  useFocusEffect(useCallback(() => {
    setDeclined([]);
    policyAttempts.current.clear();
  }, []));
  const retry = useRef<{ key: string; request: CareButtonRequest } | null>(null);
  const messageRetry = useRef<{ key: string; request: CareFreeTextRequest } | null>(null);
  const scroll = useRef<ScrollView>(null);
  const signals = summary?.signals ?? [];
  const signal = [...signals].reverse().find(item => item.status === 'OPEN');
  const options = signal && !busy && signal.replies.length === 0 && editingSignal !== signal.id ? signal.options : [];
  const editing = signal && editingSignal === signal.id && signal.status === 'OPEN';

  const offerSignal = signal?.referralEligible && (signal.recheckedAt || signal.responseResult === 'NEEDS_CARE')
    ? signal : [...signals].reverse().find(s => s.referralEligible && s.recheckedAt);

  useEffect(() => {
    if (!signal || signal.status !== 'OPEN') return;
    const latest = signal.replies[signal.replies.length - 1];
    if (latest?.inputType === 'FREE_TEXT' && latest.aiStatus === 'READY' && latest.choice === 'CHANGED') {
      setEditingSignal(signal.id);
    }
  }, [signal]);

  // 저장 직후 또는 재진입 시 미완료 정책 조회만 이어간다. 오류는 명시적인 재시도로 처리한다.
  useEffect(() => {
    if (busy || !summary) return;
    for (const conversation of summary.signals) {
      const response = conversation.replies.find(r => r.policies?.status === 'PENDING' && !policyAttempts.current.has(r.id));
      if (response) {
        policyAttempts.current.add(response.id);
        void run(() => careApi.policies(conversation.id, response.id));
        break;
      }
    }
  }, [summary, busy, run]);

  async function send(choice: CareChoice, change: Pick<CareButtonRequest, 'expectedDay' | 'expectedAmount'> = {}) {
    if (!signal || busy) return;
    if (choice === 'CHANGED' && change.expectedDay === undefined && change.expectedAmount === undefined) {
      setEditingSignal(signal.id);
      return;
    }
    const key = `${signal.id}:${choice}:${change.expectedDay ?? ''}:${change.expectedAmount ?? ''}`;
    if (retry.current?.key !== key) retry.current = {
      key, request: { choice, ...change, requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    };
    const request = retry.current.request;
    if (await run(() => careApi.respond(signal.id, request))) {
      retry.current = null;
      setEditingSignal(null);
    }
  }

  async function sendMessage() {
    const value = input.trim();
    if (!signal || busy || !value) return;
    const key = `${signal.id}:${value}`;
    if (messageRetry.current?.key !== key) messageRetry.current = {
      key, request: { input: value, requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    };
    if (await run(() => careApi.message(signal.id, messageRetry.current!.request))) {
      messageRetry.current = null;
      setInput('');
    }
  }

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScreenHeader />
    <ScrollView ref={scroll} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => {
        if (signals.length > 1 || (signal?.replies.length ?? 0) > 0) scroll.current?.scrollToEnd({ animated: true });
      }}>
      <View style={styles.todayPillWrap}><View style={styles.todayPill}><Text style={styles.todayText}>오늘</Text></View></View>
      {signal ? <>
        {signals.map(conversation => <React.Fragment key={conversation.id}>
          <Message text={conversation.prompt} time={conversation.detectedAt} />
          {conversation.replies.map(reply => <React.Fragment key={reply.id}>
            <Message text={reply.inputType === 'BUTTON' && reply.choice === 'LATER' ? '다음에 확인할게요' : reply.userText}
              time={reply.createdAt} user />
            {reply.reply && <Message text={reply.reply} time={reply.createdAt} />}
            {reply.aiStatus === 'PENDING' && <View style={styles.aiStatus}>
              <ActivityIndicator size="small" color={colors.chatAccent} />
              <Text style={styles.aiStatusText}>답변을 준비하고 있어요.</Text>
            </View>}
            {reply.aiStatus === 'ERROR' && <View style={styles.aiStatus} accessibilityRole="alert">
              <Text style={styles.errorText}>답변을 불러오지 못했어요.</Text>
              <Pressable accessibilityRole="button" disabled={busy}
                onPress={() => { void run(() => careApi.retryGemini(conversation.id, reply.id)); }}>
                <Text style={styles.quickReplyText}>다시 답변받기</Text>
              </Pressable>
            </View>}
            {reply.policies && <PolicyCards policies={reply.policies} busy={busy}
              retry={() => { void run(() => careApi.policies(conversation.id, reply.id)); }} /> }
          </React.Fragment>)}
          {conversation.referral && <Message text="담당자 연결 요청이 접수되었어요. 아직 담당자 배정 전이에요."
            time={conversation.referral.requestedAt} />}
          {offerSignal?.id === conversation.id && !conversation.referral && !declined.includes(conversation.id)
            && !conversation.replies.some(r => r.policies?.status === 'PENDING') && <ReferralOffer
              signal={conversation} busy={busy}
              accept={() => { void run(() => careApi.refer(conversation.id)); }}
              decline={() => setDeclined(ids => [...ids, conversation.id])} />}
        </React.Fragment>)}
        {editing && <>
          <Message text={signal.options.find(option => option.value === 'CHANGED')?.label ?? '계획이 바뀌었어요'} user />
          <Message text="어떤 계획으로 변경해 드릴까요? 설정하신 내용은 다음 달부터 바로 반영돼요." />
          <ScheduleChangeForm key={signal.id} signal={signal} busy={busy}
            save={change => { void send('CHANGED', change); }} />
        </>}
        {options.length > 0 && <View style={styles.quickReplyCol}>
          {options.map(option => <Pressable key={option.value} accessibilityRole="button"
            disabled={busy} accessibilityState={{ disabled: busy }}
            style={[styles.quickReplyRow, busy && styles.disabled]} onPress={() => { void send(option.value); }}>
            <Text style={styles.quickReplyText}>{option.value === 'LATER' ? '다음에 확인할게요' : option.label}</Text>
          </Pressable>)}
        </View>}
      </> : summary && <Message text={summary.reminders[0]?.message ?? '아직 상담이 필요한 이상징후가 없어요.'} />}
      {busy && !summary && <ActivityIndicator color={colors.chatAccent} accessibilityLabel="상담 불러오는 중" />}
      {error && <View style={styles.errorWrap} accessibilityRole="alert">
        <Text style={styles.errorText}>{error}</Text>
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void refresh(); }}>
          <Text style={styles.quickReplyText}>다시 확인하기</Text>
        </Pressable>
      </View>}
    </ScrollView>
    <View style={styles.inputRow}>
      <View style={styles.inputCapsule}>
        <TextInput style={styles.input} placeholder="궁금한 점을 물어보세요" placeholderTextColor={colors.textTertiary}
          value={input} onChangeText={setInput} maxLength={1000} editable={Boolean(signal) && !busy}
          returnKeyType="send" onSubmitEditing={() => { void sendMessage(); }}
          accessibilityLabel="궁금한 점을 물어보세요" />
        <Pressable accessibilityRole="button" accessibilityLabel="메시지 전송"
          accessibilityState={{ disabled: !signal || busy || !input.trim() }}
          disabled={!signal || busy || !input.trim()} onPress={() => { void sendMessage(); }}
          style={[styles.sendButton, (!signal || busy || !input.trim()) && styles.disabled]}>
          <Ionicons name="send" size={20} color={colors.white} />
        </Pressable>
      </View>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.chatBackground },
  list: { paddingHorizontal: spacing.md + spacing.xs, paddingTop: spacing.lg, paddingBottom: spacing.lg, flexGrow: 1 },
  todayPillWrap: { alignItems: 'center', marginBottom: spacing.xl + spacing.sm + spacing.xs },
  todayPill: { backgroundColor: colors.track, paddingHorizontal: spacing.md - 2, paddingVertical: spacing.xs, borderRadius: radius.full },
  todayText: { color: colors.textTertiary, fontSize: 14, lineHeight: 20 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, gap: spacing.md },
  messageRowUser: { justifyContent: 'flex-end' },
  avatar: { width: 42, height: 42, borderRadius: radius.full, backgroundColor: colors.chatAvatar,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primaryLight },
  messageColumn: { flex: 1, alignItems: 'flex-start' },
  messageColumnUser: { alignItems: 'flex-end' },
  botName: { fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginLeft: spacing.xs, marginBottom: spacing.xs },
  bubble: { padding: spacing.md, borderRadius: radius.lg },
  bubbleBot: { maxWidth: '86%', backgroundColor: colors.white, borderTopLeftRadius: 2, borderWidth: 1,
    borderColor: colors.border, shadowColor: colors.chatShadow, shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  bubbleUser: { maxWidth: '82%', backgroundColor: colors.chatAccent, borderTopRightRadius: spacing.xs },
  textBot: { fontSize: 18, lineHeight: 28, color: colors.textPrimary },
  textUser: { fontSize: 18, lineHeight: 28, color: colors.white },
  timestamp: { fontSize: 12, lineHeight: 18, color: colors.textTertiary, marginTop: spacing.sm, marginLeft: spacing.xs },
  timestampRight: { textAlign: 'right', marginRight: spacing.xs },
  quickReplyCol: { gap: spacing.sm, marginTop: spacing.md, marginLeft: spacing.xl + spacing.md + spacing.xs },
  quickReplyRow: { backgroundColor: colors.background, borderRadius: radius.sm,
    paddingHorizontal: spacing.md + spacing.xs, paddingVertical: spacing.sm },
  quickReplyText: { color: colors.chatAccent, fontSize: 16, lineHeight: 22 },
  disabled: { opacity: 0.55 },
  inputRow: { paddingHorizontal: spacing.md + spacing.xs, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.chatBackground },
  inputCapsule: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.chatInputBorder, backgroundColor: colors.white, padding: spacing.xs, minHeight: 56 },
  input: { flex: 1, minWidth: 0, paddingLeft: spacing.lg, paddingRight: spacing.sm, paddingVertical: spacing.sm,
    fontSize: 18, color: colors.textPrimary },
  sendButton: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.chatAccent,
    alignItems: 'center', justifyContent: 'center' },
  errorWrap: { marginTop: spacing.md, marginLeft: spacing.xl + spacing.md + spacing.xs, gap: spacing.sm },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 20 },
  aiStatus: { marginLeft: spacing.xl + spacing.md + spacing.xs, marginBottom: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiStatusText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
});
