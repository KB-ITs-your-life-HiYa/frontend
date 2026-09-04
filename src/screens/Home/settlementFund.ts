// 시도 코드별 자립정착금 · 지역명 매핑.
// homeRegionCode 는 지금은 2자리 시도 코드 그대로 들어오지만, 나중에 5자리 시군구 코드로
// 바뀌어도 깨지지 않도록 앞 2자리만 잘라서 쓴다.

const DEFAULT_SETTLEMENT_AMOUNT = 10_000_000;

const SETTLEMENT_AMOUNT_BY_SIDO: Record<string, number> = {
  '11': 20_000_000, // 서울
  '30': 15_000_000, // 대전
  '41': 15_000_000, // 경기
  '50': 15_000_000, // 제주
  '48': 12_000_000, // 경남
};

const SIDO_NAMES: Record<string, string> = {
  '11': '서울',
  '12': '전남광주',
  '26': '부산',
  '27': '대구',
  '28': '인천',
  '30': '대전',
  '31': '울산',
  '36': '세종',
  '41': '경기',
  '42': '강원',
  '43': '충북',
  '44': '충남',
  '45': '전북',
  '47': '경북',
  '48': '경남',
  '50': '제주',
};

function sidoCode(homeRegionCode: string | null | undefined): string | null {
  return homeRegionCode ? homeRegionCode.slice(0, 2) : null;
}

export function getSettlementAmount(homeRegionCode: string | null | undefined): number {
  const code = sidoCode(homeRegionCode);
  if (!code) return DEFAULT_SETTLEMENT_AMOUNT;
  return SETTLEMENT_AMOUNT_BY_SIDO[code] ?? DEFAULT_SETTLEMENT_AMOUNT;
}

export function getSidoName(homeRegionCode: string | null | undefined): string {
  const code = sidoCode(homeRegionCode);
  if (!code) return '거주지역';
  return SIDO_NAMES[code] ?? '거주지역';
}