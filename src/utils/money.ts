// 큰 금액을 "13만원", "5천원" 처럼 단위로 축약한다. 1,000원 미만은 단위가 없어 별도 문구로 뺀다.
export function formatWonShort(amount: number): string {
  const abs = Math.abs(amount);

  if (abs >= 10000) {
    return `${Math.round(abs / 10000)}만원`;
  }
  if (abs >= 1000) {
    const cheonwon = Math.round(abs / 1000);
    return cheonwon >= 10 ? '1만원' : `${cheonwon}천원`;
  }
  return '1천원 미만';
}

// 축약 없이 전체 자릿수를 "480,000원" 형태로 표시한다.
export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}