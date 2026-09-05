import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../constants/colors';

const DOT_DURATION_MS = 900;

export default function TypingIndicator() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1,
      duration: DOT_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    }));
    animation.start();
    return () => animation.stop();
  }, [progress]);

  return <View style={styles.row} accessibilityLabel="답변을 준비하고 있어요">
    <View style={styles.avatar}>
      <MaterialCommunityIcons name="robot" size={24} color={colors.chatAccent} />
    </View>
    <View style={styles.column}>
      <Text style={styles.name}>자립동행 AI</Text>
      <View style={styles.bubble}>
        {[0, 1, 2].map(index => {
          const ranges = index === 0 ? [0, 0.12, 0.24, 1]
            : index === 1 ? [0, 0.22, 0.34, 0.46, 1]
              : [0, 0.44, 0.56, 0.68, 1];
          const values = index === 0 ? [0.35, 1, 0.35, 0.35] : [0.35, 0.35, 1, 0.35, 0.35];
          const offsets = index === 0 ? [0, -4, 0, 0] : [0, 0, -4, 0, 0];
          return <Animated.View key={index} style={[styles.dot, {
            opacity: progress.interpolate({
              inputRange: ranges,
              outputRange: values,
            }),
            transform: [{ translateY: progress.interpolate({
              inputRange: ranges,
              outputRange: offsets,
            }) }],
          }]} />;
        })}
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, gap: spacing.md },
  avatar: { width: 42, height: 42, borderRadius: radius.full, backgroundColor: colors.chatAvatar,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primaryLight },
  column: { alignItems: 'flex-start' },
  name: { fontSize: 14, lineHeight: 20, color: colors.textSecondary,
    marginLeft: spacing.xs, marginBottom: spacing.xs },
  bubble: { minWidth: 68, minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.lg,
    borderTopLeftRadius: 2, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    shadowColor: colors.chatShadow, shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  dot: { width: 7, height: 7, borderRadius: radius.full, backgroundColor: colors.chatAccent },
});
