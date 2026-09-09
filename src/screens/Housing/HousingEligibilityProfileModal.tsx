import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CenterModal from '../../components/CenterModal';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';
import {
  HousingEligibilityProfile,
  HousingEligibilityProfileRequest,
  YouthPurchasePriorityBasis,
} from '../../types/housing';

type Props = {
  visible: boolean;
  profile: HousingEligibilityProfile | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (request: HousingEligibilityProfileRequest) => Promise<void>;
};

type ChoiceProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const PRIORITY_OPTIONS: { value: YouthPurchasePriorityBasis; label: string }[] = [
  { value: 'BENEFIT_RECIPIENT', label: '생계·의료·주거급여 수급자 가구입니다' },
  { value: 'SUPPORTED_SINGLE_PARENT', label: '지원 대상 한부모가족입니다' },
  { value: 'NEAR_POVERTY', label: '차상위계층 가구입니다' },
  { value: 'NONE', label: '위 항목에 해당하지 않습니다' },
];

function Choice({ label, selected, onPress }: ChoiceProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={selected ? colors.primary : colors.textTertiary}
      />
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function HousingEligibilityProfileModal({
  visible,
  profile,
  saving,
  error,
  onClose,
  onSave,
}: Props) {
  const [isHomeless, setIsHomeless] = useState<boolean | null>(null);
  const [isMarried, setIsMarried] = useState<boolean | null>(null);
  const [youthPurchasePriorityBasis, setYouthPurchasePriorityBasis] =
    useState<YouthPurchasePriorityBasis | null>(null);

  useEffect(() => {
    if (!visible) return;
    setIsHomeless(profile?.isHomeless ?? null);
    setIsMarried(profile?.isMarried ?? null);
    setYouthPurchasePriorityBasis(profile?.youthPurchasePriorityBasis ?? null);
  }, [visible, profile]);

  const complete =
    isHomeless !== null && isMarried !== null && youthPurchasePriorityBasis !== null;

  return (
    <CenterModal visible={visible} onClose={saving ? () => {} : onClose} contentStyle={styles.modal}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{profile ? '내 자격 정보 수정' : '내 자격 정보 입력'}</Text>
            <Text style={styles.description}>한 번 저장하면 다른 주거 공고에도 사용됩니다.</Text>
          </View>
          <Pressable accessibilityLabel="닫기" disabled={saving} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.question} accessibilityRole="radiogroup">
          <Text style={styles.questionTitle}>본인 명의 주택을 소유하고 있나요?</Text>
          <Choice label="아니요, 무주택입니다" selected={isHomeless === true} onPress={() => setIsHomeless(true)} />
          <Choice label="네, 주택을 보유하고 있습니다" selected={isHomeless === false} onPress={() => setIsHomeless(false)} />
        </View>

        <View style={styles.question} accessibilityRole="radiogroup">
          <Text style={styles.questionTitle}>현재 혼인 중인가요?</Text>
          <Choice label="아니요, 혼인 중이 아닙니다" selected={isMarried === false} onPress={() => setIsMarried(false)} />
          <Choice label="네, 혼인 중입니다" selected={isMarried === true} onPress={() => setIsMarried(true)} />
        </View>

        <View style={styles.question} accessibilityRole="radiogroup">
          <View style={styles.questionHeading}>
            <Text style={styles.questionTitle}>청년 매입임대 1순위 조건에 해당하나요?</Text>
            <Text style={styles.questionDescription}>아래에서 본인 가구에 해당하는 항목을 선택해주세요.</Text>
          </View>
          {PRIORITY_OPTIONS.map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              selected={youthPurchasePriorityBasis === option.value}
              onPress={() => setYouthPurchasePriorityBasis(option.value)}
            />
          ))}
        </View>

        <Text style={styles.note}>입력한 정보에 따른 참고 결과이며, 최종 자격은 공고 기관에서 심사합니다.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={saving ? '저장 중...' : '저장하기'}
          disabled={!complete || saving}
          onPress={() => {
            if (
              isHomeless === null ||
              isMarried === null ||
              youthPurchasePriorityBasis === null
            ) return;
            void onSave({ isHomeless, isMarried, youthPurchasePriorityBasis });
          }}
        />
        {saving ? <ActivityIndicator color={colors.primary} /> : null}
      </ScrollView>
    </CenterModal>
  );
}

const styles = StyleSheet.create({
  modal: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  content: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headerText: { flex: 1, gap: spacing.xs },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  description: { fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  question: { gap: spacing.sm },
  questionHeading: { gap: spacing.xs },
  questionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  questionDescription: { fontSize: 12, lineHeight: 18, color: colors.textTertiary },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  choiceSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  choiceText: { flex: 1, fontSize: 14, color: colors.textSecondary },
  choiceTextSelected: { color: colors.primary, fontWeight: '700' },
  note: { fontSize: 12, lineHeight: 18, color: colors.textTertiary },
  error: { fontSize: 13, lineHeight: 19, color: colors.danger },
});
