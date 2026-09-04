import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import { colors, spacing } from '../../constants/colors';
import { Notification, notifications } from './notificationData';
import SettlementFundModal from './SettlementFundModal';

export default function NotificationsScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="알림" showBack showProfile={false} flat extraTopPadding={14} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <Text style={styles.empty}>새 알림이 없어요</Text>
        ) : (
          notifications.map((item) => (
            <NotificationCard key={item.id} item={item} onPress={() => setModalVisible(true)} />
          ))
        )}
      </ScrollView>
      <SettlementFundModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

function NotificationCard({ item, onPress }: { item: Notification; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.dot} />
        <View style={styles.iconCircle}>
          <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingTop: spacing.xl, gap: spacing.sm, paddingBottom: spacing.xl },
  empty: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl },
  card: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.md + 6 },
  dot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.graySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 6 },
  title: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, lineHeight: 20 },
  body: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  time: { fontSize: 11, color: colors.textTertiary },
});