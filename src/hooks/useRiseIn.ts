import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// 화면 진입 시 카드가 순서대로 살짝 떠오르며 나타나는 공용 애니메이션 훅.
// delay를 다르게 주면 여러 카드를 순서대로(staggered) 띄울 수 있다.
// (원래 놀이 탭 PlayScreen에만 있던 걸 홈 화면에도 똑같이 쓰려고 공용 훅으로 뺐다.)
export function useRiseIn(delay: number, trigger: boolean) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [trigger]);
  return {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };
}
