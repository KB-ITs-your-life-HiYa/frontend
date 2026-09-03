import React, { useState } from 'react';
import { Pressable, StyleSheet, View , Text, TextInput } from 'react-native';
import { colors, radius, spacing } from '../../constants/colors';
import type { CareButtonRequest, CareSignal } from '../../types/care';

type Change = Pick<CareButtonRequest, 'expectedDay' | 'expectedAmount'>;

export default function ScheduleChangeForm({ signal, busy, save }: {
  signal: CareSignal; busy: boolean; save: (change: Change) => void;
}) {
  const [changeDay, setChangeDay] = useState(false);
  const [changeAmount, setChangeAmount] = useState(false);
  const [day, setDay] = useState(String(Number(signal.expectedDate.slice(-2))));
  const [amount, setAmount] = useState(signal.expectedAmount?.toString() ?? '');
  const action = signal.type === 'MISSED_SAVING' ? '납입' : signal.type === 'MISSED_PAYMENT' ? '납부' : '입금';
  const validDay = /^\d+$/.test(day) && Number(day) >= 1 && Number(day) <= 31;
  const validAmount = /^\d+$/.test(amount) && Number.isSafeInteger(Number(amount)) && Number(amount) > 0;
  const valid = (changeDay || changeAmount) && (!changeDay || validDay) && (!changeAmount || validAmount);

  return <View style={styles.form}>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: changeDay, disabled: busy }}
      disabled={busy} style={[styles.option, changeDay && styles.selected]} onPress={() => setChangeDay(value => !value)}>
      <Text style={styles.optionText}>{action} 날짜를 바꿀래요</Text>
    </Pressable>
    {changeDay && <>
      <Text style={styles.label}>매월 {action}일 (1~31일)</Text>
      <TextInput accessibilityLabel={`매월 ${action}일`} value={day} onChangeText={setDay}
        keyboardType="number-pad" maxLength={2} editable={!busy} style={styles.input} />
      {!validDay && <Text style={styles.error}>1일부터 31일 사이로 입력해 주세요.</Text>}
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
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy || !valid }} disabled={busy || !valid}
      style={[styles.save, (busy || !valid) && styles.disabled]} onPress={() => save({
        ...(changeDay ? { expectedDay: Number(day) } : {}),
        ...(changeAmount ? { expectedAmount: Number(amount) } : {}),
      })}>
      <Text style={styles.saveText}>{busy ? '저장 중…' : '저장'}</Text>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  form: { marginLeft: spacing.xl + spacing.md + spacing.xs, gap: spacing.sm, marginBottom: spacing.md },
  option: { backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.md + spacing.xs,
    paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.background },
  selected: { borderColor: colors.chatAccent, backgroundColor: colors.primaryLight },
  optionText: { color: colors.chatAccent, fontSize: 16, lineHeight: 22 },
  label: { color: colors.textSecondary, fontSize: 14 },
  input: { backgroundColor: colors.white, color: colors.textPrimary, borderWidth: 1, borderColor: colors.chatInputBorder,
    borderRadius: radius.sm, padding: spacing.md, fontSize: 16 },
  hint: { color: colors.textTertiary, fontSize: 12, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 13 },
  save: { backgroundColor: colors.chatAccent, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  saveText: { color: colors.white, fontSize: 16 },
  disabled: { opacity: 0.55 },
});
