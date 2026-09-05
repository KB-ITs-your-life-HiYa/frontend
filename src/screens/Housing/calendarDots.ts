import { HousingNoticeSummary } from '../../types/housing';
import { diffDays, isSameDay } from '../../utils/today';

/** 시안 점 색. 공고 id 기준으로 같은 공고 = 같은 색 */
export const NOTICE_DOT_COLORS = [
  '#3182F6', // blue
  '#00C896', // green
  '#8B5CF6', // purple
  '#FF9500', // amber
  '#F04452', // red
  '#005EB8', // deep blue
] as const;

export type CalendarDot = {
  noticeId: number;
  color: string;
  /** 속 찬 점 = 접수 시작, 속 빈 점 = 접수 마감 */
  kind: 'start' | 'end';
};

const MAX_VISIBLE_DOTS = 3;

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function colorForNoticeId(id: number): string {
  return NOTICE_DOT_COLORS[Math.abs(id) % NOTICE_DOT_COLORS.length];
}

/**
 * 그날 찍을 점 목록.
 * - 시작일 = 속 찬 점
 * - 마감일 = 속 빈 점
 * - 접수기간 14일 초과면 마감 7일 전에도 빈 점을 찍는다 (설계 4-1)
 */
export function getDotsForDate(date: Date, notices: HousingNoticeSummary[]): CalendarDot[] {
  const dots: CalendarDot[] = [];

  for (const notice of notices) {
    const begin = parseLocalDate(notice.beginDate);
    const end = parseLocalDate(notice.endDate);
    const color = colorForNoticeId(notice.id);
    const period = diffDays(end, begin);

    if (isSameDay(date, begin)) {
      dots.push({ noticeId: notice.id, color, kind: 'start' });
    }

    if (isSameDay(date, end)) {
      dots.push({ noticeId: notice.id, color, kind: 'end' });
    } else if (period > 14) {
      const earlyEnd = addDays(end, -7);
      if (isSameDay(date, earlyEnd) && !isSameDay(date, begin)) {
        dots.push({ noticeId: notice.id, color, kind: 'end' });
      }
    }
  }

  return dots;
}

/** 하루 최대 3개만 보이고 나머지는 +N */
export function visibleDots(dots: CalendarDot[]): { shown: CalendarDot[]; more: number } {
  if (dots.length <= MAX_VISIBLE_DOTS) {
    return { shown: dots, more: 0 };
  }
  return { shown: dots.slice(0, MAX_VISIBLE_DOTS), more: dots.length - MAX_VISIBLE_DOTS };
}

/** 선택한 날짜에 접수 중인 공고 (시작~마감 사이면 포함). 점은 시작·마감에만 찍지만 목록은 기간 전체 */
export function noticesOnDate(date: Date, notices: HousingNoticeSummary[]): HousingNoticeSummary[] {
  return notices.filter((n) => {
    const begin = parseLocalDate(n.beginDate);
    const end = parseLocalDate(n.endDate);
    return !isBeforeDay(date, begin) && !isAfterDay(date, end);
  });
}

function isBeforeDay(a: Date, b: Date): boolean {
  return diffDays(a, b) < 0;
}

function isAfterDay(a: Date, b: Date): boolean {
  return diffDays(a, b) > 0;
}

export { parseLocalDate };
