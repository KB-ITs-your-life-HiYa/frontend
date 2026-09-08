/**
 * TODO(DELETE): 케어 시연용 날짜 조작 UI.
 * - 로컬/데모에서만 쓰는 임시 컨트롤이다.
 * - 정식 릴리스 전에 이 파일과 ChatScreen 의 import·렌더를 함께 삭제한다.
 */
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/colors';
import { ApiError } from '../../services/api';
import { careApi } from '../../services/care';
import type { CareSummary } from '../../types/care';

const DEMO_DATES = [
  { date: '2026-09-23', label: '09-23 시작' },
  { date: '2026-09-24', label: '09-24 공과금누락' },
  { date: '2026-09-26', label: '09-26 소득누락' },
  { date: '2026-10-01', label: '10-01 재확인' },
] as const;

type Props = {
  busy: boolean;
  asOf?: string;
  demoEnabled?: boolean;
  onRun: (operation: () => Promise<CareSummary>) => Promise<boolean>;
};

export default function CareDemoControls({ busy, asOf, demoEnabled, onRun }: Props) {
  const [pending, setPending] = useState(false);
  if (!__DEV__ || !demoEnabled) return null;

  const asOfDay = asOf ? asOf.slice(0, 10) : null;
  const locked = busy || pending;

  async function runDemo(operation: () => Promise<CareSummary>, failTitle: string) {
    if (locked) return;
    setPending(true);
    try {
      const ok = await onRun(operation);
      if (!ok) return;
    } catch (e) {
      Alert.alert(failTitle, e instanceof ApiError ? e.message : '다시 시도해 주세요.');
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.bar} accessibilityLabel="케어 시연용 날짜 조작">
      <Text style={styles.caption}>
        시연용 · 현재 {asOfDay ?? '—'}
        {pending ? ' · 적용 중…' : ''}
      </Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          disabled={locked}
          onPress={() => { void runDemo(() => careApi.reset(), '초기화 실패'); }}
          style={[styles.chip, styles.reset, locked && styles.disabled]}
        >
          <Text style={styles.resetText}>초기화</Text>
        </Pressable>
        {DEMO_DATES.map((item) => {
          const active = asOfDay === item.date;
          return (
            <Pressable
              key={item.date}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: locked }}
              disabled={locked}
              onPress={() => { void runDemo(() => careApi.date(item.date), '날짜 변경 실패'); }}
              style={[styles.chip, active && styles.chipActive, locked && styles.disabled]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>날짜는 앞으로만 이동됩니다. 되돌리려면 초기화하세요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.md + spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.chatBackground,
    gap: 6,
  },
  caption: { fontSize: 11, color: colors.textTertiary, fontWeight: '600' },
  hint: { fontSize: 11, color: colors.textTertiary, lineHeight: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.chatAccent, borderColor: colors.chatAccent },
  chipText: { fontSize: 11, color: colors.chatAccent, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  reset: { borderColor: colors.border, backgroundColor: colors.track },
  resetText: { fontSize: 11, color: colors.textSecondary, fontWeight: '700' },
  disabled: { opacity: 0.55 },
});
