import React from 'react';
import { Modal, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

// 화면 중앙에 뜨는 흰색 라운드 카드 모달의 공통 틀.
// 배경을 탭하면 닫히고, 카드 자체를 탭해도 배경으로 전파되지 않는다.
// 내용이 길어질 수 있는 화면은 children 을 ScrollView 로 감싸서 넣는다 —
// 카드 높이가 maxHeight 를 넘으면 그 안에서 스크롤된다.
export default function CenterModal({ visible, onClose, children, contentStyle }: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, contentStyle]} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    backgroundColor: colors.notificationBackdrop,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    maxHeight: '85%',
    overflow: 'hidden',
  },
});