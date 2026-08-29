import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

interface Props {
  title?: string;
  showBack?: boolean; // 뒤로가기 화살표
  showProfile?: boolean; // 프로필 아이콘
}

// 모든 화면 상단에 공통으로 쓰는 앱 타이틀 바
export default function ScreenHeader({ title = '자립동행:D-1825', showBack = false, showProfile = true }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>
        {showProfile ? (
          <Pressable
            hitSlop={8}
            style={styles.profileButton}
            onPress={() => navigation.navigate('MyPage' as never)}
          >
            <Ionicons name="person" size={16} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: { width: 36, alignItems: 'flex-start', justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  profileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.graySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
