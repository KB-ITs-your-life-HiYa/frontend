import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface Props {
  value: number; // 0~100
  onChange: (next: number) => void; // 매 키 입력마다 즉시 (범위 보정 없이, 빈 값은 0)
  onCommit?: (next: number) => void; // blur/제출 시 0~100으로 보정된 최종값
  onEditingChange?: (editing: boolean) => void;
  textStyle: TextStyle; // 문장 중간에 끼워 넣을 것이라 부모가 폰트를 그대로 넘겨준다
}

// "지출을 10% 줄여 저축하면"처럼 문장 중간에 들어가는 0~100 정수 입력.
// MoneyInput(원 단위 금액, 콤마 포맷, 연필 아이콘 + row 레이아웃)과는 쓰임새가 달라
// 그대로 재사용하지 않고, 탭→입력 전환이라는 상호작용 패턴만 같은 형태로 새로 만들었다.
export default function PercentInput({ value, onChange, onCommit, onEditingChange, textStyle }: Props) {
  const [editing, setEditing] = useState(false);
  const [rawText, setRawText] = useState('');

  const startEditing = () => {
    setRawText(String(value));
    setEditing(true);
    onEditingChange?.(true);
  };

  const handleChangeText = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 3); // 소수점/음수/문자 차단, 3자리까지
    const normalized = digitsOnly.replace(/^0+(?=\d)/, ''); // 앞자리 0 정리: "007" -> "7", "00" -> "0"
    const next = normalized === '' ? 0 : Number(normalized);
    if (next > 100) return; // 100을 넘기는 입력은 무시하고 이전 상태 그대로 유지
    setRawText(normalized);
    onChange(next);
  };

  const commit = () => {
    const n = rawText === '' ? 0 : Number(rawText);
    const clamped = Math.min(100, Math.max(0, n));
    setEditing(false);
    onEditingChange?.(false);
    onCommit?.(clamped);
  };

  if (editing) {
    return (
      <TextInput
        style={[textStyle, styles.input]}
        value={rawText}
        onChangeText={handleChangeText}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        autoFocus
        selectTextOnFocus
        maxLength={3}
      />
    );
  }

  return (
    <Pressable onPress={startEditing} hitSlop={6}>
      <Text style={[textStyle, styles.value]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // 탭 가능함을 알리는 표시 — 링크처럼 파란색 + 점선 밑줄. "%"와 나머지 문장은 그대로 검은색.
  value: {
    color: colors.primary,
    borderStyle: 'dotted',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  input: {
    width: 42, // 최대 3자리("100")에 맞춘 고정폭 — 넓으면 제목 줄이 두 줄로 밀린다
    textAlign: 'center',
    borderWidth: 0, // 웹에서 TextInput 기본 테두리가 진하게 보여서 전부 지우고 아래만 그린다
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 0,
    paddingHorizontal: 0,
    outlineWidth: 0, // 웹(react-native-web) 전용 — 포커스 시 브라우저 기본 아웃라인 제거
  },
});