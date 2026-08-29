import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import SectionHeader from '../../components/SectionHeader';
import { colors, radius, spacing } from '../../constants/colors';

// 정부 지원금 매칭 화면
// TODO: services/api.ts 로 온통청년 API 매칭 결과를 받아와 교체
interface BenefitItem {
  id: string;
  category: string;
  matchRate: number;
  title: string;
  description: string;
  period: string;
  urgent?: boolean;
  // 정책별 신청 가이드: 지원 대상 / 지원 혜택 / 신청 방법
  guide: { target: string; benefit: string; method: string };
}

const currentBenefits = [
  { id: 'jarip', label: '자립정착금 (서울시)', current: 1000, total: 1500, unit: '만원', color: colors.primary },
  { id: 'allowance', label: '청년수당', current: 3, total: 6, unit: '개월', color: colors.warning },
];

const recommended: BenefitItem[] = [
  {
    id: '1',
    category: '금융/저축',
    matchRate: 95,
    title: '청년내일저축계좌',
    description: '근로소득이 있는 청년이 매월 10만원 저축 시 정부가 10~30만원을 추가로 지원하여 자산 형성을 돕는 제도',
    period: '신청기간: ~10.31',
    guide: {
      target: '만 19~34세, 최근 3개월 근로·사업소득이 있는 자립준비청년',
      benefit: '월 10만원 저축 시 정부지원금 10~30만원 추가 적립 (3년 만기)',
      method: '복지로 온라인 신청 → 서류 심사 → 계좌 개설 안내',
    },
  },
  {
    id: '2',
    category: '주거',
    matchRate: 88,
    title: '청년월세 특별지원',
    description: '경제적 어려움을 겪는 청년들의 주거비 부담을 덜어주기 위해 월 최대 20만원의 월세를 지원합니다',
    period: '상시 접수',
    guide: {
      target: '보증금 5천만원·월세 70만원 이하 주택에 거주하는 무주택 청년',
      benefit: '월 최대 20만원, 최장 12개월 월세 지원',
      method: '복지로/마이홈 온라인 신청 → 소득·재산 조사 → 지급',
    },
  },
  {
    id: '3',
    category: '생활/취업',
    matchRate: 75,
    title: '국민취업지원제도',
    description: '취업을 희망하는 청년에게 취업지원서비스를 종합적으로 제공하고, 생계안정을 위한 구직촉진수당을 지급',
    period: '마감 임박 (D-3)',
    urgent: true,
    guide: {
      target: '15~34세 미취업 청년 중 가구 소득·재산 기준을 충족하는 자',
      benefit: '구직촉진수당 월 50만원 (최대 6개월) + 취업지원 서비스',
      method: '고용24 온라인 신청 → 취업활동계획 수립 → 수당 지급',
    },
  },
];

const CATEGORIES = Array.from(new Set(recommended.map((item) => item.category)));

export default function BenefitsScreen() {
  const navigation = useNavigation<any>();
  const [activeCategories, setActiveCategories] = useState<string[]>(CATEGORIES);
  const [filterVisible, setFilterVisible] = useState(false);

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const filtered = recommended.filter((item) => activeCategories.includes(item.category));

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>선택한 카테고리에 해당하는 지원 정책이 없어요</Text>
          </Card>
        }
        ListHeaderComponent={
          <>
            <Text style={styles.heroTitle}>동행님께 딱 맞는 지원금을 찾았어요</Text>
            <Text style={styles.heroSubtitle}>현재 정책을 기반으로 매칭된 결과입니다.</Text>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>현재 수령 중인 지원금 2건</Text>
                <Text style={styles.summaryLink}>자세히 보기 &gt;</Text>
              </View>
              {currentBenefits.map((b) => (
                <View key={b.id} style={styles.progressBlock}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>{b.label}</Text>
                    <Text style={[styles.progressValue, { color: b.color }]}>
                      {b.current.toLocaleString()}
                      {b.unit} / {b.total.toLocaleString()}
                      {b.unit}
                    </Text>
                  </View>
                  <ProgressBar progress={b.current / b.total} color={b.color} />
                </View>
              ))}
            </Card>

            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <View style={styles.warningTextCol}>
                <Text style={styles.warningTitle}>중복수혜 확인이 필요해요</Text>
                <Text style={styles.warningDesc}>
                  새로운 지원금을 신청하기 전에 현재 받고 있는 혜택과 중복 수혜가 가능한지 꼭 확인하세요.
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <SectionHeader title="추천 지원 정책" />
              <Pressable
                onPress={() => setFilterVisible(true)}
                hitSlop={8}
                style={styles.filterIcon}
                accessibilityLabel="필터 설정"
              >
                <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardTopRow}>
              <Badge label={item.category} tone="primary" />
              <Badge label={`매칭률 ${item.matchRate}%`} tone="accent" icon="thumbs-up" />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.guideBox}>
              <GuideRow label="대상" value={item.guide.target} />
              <GuideRow label="혜택" value={item.guide.benefit} />
              <GuideRow label="신청" value={item.guide.method} />
            </View>
            <View style={styles.chatHintRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.textTertiary} />
              <Text style={styles.chatHintText}>궁금한 점은 챗봇에게 물어보세요</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={[styles.cardPeriod, item.urgent ? styles.cardPeriodUrgent : null]}>{item.period}</Text>
              <Pressable onPress={() => navigation.navigate('TopicDetail', { title: item.title })}>
                <Text style={styles.cardDetail}>상세보기→</Text>
              </Pressable>
            </View>
          </Card>
        )}
      />

      <Modal visible={filterVisible} transparent animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>카테고리 필터</Text>
            <Text style={styles.modalSubtitle}>보고 싶은 지원 정책 카테고리를 선택하세요</Text>
            <View style={styles.filterChipRow}>
              {CATEGORIES.map((cat) => {
                const active = activeCategories.includes(cat);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => toggleCategory(cat)}
                    style={[styles.filterChip, active ? styles.filterChipActive : null]}
                  >
                    {active ? <Ionicons name="checkmark" size={13} color={colors.white} style={{ marginRight: 4 }} /> : null}
                    <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.modalActionsRow}>
              <Button label="초기화" variant="secondary" style={{ flex: 1 }} onPress={() => setActiveCategories(CATEGORIES)} />
              <Button label="적용하기" style={{ flex: 1 }} onPress={() => setFilterVisible(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function GuideRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.guideRow}>
      <Text style={styles.guideLabel}>{label}</Text>
      <Text style={styles.guideValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  heroTitle: { fontSize: 19, fontWeight: '800', color: colors.textPrimary },
  heroSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
  summaryCard: { gap: spacing.sm, marginBottom: spacing.md },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  summaryLink: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  progressBlock: { marginTop: 4 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, color: colors.textSecondary },
  progressValue: { fontSize: 13, fontWeight: '700' },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningTextCol: { flex: 1 },
  warningTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  warningDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterIcon: { marginTop: spacing.sm },
  card: { gap: 6, marginBottom: spacing.md },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 6 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  guideBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: 4,
    gap: 5,
  },
  guideRow: { flexDirection: 'row', gap: spacing.sm },
  guideLabel: { width: 32, fontSize: 12, fontWeight: '700', color: colors.textTertiary },
  guideValue: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  chatHintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  chatHintText: { fontSize: 11, color: colors.textTertiary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  cardPeriod: { fontSize: 12, color: colors.textTertiary },
  cardPeriodUrgent: { color: colors.danger, fontWeight: '700' },
  cardDetail: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  modalSubtitle: { fontSize: 12, color: colors.textTertiary, marginBottom: spacing.sm },
  filterChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: colors.white },
  modalActionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
});
