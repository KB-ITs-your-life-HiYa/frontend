import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';
import { habitApi } from '../../services/habit';
import { HabitTopicDetail } from '../../types/habit';

// 놀이 탭 "금융 상식 쑥쑥" 주제 상세 화면 — GET /habit/topics/detail/{topicId}
//
// body는 R__seed_06_habit.sql에서 마크다운 비슷한 규칙으로 내려온다.
//   ■ 제목        → 섹션 소제목
//   • 텍스트      → 목록 항목 (연속된 줄이면 한 목록으로 묶임)
//   **텍스트**    → 강조(볼드 + 하이라이트)
//   그 외 줄      → 그냥 문단
// 예전엔 이걸 전부 하나의 <Text>에 욱여넣어서 볼드만 살짝 입힌 "글자 벽"이었는데,
// 지금은 줄 단위로 분류해서 소제목/목록/문단을 실제 레이아웃 블록으로 나눠 그린다.
// 그래야 대출 종류처럼 다섯 개 항목이 나열되는 내용도 한눈에 스캔하기 쉬워진다.

type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

function classifyLine(line: string): 'heading' | 'list' | 'paragraph' {
  if (line.startsWith('■')) return 'heading';
  if (line.startsWith('•')) return 'list';
  return 'paragraph';
}

// body를 줄 단위로 훑으면서, 같은 종류의 줄이 연속되는 동안은 한 블록으로 묶는다.
// 빈 줄이 나오거나 줄의 종류(제목/목록/문단)가 바뀌면 블록을 새로 시작한다.
// (예: "체크포인트예요." 다음 줄에 바로 "• ..."가 이어지는 경우처럼, 빈 줄 없이도
//  문단 → 목록으로 종류가 바뀌면 자연스럽게 블록이 나뉘어야 한다.)
function parseBody(body: string): Block[] {
  const rawLines = body.split('\n').map((l) => l.trim());
  const blocks: Block[] = [];
  let current: { type: 'list' | 'paragraph'; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    if (current.type === 'list') {
      blocks.push({ type: 'list', items: current.lines.map((l) => l.replace(/^•\s*/, '')) });
    } else {
      blocks.push({ type: 'paragraph', text: current.lines.join(' ') });
    }
    current = null;
  };

  for (const raw of rawLines) {
    if (!raw) {
      flush();
      continue;
    }
    const kind = classifyLine(raw);
    if (kind === 'heading') {
      flush();
      blocks.push({ type: 'heading', text: raw.replace(/^■\s*/, '') });
      continue;
    }
    if (!current || current.type !== kind) {
      flush();
      current = { type: kind, lines: [] };
    }
    current.lines.push(raw);
  }
  flush();
  return blocks;
}

// **텍스트** 마커를 볼드 + 하이라이트 배경 스타일의 <Text>로 바꿔치기한다.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={styles.highlight}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
}

function BodyBlocks({ body }: { body: string }) {
  const blocks = parseBody(body);
  return (
    <View style={{ gap: spacing.sm }}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <View key={i} style={[styles.heading, i > 0 && styles.headingDivider]}>
              <View style={styles.headingBar} />
              <Text style={styles.headingText}>{block.text}</Text>
            </View>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={i} style={styles.list}>
              {block.items.map((item, j) => (
                <View key={j} style={styles.listRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{renderInline(item)}</Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={styles.paragraph}>
            {renderInline(block.text)}
          </Text>
        );
      })}
    </View>
  );
}

export default function TopicDetailScreen() {
  const route = useRoute<any>();
  const topicId: number | undefined = route.params?.topicId;

  const [topic, setTopic] = useState<HabitTopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!topicId) {
      setError('토픽 정보를 찾을 수 없어요.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    habitApi
      .getTopicDetail(topicId)
      .then(setTopic)
      .catch(() => setError('토픽 내용을 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [topicId]);

  return (
    <View style={styles.screen}>
      <ScreenHeader title={topic?.title ?? '금융 상식'} showBack showProfile={false} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error || !topic ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.title}>{error ?? '내용을 찾을 수 없어요'}</Text>
            <Button label="다시 시도" size="sm" onPress={load} style={{ marginTop: spacing.sm }} />
          </Card>
        ) : (
          <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
            <Card style={styles.headerCard}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name={topic.icon as any} size={26} color={colors.primary} />
              </View>
              <Text style={styles.title}>{topic.title}</Text>
              <Text style={styles.subtitle}>{topic.subtitle}</Text>
            </Card>
            <Card>
              <BodyBlocks body={topic.body} />
            </Card>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.md },
  emptyCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  headerCard: { alignItems: 'center', gap: 6, paddingVertical: spacing.lg },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.textTertiary, textAlign: 'center' },

  // 문단
  paragraph: { fontSize: 14.5, lineHeight: 23, color: colors.textPrimary },

  // ■ 소제목: 왼쪽 색 막대 + 굵은 글씨. 두 번째 소제목부터는 위에 구분선을 넣어
  // 앞 섹션과 시각적으로 확실히 끊어 보이게 한다.
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headingDivider: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  headingBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  headingText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },

  // • 목록: 옅은 파란 배경의 카드로 묶어서 글자 벽 속에서도 한눈에 스캔되게 한다.
  list: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    gap: spacing.xs + 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  listText: { flex: 1, fontSize: 14.5, lineHeight: 22, color: colors.textPrimary },

  highlight: {
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: colors.accentLight,
  },
});
