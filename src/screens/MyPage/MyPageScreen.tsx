import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ListRow from '../../components/ListRow';
import ToggleRow from '../../components/ToggleRow';
import { colors, spacing } from '../../constants/colors';

// 마이 화면 — 프로필, 알림 설정, 고객지원
// 상세 케어 대시보드는 screens/Care/CareScreen.tsx, 교육 콘텐츠는 screens/Education/EducationScreen.tsx 참고
// (필요 시 이 화면에서 스택 네비게이션으로 연결하세요)
export default function MyPageScreen() {
  const [careConsent, setCareConsent] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="자립동행: D-1825" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable>
          <Card style={styles.profileCard}>
            <View>
              <Text style={styles.name}>김동행</Text>
              <View style={{ marginTop: 8 }}>
                <Badge label="자립수당 종료까지 D-1,647" tone="primary" />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Card>
        </Pressable>

        <Card style={styles.groupCard}>
          <ListRow icon="person-outline" label="내 정보 관리" onPress={() => {}} />
          <View style={styles.divider} />
          <ListRow icon="business-outline" label="계좌 연결 관리" onPress={() => {}} />
        </Card>

        <Text style={styles.sectionLabel}>알림 설정</Text>
        <Card style={styles.groupCard}>
          <ToggleRow
            title="담당자 연계 동의"
            description="위기 신호 감지 시 담당자에게 알림 전송"
            infoIcon
            value={careConsent}
            onValueChange={setCareConsent}
          />
          <View style={styles.divider} />
          <ToggleRow title="앱 푸시 알림" value={pushEnabled} onValueChange={setPushEnabled} />
        </Card>

        <Text style={styles.sectionLabel}>고객지원</Text>
        <Card style={styles.groupCard}>
          <ListRow icon="headset-outline" label="고객센터" onPress={() => {}} />
          <View style={styles.divider} />
          <ListRow icon="document-text-outline" label="약관 및 정책" onPress={() => {}} />
          <View style={styles.divider} />
          <ListRow label="앱 버전" value="v1.2.0" showChevron={false} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  profileCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  groupCard: { paddingVertical: 4 },
  divider: { height: 1, backgroundColor: colors.border },
  sectionLabel: { fontSize: 12, color: colors.textTertiary, marginTop: spacing.xs, marginLeft: 2 },
});
