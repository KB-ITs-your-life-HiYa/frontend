import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface Props {
  value: number; // 0 = 미설정
  onChange: (next: number) => void;
  size?: 'lg' | 'md';
  editable?: boolean;
  testID?: string;
}

// 금액 입력. 평소엔 "포맷된 금액 + 연필" 로 보이다가 탭하면 숫자 입력으로 바뀐다.
// 0원이면 연한 회색으로 표시해 "미설정" 임을 드러낸다.
// 입력 중에는 천 단위 콤마를 실시간으로 붙이고, 매 키 입력마다 onChange 를 바로 호출한다
// (합계를 실시간으로 갱신해야 하는 화면이 있어서 blur 를 기다리지 않는다).
export default function MoneyInput({ value, onChange, size = 'md', editable = true, testID }: Props) {
  const [editing, setEditing] = useState(false);
  const [rawText, setRawText] = useState('');

  const startEditing = () => {
    if (!editable) return;
    setRawText(value > 0 ? String(value) : '');
    setEditing(true);
  };

  const handleChangeText = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 10); // 최대 100억 미만
    setRawText(digits);
    onChange(digits === '' ? 0 : Number(digits));
  };

  const stopEditing = () => setEditing(false);

  if (editing) {
    return (
      <TextInput
        testID={testID}
        style={[styles.text, styles[size], styles.input]}
        value={rawText === '' ? '' : Number(rawText).toLocaleString('ko-KR')}
        onChangeText={handleChangeText}
        onBlur={stopEditing}
        onSubmitEditing={stopEditing}
        keyboardType="number-pad"
        autoFocus
        placeholder="0"
        placeholderTextColor={colors.textTertiary}
      />
    );
  }

  return (
    <Pressable style={styles.row} onPress={startEditing} disabled={!editable} testID={testID}>
      <Text style={[styles.text, styles[size], value === 0 ? styles.zero : null]}>
        {value.toLocaleString('ko-KR')}원
      </Text>
      {editable ? <Ionicons name="create-outline" size={16} color={colors.textTertiary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontWeight: '700', color: colors.textPrimary, textAlign: 'right' },
  zero: { color: colors.textTertiary, fontWeight: '400' },
  lg: { fontSize: 18 },
  md: { fontSize: 15 },
  input: {
    minWidth: 90,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
  },
});