import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, radius, spacing } from '../../constants/colors';
import { mySubsidyApi } from '../../services/benefit';
import type { SubsidySummary } from '../../types/benefit';

export default function MySubsidiesScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<SubsidySummary[] | null>(null);

  const load = useCallback(() => {
    mySubsidyApi.list().then(setItems).catch(() => setItems([]));
  }, []);

  // 추가 화면 다녀온 뒤 이 화면으로 돌아올 때마다 새로 불러온다
  useFocusEffect(load);

  const remove = async (subsidyId: number) => {
    setItems((prev) => (prev ?? []).filter((i) => i.subsidyId !== subsidyId));
    try {
      await mySubsidyApi.remove(subsidyId);
    } catch {
      load(); // 실패하면 원래 상태로 복구
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="받고 있는 지원금" showBack showProfile={false} flat extraTopPadding={14} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {items === null ? (
          <View style={styles.centerFill}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : items.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 등록한 지원금이 없어요</Text>
          </Card>
        ) : (
          items.map((item) => (
            <View key={item.subsidyId} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{item.name}</Text>
                {item.orgName ? <Text style={styles.rowOrg}>{item.orgName}</Text> : null}
              </View>
              <Pressable
                style={styles.removeButton}
                onPress={() => remove(item.subsidyId)}
                accessibilityLabel="삭제"
              >
                <Ionicons name="close" size={16} color={colors.textTertiary} />
              </Pressable>
            </View>
          ))
        )}

        <Button
          label="+ 지원금 추가하기"
          variant="secondary"
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSubsidy')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  centerFill: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowText: { flex: 1, marginRight: spacing.sm },
  rowName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  rowOrg: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: { marginTop: spacing.sm },
});
