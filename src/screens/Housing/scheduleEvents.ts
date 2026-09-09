import {
  HousingEligibilityStatus,
  HousingNoticeSummary,
  HousingTargetType,
} from '../../types/housing';
import { parseLocalDate } from './calendarDots';
import { diffDays, TODAY } from '../../utils/today';

const WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/** 주거지원 일정 한 줄. 공고의 접수 시작·마감이 각각 일정이 된다 */
export type ScheduleEvent = {
  id: string;
  noticeId: number;
  date: Date;
  kind: 'start' | 'end';
  title: string;
  institution: string;
  supplyType: string;
  targetType: HousingTargetType;
  eligibility: HousingEligibilityStatus;
  eligibilityPriority: number | null;
};

export function weekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()];
}

export function kindLabel(kind: 'start' | 'end'): string {
  return kind === 'start' ? '접수 시작' : '접수 마감';
}

export function eligibilityLabel(
  status: HousingEligibilityStatus,
  priority: number | null = null
): string {
  if (status === 'MATCH') {
    return priority == null ? '자격 충족' : `자격 충족 · ${priority}순위`;
  }
  if (status === 'NO_MATCH') return '미충족';
  return '확인 필요';
}

/** 공고 목록 → 시작/마감 일정. 날짜 오름차순 */
export function buildScheduleEvents(notices: HousingNoticeSummary[]): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];
  for (const notice of notices) {
    const eligibility = notice.eligibility.status;
    events.push({
      id: `${notice.id}-start`,
      noticeId: notice.id,
      date: parseLocalDate(notice.beginDate),
      kind: 'start',
      title: notice.title,
      institution: notice.institution,
      supplyType: notice.supplyType,
      targetType: notice.targetType,
      eligibility,
      eligibilityPriority: notice.eligibility.priority,
    });
    events.push({
      id: `${notice.id}-end`,
      noticeId: notice.id,
      date: parseLocalDate(notice.endDate),
      kind: 'end',
      title: notice.title,
      institution: notice.institution,
      supplyType: notice.supplyType,
      targetType: notice.targetType,
      eligibility,
      eligibilityPriority: notice.eligibility.priority,
    });
  }
  return events.sort((a, b) => {
    const byDate = diffDays(a.date, b.date);
    if (byDate !== 0) return byDate;
    if (a.kind === b.kind) return a.noticeId - b.noticeId;
    return a.kind === 'start' ? -1 : 1;
  });
}

/** 오늘 포함 이후 일정만 */
export function upcomingScheduleEvents(events: ScheduleEvent[], from: Date = TODAY): ScheduleEvent[] {
  return events
    .filter((event) => diffDays(event.date, from) >= 0)
    .sort((a, b) => {
      const aFirstPriority = a.eligibility === 'MATCH' && a.eligibilityPriority === 1;
      const bFirstPriority = b.eligibility === 'MATCH' && b.eligibilityPriority === 1;
      if (aFirstPriority !== bFirstPriority) return aFirstPriority ? -1 : 1;
      return 0;
    });
}
