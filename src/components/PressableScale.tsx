import React, { useRef } from 'react';
import { Animated, GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface Props extends Omit<PressableProps, 'style'> {
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

// 눌렀을 때 살짝 눌리는 느낌(스케일 다운)을 주는 Pressable 래퍼.
// 놀이 탭처럼 카드/버튼을 많이 누르는 화면에서 "탭이 실제로 반응했다"는
// 촉각적 피드백을 주기 위해 만들었다. 시각 스타일(배경/테두리/패딩 등)은
// 안쪽 Animated.View가 들고 있어서, 기존 <Pressable style={...}> 자리에
// 그대로 바꿔 끼우면 된다.
export default function PressableScale({ scaleTo = 0.97, style, children, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
    onPressIn?.(e);
  };
  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
