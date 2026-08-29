import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radius, spacing } from '../../constants/colors';
import type { ChatMessage } from '../../types';

// AI 상담 챗봇 화면
// 예시 시나리오: 온라인 케어(4. 온라인 케어 시스템)의 "이상징후 감지 시 AI 개입 대화" —
// 월세 납부가 확인되지 않아 챗봇이 먼저 말을 거는 상황
// TODO: 전송/응답을 services/api.ts 를 통해 백엔드(FastAPI/Gemini) 응답으로 교체
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: '이번 달 월세 납부가 아직 확인되지 않았어요. 상황에 변화가 있었나요?',
    createdAt: '오전 10:23',
  },
];

const QUICK_REPLIES = ['이미 납부했어요', '납부가 어려워요', '다음에 확인할게요'];

function getFollowUp(reply: string): string {
  switch (reply) {
    case '이미 납부했어요':
      return '확인해주셔서 감사해요! 납부 내역을 반영해서 안심 지수를 업데이트할게요.';
    case '납부가 어려워요':
      return '괜찮아요, 혼자 걱정하지 마세요. 주거비 지원 제도와 상담 연결을 도와드릴게요. 잠시 후 정책금융팀 담당자에게도 알림이 전달돼요.';
    case '다음에 확인할게요':
      return '알겠어요. 며칠 안에 다시 한번 여쭤볼게요. 언제든 먼저 말 걸어주셔도 좋아요.';
    default:
      return '네, 확인했어요. 도움이 더 필요하면 언제든 말씀해주세요.';
  }
}

export default function ChatScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [repliesUsed, setRepliesUsed] = useState(false);

  const appendMessage = (msg: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: String(Date.now() + Math.random()) }]);
  };

  const handleQuickReply = (reply: string) => {
    setRepliesUsed(true);
    appendMessage({ role: 'user', content: reply, createdAt: '방금' });
    setTimeout(() => {
      appendMessage({ role: 'assistant', content: getFollowUp(reply), createdAt: '방금' });
    }, 400);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    appendMessage({ role: 'user', content: input, createdAt: '방금' });
    setInput('');
    setTimeout(() => {
      appendMessage({ role: 'assistant', content: getFollowUp(input), createdAt: '방금' });
    }, 400);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.todayPillWrap}>
            <View style={styles.todayPill}>
              <Text style={styles.todayText}>오늘</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          !repliesUsed ? (
            <View style={styles.quickReplyCol}>
              {QUICK_REPLIES.map((reply) => (
                <Pressable key={reply} style={styles.quickReplyRow} onPress={() => handleQuickReply(reply)}>
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.messageBlock}>
            {item.role === 'assistant' ? (
              <View style={styles.botHeader}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="home-city" size={16} color={colors.white} />
                </View>
                <Text style={styles.botName}>자립동행 AI</Text>
              </View>
            ) : null}
            <View style={[styles.bubbleRow, item.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowBot]}>
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={item.role === 'user' ? styles.textUser : styles.textBot}>{item.content}</Text>
              </View>
            </View>
            <Text style={[styles.timestamp, item.role === 'user' ? styles.timestampRight : styles.timestampLeft]}>
              {item.createdAt}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="궁금한 점을 물어보세요"
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={16} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: 2, flexGrow: 1 },
  todayPillWrap: { alignItems: 'center', marginBottom: spacing.sm },
  todayPill: { backgroundColor: colors.graySoft, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },
  todayText: { fontSize: 12, color: colors.textTertiary, fontWeight: '600' },
  messageBlock: { marginBottom: spacing.md },
  botHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  botName: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowBot: { justifyContent: 'flex-start' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', padding: spacing.sm + 2, borderRadius: radius.md },
  bubbleBot: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bubbleUser: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
  textBot: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
  textUser: { color: colors.white, fontSize: 14, lineHeight: 20 },
  timestamp: { fontSize: 11, color: colors.textTertiary, marginTop: 4 },
  timestampLeft: { textAlign: 'left', marginLeft: 2 },
  timestampRight: { textAlign: 'right', marginRight: 2 },
  quickReplyCol: { gap: spacing.sm, marginTop: spacing.sm },
  quickReplyRow: {
    backgroundColor: colors.graySoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  quickReplyText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
