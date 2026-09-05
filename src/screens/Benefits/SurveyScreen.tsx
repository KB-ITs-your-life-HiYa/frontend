import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import ToggleRow from '../../components/ToggleRow';
import { colors, radius, spacing } from '../../constants/colors';
import { surveyApi } from '../../services/benefit';
import type { EmploymentStatus, HousingType, SurveyTag } from '../../types/benefit';

interface Props {
  onComplete: () => void;
}

const TOTAL_STEPS = 4;

const HOUSEHOLD_OPTIONS = [1, 2, 3, 4, 5, 6]; // 6 = "6인 이상"

// 2026년 기준중위소득 100% 기준액(월). 6인 이상은 6인 값을 그대로 쓴다
const INCOME_BASE_BY_HOUSEHOLD: Record<number, number> = {
  1: 2564238,
  2: 4199292,
  3: 5359036,
  4: 6494738,
  5: 7556719,
  6: 8555952,
};

const INCOME_BRACKETS: { value: number; note?: string }[] = [
  { value: 32, note: '생계급여 수준' },
  { value: 48, note: '주거급여 수준' },
  { value: 50, note: '교육급여 수준' },
  { value: 60 },
  { value: 100 },
  { value: 120 },
  { value: 150, note: '청년월세 등' },
];

function incomeAmountLabel(pct: number, householdSize: number | null, note?: string): string {
  const base = INCOME_BASE_BY_HOUSEHOLD[householdSize ?? 1];
  const amount = Math.round(base * (pct / 100));
  const noteText = note ? ` — ${note}` : '';
  return `약 ${amount.toLocaleString()}원 이하 (${pct}% 이하${noteText})`;
}

const EMPLOYMENT_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: 'EMPLOYED', label: '재직 중' },
  { value: 'SELF_EMPLOYED', label: '자영업' },
  { value: 'STUDENT', label: '재학 중' },
  { value: 'JOB_SEEKER', label: '취업준비생' },
  { value: 'UNEMPLOYED', label: '무직' },
];

const HOUSING_OPTIONS: { value: HousingType; label: string }[] = [
  { value: 'OWNED', label: '자가' },
  { value: 'JEONSE', label: '전세' },
  { value: 'MONTHLY_RENT', label: '월세' },
  { value: 'FREE', label: '무상거주' },
  { value: 'SELF_RELIANCE_HOUSE', label: '자립생활관 등' },
  { value: 'PUBLIC_RENTAL', label: '공공임대' },
];

const TAG_OPTIONS: { value: SurveyTag; label: string }[] = [
  { value: 'SINGLE_PARENT', label: '한부모 가정' },
  { value: 'MULTICULTURAL', label: '다문화 가정' },
  { value: 'DISABILITY', label: '장애가 있어요' },
  { value: 'MULTI_CHILD', label: '다자녀 가정' },
  { value: 'SEVERE_ILLNESS', label: '중증질환이 있어요' },
  { value: 'NORTH_KOREAN_DEFECTOR', label: '북한이탈주민' },
  { value: 'GRANDPARENT_FAMILY', label: '조손가정' },
];

export default function SurveyScreen({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [householdSize, setHouseholdSize] = useState<number | null>(null);
  const [isBenefitRecipient, setIsBenefitRecipient] = useState(false);

  const [incomeBracket, setIncomeBracket] = useState<number | null>(null);
  const [incomeUnknown, setIncomeUnknown] = useState(false);

  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | null>(null);
  const [housingType, setHousingType] = useState<HousingType | null>(null);

  const [tags, setTags] = useState<SurveyTag[]>([]);

  const toggleTag = (tag: SurveyTag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const goNext = () => {
    if (step === 1 && householdSize === null) {
      Alert.alert('가구원 수를 선택해주세요', '다음 단계에서 소득 구간별 금액을 보여드리려면 필요해요');
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      submit();
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await surveyApi.save({
        householdSize,
        incomePctBracket: incomeUnknown ? null : incomeBracket,
        isBenefitRecipient,
        employmentStatus,
        housingType,
        tags,
      });
      onComplete();
    } catch (e) {
      Alert.alert('저장 실패', '설문을 저장하지 못했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="지원금 매칭 설문" showBack={step > 1} flat />
      <View style={styles.progressWrap}>
        <ProgressBar progress={step / TOTAL_STEPS} />
        <Text style={styles.stepLabel}>{step} / {TOTAL_STEPS}</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {step === 1 ? (
          <StepSection title="가구 정보를 알려주세요" subtitle="본인을 포함한 가구원 수예요">
            <OptionGrid>
              {HOUSEHOLD_OPTIONS.map((n) => (
                <OptionChip
                  key={n}
                  label={n === 6 ? '6인 이상' : `${n}인`}
                  selected={householdSize === n}
                  onPress={() => setHouseholdSize(n)}
                />
              ))}
            </OptionGrid>
            <Card style={styles.toggleCard}>
              <ToggleRow
                title="기초생활수급자 등에 해당해요"
                description="국민기초생활보장, 차상위 등에 해당하면 켜주세요"
                value={isBenefitRecipient}
                onValueChange={setIsBenefitRecipient}
              />
            </Card>
          </StepSection>
        ) : null}

        {step === 2 ? (
          <StepSection title="소득 정보" subtitle="가구원 전체의 월 소득 합계는 어느 구간인가요?">
            <View style={styles.incomeList}>
              {INCOME_BRACKETS.map((opt) => (
                <IncomeOptionRow
                  key={opt.value}
                  label={incomeAmountLabel(opt.value, householdSize, opt.note)}
                  selected={!incomeUnknown && incomeBracket === opt.value}
                  onPress={() => {
                    setIncomeBracket(opt.value);
                    setIncomeUnknown(false);
                  }}
                />
              ))}
              <IncomeOptionRow
                label="그 이상"
                selected={!incomeUnknown && incomeBracket === 999}
                onPress={() => {
                  setIncomeBracket(999);
                  setIncomeUnknown(false);
                }}
              />
              <IncomeOptionRow
                label="모르겠어요 / 나중에 확인"
                selected={incomeUnknown}
                onPress={() => {
                  setIncomeBracket(null);
                  setIncomeUnknown(true);
                }}
              />
            </View>
          </StepSection>
        ) : null}

        {step === 3 ? (
          <StepSection title="재직·주거 정보를 알려주세요">
            <Text style={styles.groupLabel}>현재 재직 상태</Text>
            <OptionGrid>
              {EMPLOYMENT_OPTIONS.map((opt) => (
                <OptionChip
                  key={opt.value}
                  label={opt.label}
                  selected={employmentStatus === opt.value}
                  onPress={() => setEmploymentStatus(opt.value)}
                />
              ))}
            </OptionGrid>
            <Text style={styles.groupHint}>* 취업준비생: 고교·대학 졸업(중퇴) 후 2년 이내 구직 중인 경우</Text>
            <Text style={[styles.groupLabel, { marginTop: spacing.md }]}>현재 주거 형태</Text>
            <OptionGrid>
              {HOUSING_OPTIONS.map((opt) => (
                <OptionChip
                  key={opt.value}
                  label={opt.label}
                  selected={housingType === opt.value}
                  onPress={() => setHousingType(opt.value)}
                />
              ))}
            </OptionGrid>
          </StepSection>
        ) : null}

        {step === 4 ? (
          <StepSection title="해당하는 특성이 있나요?" subtitle="해당하는 항목만 골라주세요. 없으면 그냥 다음으로 넘어가도 돼요">
            <OptionGrid>
              {TAG_OPTIONS.map((opt) => (
                <OptionChip
                  key={opt.value}
                  label={opt.label}
                  selected={tags.includes(opt.value)}
                  onPress={() => toggleTag(opt.value)}
                />
              ))}
            </OptionGrid>
          </StepSection>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 ? (
          <Button label="이전" variant="secondary" style={styles.footerBackBtn} onPress={goBack} />
        ) : null}
        <Button
          label={submitting ? '저장 중...' : step < TOTAL_STEPS ? '다음' : '완료'}
          style={styles.footerNextBtn}
          onPress={goNext}
        />
      </View>
    </View>
  );
}

function StepSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.stepSection}>
      <Text style={styles.stepTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function OptionGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.optionGrid}>{children}</View>;
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionChip, selected ? styles.optionChipSelected : null]}
    >
      <Text style={[styles.optionChipText, selected ? styles.optionChipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function IncomeOptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.incomeRow, selected ? styles.incomeRowSelected : null]}
    >
      <Text style={[styles.incomeRowText, selected ? styles.incomeRowTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  progressWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs, gap: 6 },
  stepLabel: { fontSize: 12, color: colors.textTertiary, textAlign: 'right' },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  stepSection: { gap: spacing.sm },
  stepTitle: { fontSize: 19, fontWeight: '800', color: colors.textPrimary },
  stepSubtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  groupLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  groupHint: { fontSize: 11, color: colors.textTertiary, marginTop: 4 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  optionChipTextSelected: { color: colors.white },
  toggleCard: { marginTop: spacing.md },
  incomeList: { gap: spacing.sm, marginTop: spacing.xs },
  incomeRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  incomeRowSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  incomeRowText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  incomeRowTextSelected: { color: colors.white },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  footerBackBtn: { flex: 1 },
  footerNextBtn: { flex: 2 },
});
