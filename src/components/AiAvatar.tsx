import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, radius } from '../constants/colors';

type Props = {
  variant: 'message' | 'popup';
};

export default function AiAvatar({ variant }: Props) {
  return (
    <View style={variant === 'popup' ? styles.popup : styles.message}>
      <Image
        accessible={false}
        resizeMode="cover"
        source={require('../../assets/chat-avatar.jpeg')}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  message: {
    width: 42,
    height: 42,
    overflow: 'hidden',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  popup: {
    width: 66,
    height: 66,
    overflow: 'hidden',
    borderRadius: 16,
  },
});
