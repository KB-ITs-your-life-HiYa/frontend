import { HousingNoticeSummary, HousingTargetType } from '../../types/housing';
import { parseLocalDate } from './calendarDots';
import { diffDays, TODAY } from '../../utils/today';

const WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/** mock 자격. 실제 판정 API 붙기 전까지 targetType 으로만 나눈다 */
export type EligibilityMock = 'ok' | 'check' | 'no';

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
  /** mock 자격 결과 */
  eligibility: EligibilityMock;
};

export function weekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()];
}

export function kindLabel(kind: 'start' | 'end'): string {
  return kind === 'start' ? '접수 시작' : '접수 마감';
}

export function eligibilityLabel(status: EligibilityMock): string {
  if (status === 'ok') return '자격 충족';
  if (status === 'no') return '미충족';
  return '확인 필요';
}

/**
 * targetType 기반 mock.
 * - 자립준비청년 전용 → 충족
 * - 청년 트랙 → 추가 정보 필요
 * - 일반 → 미충족으로 보이게
 */
export function mockEligibility(targetType: HousingTargetType): EligibilityMock {
  if (targetType === 'SELF_RELIANCE') return 'ok';
  if (targetType === 'YOUTH') return 'check';
  return 'no';
}

/** 공고 목록 → 시작/마감 일정. 날짜 오름차순 */
export function buildScheduleEvents(notices: HousingNoticeSummary[]): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];
  for (const notice of notices) {
    const eligibility = mockEligibility(notice.targetType);
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
  return events.filter((e) => diffDays(e.date, from) >= 0);
}
