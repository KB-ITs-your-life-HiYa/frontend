import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radius, spacing } from '../../constants/colors';
import { mySubsidyApi, subsidyApi } from '../../services/benefit';
import type { SubsidySummary } from '../../types/benefit';

export default function AddSubsidyScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubsidySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  // 이미 등록된 지원금은 화면에 처음 들어왔을 때부터 "추가됨"으로 보이게 한다
  useEffect(() => {
    mySubsidyApi
      .list()
      .then((items) => setAddedIds(new Set(items.map((i) => i.subsidyId))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      subsidyApi
        .search(q)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const add = async (subsidyId: number) => {
    setAddedIds((prev) => new Set(prev).add(subsidyId));
    try {
      await mySubsidyApi.add(subsidyId);
    } catch {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(subsidyId);
        return next;
      });
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="지원금 추가"
        showBack
        showProfile={false}
        flat
        extraTopPadding={14}
        rightLabel="완료"
        onRightPress={() => navigation.navigate('MainTabs', { screen: 'Benefits' })}
      />
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="지원금 이름으로 검색"
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
          autoFocus
        />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.centerFill}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : query.trim().length === 0 ? (
          <Text style={styles.hintText}>지원금 이름을 검색해보세요</Text>
        ) : results.length === 0 ? (
          <Text style={styles.hintText}>검색 결과가 없어요</Text>
        ) : (
          results.map((item) => {
            const added = addedIds.has(item.subsidyId);
            return (
              <View key={item.subsidyId} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.orgName || item.regionLabel ? (
                    <Text style={styles.rowOrg}>{item.orgName ?? item.regionLabel}</Text>
                  ) : null}
                </View>
                <Pressable
                  style={[styles.addButton, added ? styles.addButtonDone : null]}
                  onPress={() => !added && add(item.subsidyId)}
                  disabled={added}
                >
                  <Text style={[styles.addButtonText, added ? styles.addButtonTextDone : null]}>
                    {added ? '추가됨' : '+ 추가'}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  searchWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.textPrimary,
  },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  centerFill: { alignItems: 'center', paddingVertical: spacing.xl },
  hintText: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.lg },
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
  addButton: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  addButtonDone: { backgroundColor: colors.graySoft },
  addButtonText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  addButtonTextDone: { color: colors.textTertiary },
});
