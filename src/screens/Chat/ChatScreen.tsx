import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View , Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { PolicyCards, ReferralOffer, SupportOffer } from './CareFollowUp';
import ScheduleChangeForm from './ScheduleChangeForm';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radius, spacing } from '../../constants/colors';
import { useCare } from '../../hooks/useCare';
import { careApi } from '../../services/care';
import { api } from '../../services/api';
import { formatWon, formatWonShort } from '../../utils/money';
import type {
  CareButtonRequest, CareChoice, CareFreeTextRequest, FaqAskResponse, FaqSource,
} from '../../types/care';
import type { BudgetChatAskResponse, BudgetChatSummaryResponse } from '../../types';
import TypingIndicator from './TypingIndicator';
import { formatConversationText } from '../../utils/conversationText';
import AiAvatar from '../../components/AiAvatar';
import CareBanner from '../Home/CareBanner';

const MINIMUM_AI_LOADING_MS = 1200;
const REFERRAL_REVEAL_DELAY_MS = 2000;

function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString('ko-KR', {
    hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul',
  });
}

function demoTimestamp(referenceDate?: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const hour = parts.find(part => part.type === 'hour')?.value ?? '00';
  const minute = parts.find(part => part.type === 'minute')?.value ?? '00';
  const date = referenceDate?.slice(0, 10)
    ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
  return `${date}T${hour}:${minute}:00+09:00`;
}

function chatDayLabel(date: string | undefined, referenceDate: string | undefined) {
  const target = date?.slice(0, 10);
  const reference = referenceDate?.slice(0, 10) ?? target;
  if (!target || target === reference) return '오늘';
  const [, month, day] = target.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}

function DaySeparator({ date, referenceDate }: { date?: string; referenceDate?: string }) {
  return <View style={styles.todayPillWrap}>
    <View style={styles.todayPill}>
      <Text style={styles.todayText}>{chatDayLabel(date, referenceDate)}</Text>
    </View>
  </View>;
}

function MessageDateSeparator({ date, referenceDate, previousDate }: {
  date?: string; referenceDate?: string; previousDate?: string;
}) {
  if (!date || date.slice(0, 10) === previousDate?.slice(0, 10)) return null;
  return <DaySeparator date={date} referenceDate={referenceDate} />;
}

function supportQuestion(type: 'MISSED_SAVING' | 'MISSED_PAYMENT' | 'INCOME_MISSING') {
  return type === 'INCOME_MISSING'
    ? '조금 더 안정적으로 일할 수 있는 일자리를 추천해드릴까요?'
    : '현재 상황에 맞는 생활비·금융지원을 찾아봐드릴까요?';
}

// "2026-09" -> "9월"
function budgetMonthLabel(month: string) {
  const [, monthPart] = month.split('-');
  return `${Number(monthPart)}월`;
}

function Message({ text, time, user = false }: { text: string; time?: string; user?: boolean }) {
  return <View style={[styles.messageRow, user && styles.messageRowUser]}>
    {!user && <AiAvatar variant="message" />}
    <View style={[styles.messageColumn, user && styles.messageColumnUser]}>
      {!user && <Text style={styles.botName}>자립동행 AI</Text>}
      <View style={[styles.bubble, user ? styles.bubbleUser : styles.bubbleBot]}>
        <Text accessibilityLabel={text} style={user ? styles.textUser : styles.textBot}>
          {formatConversationText(text)}
        </Text>
      </View>
      {time && <Text style={[styles.timestamp, user && styles.timestampRight]}>{formatMessageTime(time)}</Text>}
    </View>
  </View>;
}

function QuickReplyButton({ label, disabled, onPress }: {
  label: string; disabled: boolean; onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return <Pressable accessibilityRole="button" disabled={disabled}
    accessibilityState={{ disabled }} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
    style={({ pressed }) => [styles.quickReplyRow, (hovered || pressed) && styles.quickReplyRowActive,
      disabled && styles.disabled]} onPress={onPress}>
    {({ pressed }) => <Text style={[styles.quickReplyText,
      (hovered || pressed) && styles.quickReplyTextActive]}>{label}</Text>}
  </Pressable>;
}

// 지원금/독립지원/서비스 자유질문 답변에 붙는 근거 문서 표시. 눌러도 되는 버튼이 아니라 출처 라벨이다.
function FaqSources({ sources }: { sources: FaqSource[] }) {
  if (sources.length === 0) return null;
  return <View style={styles.faqSourceRow}>
    <Ionicons name="document-text-outline" size={13} color={colors.textTertiary} />
    <Text style={styles.faqSourceText} numberOfLines={2}>
      출처: {sources.map(source => source.title).join(', ')}
    </Text>
  </View>;
}

// 생활비 관리 탭의 첫 화면 요약 카드. 목업의 "9월 생활비 한눈에"와 같은 자리.
function BudgetSummaryCard({ summary }: { summary: BudgetChatSummaryResponse }) {
  const ratio = Math.min(100, Math.max(0, summary.progressRatio ?? 0));
  const over = summary.remaining !== null && summary.remaining < 0;
  return <View style={styles.budgetCard}>
    <Text style={styles.budgetCardTitle}>{budgetMonthLabel(summary.month)} 생활비 한눈에</Text>
    {summary.totalBudget !== null && <View style={styles.budgetProgressTrack}>
      <View style={[styles.budgetProgressFill, { width: `${ratio}%` }, over && styles.budgetProgressFillOver]} />
    </View>}
    <View style={styles.budgetStatRow}>
      <View style={styles.budgetStatBox}>
        <Text style={styles.budgetStatLabel}>이번 달 지출</Text>
        <Text style={styles.budgetStatValue}>{formatWon(summary.totalExpense)}</Text>
      </View>
      <View style={styles.budgetStatBox}>
        <Text style={styles.budgetStatLabel}>{over ? '예산 초과' : '남은 여유'}</Text>
        <Text style={[styles.budgetStatValue, over && styles.budgetStatValueOver]}>
          {summary.remaining === null ? '예산 미설정' : `약 ${formatWonShort(summary.remaining)}`}
        </Text>
      </View>
    </View>
  </View>;
}

interface FaqEntry { question: string; createdAt: string; answer?: string; answeredAt?: string; sources?: FaqSource[]; error?: boolean; }
interface BudgetChatEntry { question: string; createdAt: string; answer?: string; answeredAt?: string; error?: boolean; }
type ChatTab = 'basic' | 'budget' | 'care';

export default function ChatScreen() {
  const { summary, busy, error, run, refresh } = useCare();
  const [editingSignal, setEditingSignal] = useState<number | null>(null);
  const [declined, setDeclined] = useState<number[]>([]);
  const [input, setInput] = useState('');
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const [localTyping, setLocalTyping] = useState(false);
  const [awaitingAi, setAwaitingAi] = useState(false);
  // "기본 채팅" 탭: 지원금/독립지원/서비스 이용 자유질문. 신호 대화(summary.signals)와 달리
  // 서버에 저장되지 않는 화면 안 로컬 상태다.
  const [faqThread, setFaqThread] = useState<FaqEntry[]>([]);
  const [faqBusy, setFaqBusy] = useState(false);
  // "생활비 관리" 탭: 이번 달 지출/예산 요약 카드 + 그 데이터를 근거로 한 자유질문.
  const [budgetSummary, setBudgetSummary] = useState<BudgetChatSummaryResponse | null>(null);
  const [budgetSummaryLoading, setBudgetSummaryLoading] = useState(false);
  const [budgetSummaryError, setBudgetSummaryError] = useState(false);
  const [budgetThread, setBudgetThread] = useState<BudgetChatEntry[]>([]);
  const [budgetBusy, setBudgetBusy] = useState(false);
  const [chatSessionStartedAt, setChatSessionStartedAt] = useState(() => new Date().toISOString());
  // 사용자가 직접 고른 탭. null 이면 신호 유무로 자동 결정한다 (신호가 있으면 스마트 케어, 없으면 기본 채팅).
  const [manualTab, setManualTab] = useState<ChatTab | null>(null);
  const [referralLoadingId, setReferralLoadingId] = useState<number | null>(null);
  const [revealedReferralIds, setRevealedReferralIds] = useState<number[]>([]);
  const [supportChoices, setSupportChoices] = useState<Record<number, 'YES' | 'NO'>>({});
  const localTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const referralTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useFocusEffect(useCallback(() => {
    setDeclined([]);
    setPendingUserText(null);
    setLocalTyping(false);
    setAwaitingAi(false);
    setReferralLoadingId(null);
    setRevealedReferralIds([]);
    setSupportChoices({});
    setFaqThread([]);
    setFaqBusy(false);
    setBudgetSummary(null);
    setBudgetSummaryLoading(false);
    setBudgetSummaryError(false);
    setBudgetThread([]);
    setBudgetBusy(false);
    setChatSessionStartedAt(new Date().toISOString());
    setManualTab(null);
    return () => {
      if (localTypingTimer.current) clearTimeout(localTypingTimer.current);
      if (referralTimer.current) clearTimeout(referralTimer.current);
      localTypingTimer.current = null;
      referralTimer.current = null;
    };
  }, []));
  const retry = useRef<{ key: string; request: CareButtonRequest } | null>(null);
  const messageRetry = useRef<{ key: string; request: CareFreeTextRequest } | null>(null);
  const scroll = useRef<ScrollView>(null);
  const signals = summary?.signals ?? [];
  const signal = [...signals].reverse().find(item => item.status === 'OPEN');
  const openSignalCount = signals.filter(item => item.status === 'OPEN').length;
  const activeTab: ChatTab = manualTab === 'care' && !signal
    ? 'basic'
    : manualTab ?? (signal ? 'care' : 'basic');
  const options = signal && !busy && signal.replies.length === 0 && editingSignal !== signal.id ? signal.options : [];
  const editing = signal && editingSignal === signal.id && signal.status === 'OPEN';
  const interactionBusy = busy || localTyping || awaitingAi || pendingUserText !== null;

  useEffect(() => {
    if (!signal && manualTab === 'care') setManualTab(null);
  }, [manualTab, signal]);

  useEffect(() => {
    if (summary?.asOf && faqThread.length === 0 && budgetThread.length === 0) {
      setChatSessionStartedAt(demoTimestamp(summary.asOf));
    }
  }, [budgetThread.length, faqThread.length, summary?.asOf]);

  const offerSignal = signal?.referralEligible && (signal.recheckedAt || signal.responseResult === 'NEEDS_CARE')
    ? signal : [...signals].reverse().find(s => s.referralEligible && s.recheckedAt);

  useEffect(() => {
    if (referralLoadingId !== null) {
      const stillEligible = offerSignal?.id === referralLoadingId && !offerSignal.referral
        && !declined.includes(referralLoadingId);
      if (!stillEligible) {
        if (referralTimer.current) clearTimeout(referralTimer.current);
        referralTimer.current = null;
        setReferralLoadingId(null);
      }
      return;
    }

    if (!offerSignal || offerSignal.referral || declined.includes(offerSignal.id)
      || revealedReferralIds.includes(offerSignal.id)
      || busy || offerSignal.replies.some(reply => reply.policies?.status === 'PENDING')) return;

    setReferralLoadingId(offerSignal.id);
    referralTimer.current = setTimeout(() => {
      setRevealedReferralIds(ids => ids.includes(offerSignal.id) ? ids : [...ids, offerSignal.id]);
      setReferralLoadingId(null);
      referralTimer.current = null;
    }, REFERRAL_REVEAL_DELAY_MS);
  }, [busy, declined, offerSignal, referralLoadingId, revealedReferralIds]);

  useEffect(() => {
    if (!signal || signal.status !== 'OPEN') return;
    const latest = signal.replies[signal.replies.length - 1];
    if (latest?.inputType === 'FREE_TEXT' && latest.aiStatus === 'READY' && latest.choice === 'CHANGED') {
      setEditingSignal(signal.id);
    }
  }, [signal]);

  // 생활비 관리 탭에 처음 들어갈 때 딱 한 번 요약 카드를 불러온다.
  useEffect(() => {
    if (activeTab !== 'budget' || budgetSummary) return;
    let cancelled = false;
    setBudgetSummaryLoading(true);
    setBudgetSummaryError(false);
    api.get<BudgetChatSummaryResponse>('/members/me/budget/chat/summary')
      .then(data => { if (!cancelled) setBudgetSummary(data); })
      .catch(() => { if (!cancelled) setBudgetSummaryError(true); })
      .finally(() => { if (!cancelled) setBudgetSummaryLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, budgetSummary]);

  async function send(choice: CareChoice, change: Pick<CareButtonRequest, 'expectedDay' | 'expectedAmount'> = {}) {
    if (!signal || interactionBusy) return;
    if (choice === 'CHANGED' && change.expectedDay === undefined && change.expectedAmount === undefined) {
      const label = signal.options.find(option => option.value === choice)?.label ?? '계획이 바뀌었어요';
      setPendingUserText(label);
      setLocalTyping(true);
      localTypingTimer.current = setTimeout(() => {
        setEditingSignal(signal.id);
        setPendingUserText(null);
        setLocalTyping(false);
        localTypingTimer.current = null;
      }, MINIMUM_AI_LOADING_MS);
      return;
    }
    const selectedText = change.expectedDay === undefined && change.expectedAmount === undefined
      ? (choice === 'LATER' ? '다음에 확인할게요'
        : signal.options.find(option => option.value === choice)?.label ?? null)
      : null;
    if (selectedText) setPendingUserText(selectedText);
    setAwaitingAi(true);
    const key = `${signal.id}:${choice}:${change.expectedDay ?? ''}:${change.expectedAmount ?? ''}`;
    if (retry.current?.key !== key) retry.current = {
      key, request: { choice, ...change, requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    };
    const request = retry.current.request;
    if (await run(() => careApi.respond(signal.id, request), { minimumLoadingMs: MINIMUM_AI_LOADING_MS })) {
      retry.current = null;
      setEditingSignal(null);
    }
    setPendingUserText(null);
    setAwaitingAi(false);
  }

  async function sendMessage() {
    const value = input.trim();
    if (interactionBusy || faqBusy || budgetBusy || !value) return;
    if (activeTab === 'basic') {
      setInput('');
      await sendFaqMessage(value);
      return;
    }
    if (activeTab === 'budget') {
      setInput('');
      await sendBudgetMessage(value);
      return;
    }
    if (!signal) return;
    const key = `${signal.id}:${value}`;
    if (messageRetry.current?.key !== key) messageRetry.current = {
      key, request: { input: value, requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    };
    setPendingUserText(value);
    setAwaitingAi(true);
    setInput('');
    if (await run(() => careApi.message(signal.id, messageRetry.current!.request),
      { minimumLoadingMs: MINIMUM_AI_LOADING_MS })) {
      messageRetry.current = null;
    } else {
      setInput(value);
    }
    setPendingUserText(null);
    setAwaitingAi(false);
  }

  // 지원금/독립지원/서비스 자유질문. summary 를 안 건드리는 별개 상태라 useCare 의 run() 을 쓰지 않는다.
  async function sendFaqMessage(question: string, retryIndex?: number) {
    const index = retryIndex ?? faqThread.length;
    const createdAt = faqThread[index]?.createdAt ?? demoTimestamp(summary?.asOf);
    setFaqThread(prev => {
      const next = [...prev];
      next[index] = { question, createdAt };
      return next;
    });
    setFaqBusy(true);
    try {
      const response: FaqAskResponse = await careApi.faq({ question });
      setFaqThread(prev => {
        const next = [...prev];
        next[index] = { ...next[index], question, createdAt, answer: response.answer,
          answeredAt: demoTimestamp(summary?.asOf), sources: response.grounded ? response.sources : [] };
        return next;
      });
    } catch {
      setFaqThread(prev => {
        const next = [...prev];
        next[index] = { ...next[index], question, createdAt, error: true };
        return next;
      });
    }
    setFaqBusy(false);
  }

  // 생활비 자유질문. 이 사용자의 실제 이번 달 지출/예산/고정비/저축 데이터를 근거로 답한다.
  async function sendBudgetMessage(question: string, retryIndex?: number) {
    const index = retryIndex ?? budgetThread.length;
    const createdAt = budgetThread[index]?.createdAt ?? demoTimestamp(summary?.asOf);
    setBudgetThread(prev => {
      const next = [...prev];
      next[index] = { question, createdAt };
      return next;
    });
    setBudgetBusy(true);
    try {
      const response = await api.post<BudgetChatAskResponse>('/members/me/budget/chat/ask', { question });
      setBudgetThread(prev => {
        const next = [...prev];
        next[index] = { ...next[index], question, createdAt, answer: response.answer,
          answeredAt: demoTimestamp(summary?.asOf) };
        return next;
      });
    } catch {
      setBudgetThread(prev => {
        const next = [...prev];
        next[index] = { ...next[index], question, createdAt, error: true };
        return next;
      });
    }
    setBudgetBusy(false);
  }

  async function retryAi(conversationId: number, replyId: number) {
    if (interactionBusy) return;
    setAwaitingAi(true);
    await run(() => careApi.retryGemini(conversationId, replyId),
      { minimumLoadingMs: MINIMUM_AI_LOADING_MS });
    setAwaitingAi(false);
  }

  async function requestReferral(conversationId: number) {
    if (interactionBusy) return;
    setAwaitingAi(true);
    await run(() => careApi.refer(conversationId), { minimumLoadingMs: MINIMUM_AI_LOADING_MS });
    setAwaitingAi(false);
  }

  async function requestSupport(conversationId: number, responseId: number) {
    if (interactionBusy) return;
    setSupportChoices(current => ({ ...current, [conversationId]: 'YES' }));
    await run(() => careApi.policies(conversationId, responseId), { minimumLoadingMs: MINIMUM_AI_LOADING_MS });
  }

  function declineSupport(conversationId: number) {
    if (interactionBusy) return;
    setSupportChoices(current => ({ ...current, [conversationId]: 'NO' }));
  }

  function cancelScheduleChange() {
    setEditingSignal(null);
    requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }));
  }

  // 스마트 케어 탭인데 지금 답장을 받을 열린 신호가 없으면 입력창을 잠근다 — 보낼 곳이 없기 때문이다.
  const careTabIdle = activeTab === 'care' && !signal;
  const inputDisabled = interactionBusy || faqBusy || budgetBusy || careTabIdle;
  // 스마트 케어 시연 데이터의 고정된 10:00 대신, 화면을 보는 현재 시각을 표시한다.
  // 날짜 구분선은 기존 summary.asOf 기준을 유지해 데모 날짜 흐름은 보존한다.
  const careDisplayTime = demoTimestamp(summary?.asOf);

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScreenHeader />
    <CareBanner summary={summary} busy={busy} error={error} />
    <View style={styles.tabBar}>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: activeTab === 'basic' }}
        style={[styles.tabPill, activeTab === 'basic' && styles.tabPillActive]} onPress={() => setManualTab('basic')}>
        <Text numberOfLines={1} style={[styles.tabPillText, activeTab === 'basic' && styles.tabPillTextActive]}>기본 채팅</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: activeTab === 'budget' }}
        style={[styles.tabPill, activeTab === 'budget' && styles.tabPillActive]} onPress={() => setManualTab('budget')}>
        <Text numberOfLines={1} style={[styles.tabPillText, activeTab === 'budget' && styles.tabPillTextActive]}>생활비 관리</Text>
      </Pressable>
      {openSignalCount > 0 && <Pressable accessibilityRole="button" accessibilityState={{ selected: activeTab === 'care' }}
        style={[styles.tabPill, activeTab === 'care' && styles.tabPillActive]} onPress={() => setManualTab('care')}>
        <Text numberOfLines={1} style={[styles.tabPillText, activeTab === 'care' && styles.tabPillTextActive]}>스마트 케어</Text>
        <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{openSignalCount}</Text></View>
      </Pressable>}
    </View>
    <ScrollView ref={scroll} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => {
        if (signals.length > 1 || (signal?.replies.length ?? 0) > 0) scroll.current?.scrollToEnd({ animated: true });
      }}>
      {activeTab === 'care' ? <>
        {signals.map(conversation => <React.Fragment key={conversation.id}>
          <DaySeparator date={conversation.detectedAt} referenceDate={summary?.asOf} />
          <Message text={conversation.prompt} time={careDisplayTime} />
          {conversation.replies.map(reply => <React.Fragment key={reply.id}>
            <Message text={reply.inputType === 'BUTTON' && reply.choice === 'LATER' ? '다음에 확인할게요' : reply.userText}
              time={careDisplayTime} user />
            {reply.reply && <Message text={reply.reply} time={careDisplayTime} />}
            {reply.aiStatus === 'PENDING' && <TypingIndicator />}
            {reply.aiStatus === 'ERROR' && <View style={styles.aiStatus} accessibilityRole="alert">
              <Text style={styles.errorText}>답변을 불러오지 못했어요.</Text>
              <Pressable accessibilityRole="button" disabled={busy}
                onPress={() => { void retryAi(conversation.id, reply.id); }}>
                <Text style={styles.quickReplyText}>다시 답변받기</Text>
              </Pressable>
            </View>}
            {reply.policies && supportChoices[conversation.id] && <>
              <Message text={supportQuestion(conversation.type)} />
              <Message text={supportChoices[conversation.id] === 'YES' ? '네' : '아니요'} user />
            </>}
            {reply.policies && supportChoices[conversation.id] === 'YES' && <>
              <Message text={conversation.type === 'INCOME_MISSING'
                ? '네, 현재 상황에 맞는 일자리와 일경험 기회를 찾아봐드릴게요.'
                : '네, 현재 상황에 맞는 생활비·금융지원 정보를 찾아봐드릴게요.'} />
            </>}
            {reply.policies && <PolicyCards policies={reply.policies} busy={busy}
              retry={() => { void run(() => careApi.policies(conversation.id, reply.id),
                { minimumLoadingMs: MINIMUM_AI_LOADING_MS }); }} /> }
          </React.Fragment>)}
          {conversation.referral && <Message text="김민지 담당자님께 현재 상황을 전달했어요. 담당자님이 확인 후 연락드릴 수 있어요."
            time={conversation.referral.requestedAt} />}
          {(() => {
            const pendingPolicy = [...conversation.replies].reverse().find(reply => reply.policies?.status === 'PENDING');
            const choice = supportChoices[conversation.id];
            if (!pendingPolicy || choice) return null;
            return <SupportOffer signalType={conversation.type} busy={interactionBusy}
              accept={() => { void requestSupport(conversation.id, pendingPolicy.id); }}
              decline={() => declineSupport(conversation.id)} />;
          })()}
          {supportChoices[conversation.id] === 'NO' && <>
            <Message text="네, 알겠어요. 도움이 필요할 때 언제든지 다시 이야기해 주세요." />
          </>}
          {referralLoadingId === conversation.id && <TypingIndicator />}
          {offerSignal?.id === conversation.id && revealedReferralIds.includes(conversation.id)
            && !conversation.referral && !declined.includes(conversation.id)
            && !conversation.replies.some(r => r.policies?.status === 'PENDING') && <ReferralOffer
              signal={conversation} busy={busy}
              accept={() => { void requestReferral(conversation.id); }}
              decline={() => setDeclined(ids => [...ids, conversation.id])} />}
        </React.Fragment>)}
        {editing && <>
          {!localTyping && <Message text={signal.options.find(option => option.value === 'CHANGED')?.label ?? '계획이 바뀌었어요'} user />}
          <Message text="어떤 계획으로 변경해 드릴까요? 설정하신 내용은 다음 달부터 바로 반영돼요." />
          <ScheduleChangeForm key={signal.id} signal={signal} busy={busy}
            save={change => { void send('CHANGED', change); }} cancel={cancelScheduleChange} />
        </>}
        {pendingUserText && <Message text={pendingUserText} user />}
        {(awaitingAi || localTyping) && <TypingIndicator />}
        {options.length > 0 && !pendingUserText && !localTyping && <View style={styles.quickReplyCol}>
          {options.map(option => <QuickReplyButton key={option.value} disabled={interactionBusy}
            label={option.value === 'LATER' ? '다음에 확인할게요' : option.label}
            onPress={() => { void send(option.value); }} />)}
        </View>}
      </> : activeTab === 'budget' ? <>
        <DaySeparator date={chatSessionStartedAt}
          referenceDate={summary?.asOf ?? chatSessionStartedAt} />
        <Message time={chatSessionStartedAt} text={budgetSummary?.greeting
          ?? '이번 달 생활비 흐름을 같이 살펴볼게요. 궁금한 항목을 물어보시면, 아래 요약과 연결해서 설명해 드릴게요.'} />
        {budgetSummaryLoading && <ActivityIndicator color={colors.chatAccent} accessibilityLabel="생활비 요약 불러오는 중" />}
        {budgetSummaryError && <View style={styles.errorWrap} accessibilityRole="alert">
          <Text style={styles.errorText}>생활비 요약을 불러오지 못했어요.</Text>
          <Pressable accessibilityRole="button" onPress={() => setBudgetSummary(null)}>
            <Text style={styles.quickReplyText}>다시 확인하기</Text>
          </Pressable>
        </View>}
        {budgetSummary && <BudgetSummaryCard summary={budgetSummary} />}
        {budgetThread.length === 0 && budgetSummary && budgetSummary.quickQuestions.length > 0 && <View style={styles.quickReplyCol}>
          {budgetSummary.quickQuestions.map(question => <QuickReplyButton key={question} disabled={budgetBusy}
            label={question} onPress={() => { void sendBudgetMessage(question); }} />)}
        </View>}
        {budgetThread.map((entry, index) => <React.Fragment key={index}>
          <MessageDateSeparator date={entry.createdAt} referenceDate={summary?.asOf}
            previousDate={index === 0 ? chatSessionStartedAt : budgetThread[index - 1].createdAt} />
          <Message text={entry.question} time={entry.createdAt} user />
          {entry.error ? <View style={styles.aiStatus} accessibilityRole="alert">
            <Text style={styles.errorText}>답변을 불러오지 못했어요.</Text>
            <Pressable accessibilityRole="button" disabled={budgetBusy}
              onPress={() => { void sendBudgetMessage(entry.question, index); }}>
              <Text style={styles.quickReplyText}>다시 시도하기</Text>
            </Pressable>
          </View> : entry.answer === undefined ? <TypingIndicator /> : <Message text={entry.answer} time={entry.answeredAt} />}
        </React.Fragment>)}
      </> : <>
        <DaySeparator date={chatSessionStartedAt}
          referenceDate={summary?.asOf ?? chatSessionStartedAt} />
        {faqThread.length === 0 && <Message time={chatSessionStartedAt} text="지원금·독립지원(주거)·서비스 이용에 대해 무엇이든 물어보세요." />}
        {faqThread.map((entry, index) => <React.Fragment key={index}>
          <MessageDateSeparator date={entry.createdAt} referenceDate={summary?.asOf}
            previousDate={index === 0 ? chatSessionStartedAt : faqThread[index - 1].createdAt} />
          <Message text={entry.question} time={entry.createdAt} user />
          {entry.error ? <View style={styles.aiStatus} accessibilityRole="alert">
            <Text style={styles.errorText}>답변을 불러오지 못했어요.</Text>
            <Pressable accessibilityRole="button" disabled={faqBusy}
              onPress={() => { void sendFaqMessage(entry.question, index); }}>
              <Text style={styles.quickReplyText}>다시 시도하기</Text>
            </Pressable>
          </View> : entry.answer === undefined ? <TypingIndicator /> : <>
            <Message text={entry.answer} time={entry.answeredAt} />
            {entry.sources && <FaqSources sources={entry.sources} />}
          </>}
        </React.Fragment>)}
      </>}
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
        <TextInput style={styles.input}
          placeholder={careTabIdle ? '확인이 필요한 이상징후가 없어요' : '궁금한 점을 물어보세요'}
          placeholderTextColor={colors.textTertiary}
          value={input} onChangeText={setInput} maxLength={1000} editable={!inputDisabled}
          returnKeyType="send" onSubmitEditing={() => { void sendMessage(); }}
          accessibilityLabel="궁금한 점을 물어보세요" />
        <Pressable accessibilityRole="button" accessibilityLabel="메시지 전송"
          accessibilityState={{ disabled: inputDisabled || !input.trim() }}
          disabled={inputDisabled || !input.trim()} onPress={() => { void sendMessage(); }}
          style={[styles.sendButton, (inputDisabled || !input.trim()) && styles.disabled]}>
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
  messageColumn: { flex: 1, alignItems: 'flex-start' },
  messageColumnUser: { alignItems: 'flex-end' },
  botName: { fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginLeft: spacing.xs, marginBottom: spacing.xs },
  bubble: { padding: spacing.md, borderRadius: radius.lg },
  bubbleBot: { maxWidth: '86%', backgroundColor: colors.white, borderTopLeftRadius: 2, borderWidth: 1,
    borderColor: colors.border, shadowColor: colors.chatShadow, shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  bubbleUser: { maxWidth: '82%', backgroundColor: colors.chatAccent, borderTopRightRadius: spacing.xs },
  textBot: { fontSize: 16, lineHeight: 25, color: colors.textPrimary },
  textUser: { fontSize: 16, lineHeight: 25, color: colors.white },
  timestamp: { fontSize: 12, lineHeight: 18, color: colors.textTertiary, marginTop: spacing.sm, marginLeft: spacing.xs },
  timestampRight: { textAlign: 'right', marginRight: spacing.xs },
  quickReplyCol: { gap: spacing.sm, marginTop: spacing.md, marginLeft: spacing.xl + spacing.md + spacing.xs },
  quickReplyRow: { backgroundColor: colors.background, borderRadius: radius.sm,
    paddingHorizontal: spacing.md + spacing.xs, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.primaryLight },
  quickReplyRowActive: { backgroundColor: colors.chatAccent, borderColor: colors.chatAccent },
  quickReplyText: { color: colors.chatAccent, fontSize: 16, lineHeight: 22 },
  quickReplyTextActive: { color: colors.white },
  disabled: { opacity: 0.55 },
  inputRow: { paddingHorizontal: spacing.md + spacing.xs, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.chatBackground },
  inputCapsule: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.chatInputBorder, backgroundColor: colors.white, padding: spacing.xs, minHeight: 56 },
  input: { flex: 1, minWidth: 0, paddingLeft: spacing.lg, paddingRight: spacing.sm, paddingVertical: spacing.sm,
    fontSize: 16, lineHeight: 25, color: colors.textPrimary },
  sendButton: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.chatAccent,
    alignItems: 'center', justifyContent: 'center' },
  errorWrap: { marginTop: spacing.md, marginLeft: spacing.xl + spacing.md + spacing.xs, gap: spacing.sm },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 20 },
  aiStatus: { marginLeft: spacing.xl + spacing.md + spacing.xs, marginBottom: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  faqSourceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4,
    marginLeft: spacing.xl + spacing.md, marginTop: -spacing.sm, marginBottom: spacing.md, maxWidth: '86%' },
  faqSourceText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.textTertiary },
  tabBar: { flexDirection: 'row', gap: 4, backgroundColor: colors.track, borderRadius: radius.full,
    padding: 4, marginHorizontal: spacing.md + spacing.xs, marginTop: spacing.sm, marginBottom: spacing.xs },
  tabPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: spacing.sm, paddingHorizontal: 2, borderRadius: radius.full },
  tabPillActive: { backgroundColor: colors.chatAccent },
  tabPillText: { fontSize: 13, lineHeight: 18, fontWeight: '700', color: colors.textSecondary },
  tabPillTextActive: { color: colors.white },
  tabBadge: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { fontSize: 10, lineHeight: 14, fontWeight: '800', color: colors.white },
  budgetCard: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md + spacing.xs, marginBottom: spacing.md, gap: spacing.md,
    shadowColor: colors.chatShadow, shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  budgetCardTitle: { fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.textPrimary },
  budgetProgressTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.track, overflow: 'hidden' },
  budgetProgressFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.chatAccent },
  budgetProgressFillOver: { backgroundColor: colors.danger },
  budgetStatRow: { flexDirection: 'row', gap: spacing.sm },
  budgetStatBox: { flex: 1, backgroundColor: colors.background, borderRadius: radius.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, gap: 2 },
  budgetStatLabel: { fontSize: 12, lineHeight: 17, color: colors.textTertiary },
  budgetStatValue: { fontSize: 17, lineHeight: 23, fontWeight: '700', color: colors.textPrimary },
  budgetStatValueOver: { color: colors.danger },
});
