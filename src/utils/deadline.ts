// 지원금 신청기한 표시 형식을 통일한다.
//
// 원본 데이터가 정부24·복지로·온통청년 세 군데에서 각자 다르게 넘어와서
// "2026.05.04~2026.05.20", "20250102 ~ 20251205" 처럼 표기가 제각각이다.
// 날짜로 인식되는 부분만 "'26.5.4.(월)" 형식으로 다시 조립하고,
// 날짜를 못 찾으면("수시", "상시" 등) 원본 그대로 보여준다.

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

function formatOneDate(year: number, month: number, day: number): string | null {
  const date = new Date(year, month - 1, day);
  // 존재하지 않는 날짜(예: 02.30)면 원본을 못 믿는 것이니 포기한다
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  const yy = String(year).slice(-2);
  return `'${yy}.${month}.${day}.(${WEEKDAY_KO[date.getDay()]})`;
}

// "2026.05.04", "2026-05-04", "20260504" 형태를 모두 잡는다
const DATE_PATTERN = /(\d{4})[.\-]?(\d{2})[.\-]?(\d{2})/g;

export function formatApplyDeadline(raw: string | null | undefined): string | null {
  if (!raw) return raw ?? null;

  const matches = [...raw.matchAll(DATE_PATTERN)];
  if (matches.length === 0) return raw; // "수시"/"상시" 등 날짜가 없으면 원본 그대로

  const formatted = matches
    .slice(0, 2)
    .map((m) => formatOneDate(Number(m[1]), Number(m[2]), Number(m[3])))
    .filter((d): d is string => d !== null);

  if (formatted.length === 0) return raw; // 날짜처럼 보였는데 실제로는 유효하지 않으면 원본 유지
  return formatted.join(' ~ ');
}
