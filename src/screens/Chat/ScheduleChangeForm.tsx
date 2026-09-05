import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View , Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../constants/colors';
import type { CareButtonRequest, CareSignal } from '../../types/care';

type Change = Pick<CareButtonRequest, 'expectedDay' | 'expectedAmount'>;
const DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

export default function ScheduleChangeForm({ signal, busy, save, cancel }: {
  signal: CareSignal; busy: boolean; save: (change: Change) => void; cancel: () => void;
}) {
  const [changeDay, setChangeDay] = useState(false);
  const [changeAmount, setChangeAmount] = useState(false);
  const [day, setDay] = useState(String(Number(signal.expectedDate.slice(-2))));
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const [amount, setAmount] = useState(signal.expectedAmount?.toString() ?? '');
  const action = signal.type === 'MISSED_SAVING' ? '납입' : signal.type === 'MISSED_PAYMENT' ? '납부' : '입금';
  const validDay = /^\d+$/.test(day) && Number(day) >= 1 && Number(day) <= 31;
  const validAmount = /^\d+$/.test(amount) && Number.isSafeInteger(Number(amount)) && Number(amount) > 0;
  const valid = (changeDay || changeAmount) && (!changeDay || validDay) && (!changeAmount || validAmount);

  return <View style={styles.form}>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: changeDay, disabled: busy }}
      disabled={busy} style={[styles.option, changeDay && styles.selected]} onPress={() => {
        setChangeDay(value => !value);
        setDayPickerOpen(false);
      }}>
      <Text style={styles.optionText}>{action} 날짜를 바꿀래요</Text>
    </Pressable>
    {changeDay && <>
      <Text style={styles.label}>매월 {action}일 (1~31일)</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`매월 ${action}일, 현재 ${day}일`}
        accessibilityState={{ expanded: dayPickerOpen, disabled: busy }} disabled={busy}
        style={[styles.daySelect, dayPickerOpen && styles.daySelectOpen]}
        onPress={() => setDayPickerOpen(open => !open)}>
        <Text style={styles.daySelectText}>{day}일</Text>
        <Ionicons name={dayPickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </Pressable>
      {dayPickerOpen && <ScrollView style={styles.dayList} nestedScrollEnabled
        contentContainerStyle={styles.dayListContent} showsVerticalScrollIndicator>
        {DAYS.map(value => {
          const selected = day === String(value);
          return <Pressable key={value} accessibilityRole="button"
            accessibilityState={{ selected }} style={[styles.dayRow, selected && styles.dayRowSelected]}
            onPress={() => { setDay(String(value)); setDayPickerOpen(false); }}>
            <Text style={[styles.dayRowText, selected && styles.dayRowTextSelected]}>{value}일</Text>
            {selected && <Ionicons name="checkmark" size={18} color={colors.chatAccent} />}
          </Pressable>;
        })}
      </ScrollView>}
      <Text style={styles.hint}>해당 날짜가 없는 달에는 말일에 반영돼요.</Text>
    </>}
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: changeAmount, disabled: busy }}
      disabled={busy} style={[styles.option, changeAmount && styles.selected]} onPress={() => setChangeAmount(value => !value)}>
      <Text style={styles.optionText}>{action} 금액을 바꿀래요</Text>
    </Pressable>
    {changeAmount && <>
      <Text style={styles.label}>{action} 금액 (원)</Text>
      <TextInput accessibilityLabel={`${action} 금액`} value={amount} onChangeText={setAmount}
        keyboardType="number-pad" maxLength={16} editable={!busy} style={styles.input} />
      {!validAmount && <Text style={styles.error}>1원 이상의 금액을 숫자로 입력해 주세요.</Text>}
    </>}
    <View style={styles.buttonRow}>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy}
        style={[styles.cancel, busy && styles.disabled]} onPress={cancel}>
        <Text style={styles.cancelText}>취소</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy || !valid }} disabled={busy || !valid}
        style={[styles.save, (busy || !valid) && styles.disabled]} onPress={() => save({
          ...(changeDay ? { expectedDay: Number(day) } : {}),
          ...(changeAmount ? { expectedAmount: Number(amount) } : {}),
        })}>
        <Text style={styles.saveText}>{busy ? '저장 중…' : '저장'}</Text>
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  form: { marginLeft: spacing.xl + spacing.md + spacing.sm + 2, marginRight: '14%', marginBottom: spacing.md,
    padding: spacing.md, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.track },
  option: { backgroundColor: colors.white, borderRadius: radius.sm, paddingHorizontal: spacing.md + spacing.xs,
    paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.white },
  selected: { borderColor: colors.chatAccent, backgroundColor: colors.primaryLight },
  optionText: { color: colors.chatAccent, fontSize: 16, lineHeight: 22 },
  label: { color: colors.textSecondary, fontSize: 14 },
  input: { backgroundColor: colors.white, color: colors.textPrimary, borderWidth: 1, borderColor: colors.chatInputBorder,
    borderRadius: radius.sm, padding: spacing.md, fontSize: 16 },
  daySelect: { minHeight: 50, backgroundColor: colors.white, borderWidth: 1,
    borderColor: colors.chatInputBorder, borderRadius: radius.sm, paddingHorizontal: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  daySelectOpen: { borderColor: colors.chatAccent, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  daySelectText: { color: colors.textPrimary, fontSize: 16 },
  dayList: { maxHeight: 176, backgroundColor: colors.white, borderWidth: 1, borderTopWidth: 0,
    borderColor: colors.chatAccent, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm },
  dayListContent: { paddingVertical: spacing.xs },
  dayRow: { minHeight: 42, paddingHorizontal: spacing.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between' },
  dayRowSelected: { backgroundColor: colors.primaryLight },
  dayRowText: { color: colors.textPrimary, fontSize: 15 },
  dayRowTextSelected: { color: colors.chatAccent, fontWeight: '600' },
  hint: { color: colors.textTertiary, fontSize: 12, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 13 },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  cancel: { flex: 1, backgroundColor: colors.white, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    alignItems: 'center', borderWidth: 1, borderColor: colors.chatAccent },
  cancelText: { color: colors.chatAccent, fontSize: 16 },
  save: { flex: 1, backgroundColor: colors.chatAccent, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    alignItems: 'center', borderWidth: 1, borderColor: colors.chatAccent },
  saveText: { color: colors.white, fontSize: 16 },
  disabled: { opacity: 0.55 },
});
