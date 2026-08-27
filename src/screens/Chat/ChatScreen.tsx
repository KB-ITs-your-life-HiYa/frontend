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
import Chip from '../../components/Chip';
import { colors, radius, spacing } from '../../constants/colors';
import type { ChatMessage } from '../../types';

// AI 상담 챗봇 화면 — 정부 지원금 매칭 안내, 온라인 케어 개입 대화 등에 사용
// TODO: 전송 시 services/api.ts 를 통해 백엔드(FastAPI/Gemini) 응답으로 교체
const initialMessages: ChatMessage[] = [
  { id: '1', role: 'assistant', content: '청년내일저축계좌를 아세요? 최근 3개월 근로소득이 있으신 것 같아요.', createdAt: '오전 10:23' },
  { id: '2', role: 'user', content: '네, 알아보고 싶어요', createdAt: '오전 10:24' },
  { id: '3', role: 'assistant', content: '그럼 대상이에요! 월 10만원씩 3년 저축하면 정부지원금 30만원이 함께 적립돼요.', createdAt: '오전 10:24' },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = (text?: string) => {
    const content = text ?? input;
    if (!content.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: 'user', content, createdAt: '방금' },
    ]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
        renderItem={({ item, index }) => (
          <View style={styles.messageBlock}>
            {item.role === 'assistant' ? (
              <View style={styles.botHeader}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="home-city" size={16} color={colors.white} />
                </View>
                <Text style={styles.botName}>자립동행 AI</Text>
              </View>
            ) : null}
            <View
              style={[
                styles.bubbleRow,
                item.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowBot,
              ]}
            >
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={item.role === 'user' ? styles.textUser : styles.textBot}>{item.content}</Text>
              </View>
            </View>
            <Text style={[styles.timestamp, item.role === 'user' ? styles.timestampRight : styles.timestampLeft]}>
              {item.createdAt}
            </Text>

            {/* 마지막 봇 메시지 아래 추천 카드 예시 */}
            {item.role === 'assistant' && index === messages.length - 1 ? (
              <Pressable style={styles.recommendCard}>
                <View style={styles.recommendTextCol}>
                  <Text style={styles.recommendLabel}>추천 지원금</Text>
                  <Text style={styles.recommendTitle}>자립정착금 신청 방법{'\n'}알아보기</Text>
                </View>
                <View style={styles.recommendArrow}>
                  <Ionicons name="arrow-forward" size={18} color={colors.white} />
                </View>
              </Pressable>
            ) : null}
          </View>
        )}
      />

      <View style={styles.chipRow}>
        <Chip label="자격 조건이 어떻게 되나요?" onPress={() => handleSend('자격 조건이 어떻게 되나요?')} />
        <Chip label="다음에 할게요" onPress={() => handleSend('다음에 할게요')} />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="궁금한 점을 물어보세요"
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
        />
        <Pressable style={styles.sendButton} onPress={() => handleSend()}>
          <Ionicons name="send" size={16} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: 2 },
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
  recommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  recommendTextCol: { flex: 1 },
  recommendLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  recommendTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, lineHeight: 20 },
  recommendArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  chipRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
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
