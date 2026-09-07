import type { HousingNoticeSummary, HousingTargetType } from '../../types/housing';

/** 공고 목록 정렬. 서버 정렬 API 전까지 클라이언트 mock */
export type NoticeSortMode = 'recommended' | 'title' | 'deadline';

export const NOTICE_SORT_OPTIONS: { value: NoticeSortMode; label: string }[] = [
  { value: 'recommended', label: '추천순' },
  { value: 'title', label: '가나다순' },
  { value: 'deadline', label: '마감임박' },
];

const TARGET_RANK: Record<HousingTargetType, number> = {
  SELF_RELIANCE: 0,
  YOUTH: 1,
  GENERAL: 2,
};

/** 백엔드 캘린더 기본 정렬과 동일: 자립준비청년 → 청년 → 일반, 그다음 시작일 */
function compareRecommended(a: HousingNoticeSummary, b: HousingNoticeSummary): number {
  const byTarget = TARGET_RANK[a.targetType] - TARGET_RANK[b.targetType];
  if (byTarget !== 0) return byTarget;
  return a.beginDate.localeCompare(b.beginDate) || a.id - b.id;
}

export function sortNotices(
  notices: HousingNoticeSummary[],
  mode: NoticeSortMode,
): HousingNoticeSummary[] {
  const list = [...notices];
  switch (mode) {
    case 'title':
      return list.sort(
        (a, b) => a.title.localeCompare(b.title, 'ko') || a.id - b.id,
      );
    case 'deadline':
      return list.sort(
        (a, b) => a.endDate.localeCompare(b.endDate) || a.id - b.id,
      );
    case 'recommended':
    default:
      return list.sort(compareRecommended);
  }
}
