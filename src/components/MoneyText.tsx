import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  amount: number;
  variant?: 'large' | 'medium';
  color?: string;
  animate?: boolean; // 기본 true — 숫자가 처음 나타나거나 바뀔 때 카운트업 애니메이션을 준다
}

// 금액 표시. 숫자와 "원"을 다른 크기·굵기로 분리해서 렌더링한다.
// animate가 true(기본값)면 값이 처음 나타나거나 바뀔 때 0(또는 이전 값)에서 실제 값까지
// 살짝 카운트업된다 — 홈 화면처럼 숫자 하나하나가 핵심 정보인 화면에서, 가만히 박혀 있는
// 숫자보다 "지금 막 계산됐다"는 느낌을 줘서 눈에 훨씬 잘 들어온다.
export default function MoneyText({ amount, variant = 'medium', color, animate = true }: Props) {
  const display = useCountUp(amount, animate);
  return (
    <Text>
      <Text style={[styles[variant].number, color ? { color } : null]}>{display.toLocaleString('ko-KR')}</Text>
      <Text style={[styles[variant].won, color ? { color } : null]}>원</Text>
    </Text>
  );
}

function useCountUp(target: number, enabled: boolean) {
  const [display, setDisplay] = useState(enabled ? 0 : target);
  const prevTargetRef = useRef(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      prevTargetRef.current = target;
      return;
    }
    const from = prevTargetRef.current;
    if (from === target) return;

    let raf = 0;
    const duration = 650;
    const start = Date.now();
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prevTargetRef.current = target;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, enabled]);

  return display;
}

const styles = {
  large: StyleSheet.create({
    number: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
    won: { fontSize: 19, fontWeight: '600', color: colors.textPrimary },
  }),
  medium: StyleSheet.create({
    number: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    won: { fontSize: 12, fontWeight: '500', color: colors.textPrimary },
  }),
} as const;
