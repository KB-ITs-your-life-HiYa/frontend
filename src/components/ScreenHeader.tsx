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
  showNotification?: boolean; // 알림 종 아이콘. 홈 화면에서만 켠다
  flat?: boolean; // 흰 배경·구분선 없이 화면 배경과 이어붙는 헤더. 타이틀도 검정 계열로
  extraTopPadding?: number; // SafeArea 위에 추가로 더 줄 여백
}

// 모든 화면 상단에 공통으로 쓰는 앱 타이틀 바
export default function ScreenHeader({
  title = '자립동행:D-1825',
  showBack = false,
  showProfile = true,
  showNotification = false,
  flat = false,
  extraTopPadding = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, flat ? styles.containerFlat : null, { paddingTop: insets.top + 10 + extraTopPadding }]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.title, flat ? styles.titleFlat : null]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>
        {showNotification ? (
          <Pressable
            hitSlop={8}
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
            <View style={styles.notificationDot} />
          </Pressable>
        ) : null}
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
  containerFlat: { backgroundColor: colors.background, borderBottomWidth: 0 },
  side: { width: 36, alignItems: 'flex-start', justifyContent: 'center' },
  sideRight: { width: 'auto', minWidth: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  titleFlat: { color: colors.textPrimary },
  profileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.graySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.white,
  },
});
