// 실제 오늘 날짜 — 캘린더/일정 화면들이 공유하는 기준일 (기기의 현재 날짜를 그대로 사용)
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

// "D-1,647" 형식으로 표시. days 는 기준일까지 남은 일수 (음수면 이미 지난 것)
export function formatDday(days: number) {
  return `D-${days.toLocaleString('ko-KR')}`;
}
