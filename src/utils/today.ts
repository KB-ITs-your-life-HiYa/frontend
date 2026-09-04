export const TODAY = new Date();

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// target - base 의 일수 차이 (자정 기준으로 계산해 시간대·시각 오차를 방지)
export function diffDays(target: Date, base: Date) {
  const t = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
  return Math.round((t - b) / 86400000);
}

export function formatMonthDay(date: Date) {
  return `${date.getMonth() + 1}.${date.getDate()}`;
}
