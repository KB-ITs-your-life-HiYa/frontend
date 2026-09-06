import { TODAY } from '../utils/today';
import { CareSignalRequest, CounselorYouth } from '../types/counselor';

// 상담사 포털은 아직 목업 데이터로만 채운다(실제 API는 나중에). 그래도 데모에서
// "살아있는 데이터"처럼 보이도록, 고정 날짜 문자열 대신 TODAY 기준 상대값으로
// 만들어서 언제 시연해도 D-day·경과시간이 어색하지 않게 했다.
function daysAgoIso(days: number, hours = 0): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function daysAgoDate(days: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// ── 자립청년 목록 ────────────────────────────────────────────────
// D-day는 "보호종료일 + 1825일 - 오늘"과 같은 방식으로 daysUntilSupportEnd를 직접 정해서
// 시나리오별로 흩뿌렸다(여유/Д-365 임박/이미 초과 등). 실제 화면에서는 이 값을 그대로 쓴다.
export const mockYouths: CounselorYouth[] = [
  {
    id: 1,
    name: '김도윤',
    phone: '010-2841-7723',
    age: 20,
    gender: 'MALE',
    regionName: '경기도 수원시 팔달구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(550),
    daysUntilSupportEnd: 1275,
    settlementFundPaid: true,
    settlementFundPaidAt: daysAgoDate(540),
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: true, paidAt: daysAgoDate(55), amount: 350000 },
      { month: monthLabel(1), paid: true, paidAt: daysAgoDate(25), amount: 350000 },
      { month: monthLabel(0), paid: true, paidAt: daysAgoDate(3), amount: 350000 },
    ],
    riskLevel: 'NORMAL',
    memo: '자립 4개월차. 주거·저축 계획 순조롭게 진행 중.',
  },
  {
    id: 2,
    name: '이서윤',
    phone: '010-9034-1182',
    age: 22,
    gender: 'FEMALE',
    regionName: '인천광역시 미추홀구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(1645),
    daysUntilSupportEnd: 180,
    settlementFundPaid: true,
    settlementFundPaidAt: daysAgoDate(1630),
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: true, paidAt: daysAgoDate(58), amount: 350000 },
      { month: monthLabel(1), paid: true, paidAt: daysAgoDate(27), amount: 350000 },
      { month: monthLabel(0), paid: true, paidAt: daysAgoDate(2), amount: 350000 },
    ],
    riskLevel: 'CARE',
    memo: 'D-365 진입. 자립수당 종료 후 지출 계획 상담 필요.',
  },
  {
    id: 3,
    name: '박지훈',
    phone: '010-4471-9920',
    age: 24,
    gender: 'MALE',
    regionName: '서울특별시 관악구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(1780),
    daysUntilSupportEnd: 45,
    settlementFundPaid: true,
    settlementFundPaidAt: daysAgoDate(1765),
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: true, paidAt: daysAgoDate(56), amount: 350000 },
      { month: monthLabel(1), paid: false, paidAt: null, amount: 350000 },
      { month: monthLabel(0), paid: false, paidAt: null, amount: 350000 },
    ],
    riskLevel: 'HUMAN_CARE',
    memo: '2개월 연속 정기 납입 누락 + 연락 두절 3일째. 우선 관리 대상.',
  },
  {
    id: 4,
    name: '최하은',
    phone: '010-6602-3387',
    age: 19,
    gender: 'FEMALE',
    regionName: '부산광역시 해운대구',
    protectionStatus: 'IN_CARE',
    protectionEndDate: null,
    daysUntilSupportEnd: null,
    settlementFundPaid: false,
    settlementFundPaidAt: null,
    settlementFundAmount: 15000000,
    monthlyAllowances: [],
    riskLevel: 'NORMAL',
    memo: '보호종료 예정 6개월 전. 정착금·자립수당 사전 안내 완료.',
  },
  {
    id: 5,
    name: '정민재',
    phone: '010-7715-4468',
    age: 25,
    gender: 'MALE',
    regionName: '대전광역시 유성구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(2100),
    daysUntilSupportEnd: -275,
    settlementFundPaid: true,
    settlementFundPaidAt: daysAgoDate(2085),
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: false, paidAt: null, amount: 0 },
      { month: monthLabel(1), paid: false, paidAt: null, amount: 0 },
      { month: monthLabel(0), paid: false, paidAt: null, amount: 0 },
    ],
    riskLevel: 'NORMAL',
    memo: '자립수당 지급 종료. 정착 안정권 진입, 분기별 모니터링으로 전환.',
  },
  {
    id: 6,
    name: '한소율',
    phone: '010-3390-8815',
    age: 21,
    gender: 'FEMALE',
    regionName: '경기도 성남시 분당구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(920),
    daysUntilSupportEnd: 905,
    settlementFundPaid: true,
    settlementFundPaidAt: daysAgoDate(905),
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: true, paidAt: daysAgoDate(54), amount: 350000 },
      { month: monthLabel(1), paid: true, paidAt: daysAgoDate(24), amount: 350000 },
      { month: monthLabel(0), paid: true, paidAt: daysAgoDate(1), amount: 350000 },
    ],
    riskLevel: 'NORMAL',
    memo: '청년도약계좌 납입 꾸준. 특이사항 없음.',
  },
  {
    id: 7,
    name: '오태양',
    phone: '010-5528-6641',
    age: 23,
    gender: 'MALE',
    regionName: '광주광역시 북구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(1590),
    daysUntilSupportEnd: 235,
    settlementFundPaid: false,
    settlementFundPaidAt: null,
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: true, paidAt: daysAgoDate(57), amount: 350000 },
      { month: monthLabel(1), paid: true, paidAt: daysAgoDate(26), amount: 350000 },
      { month: monthLabel(0), paid: true, paidAt: daysAgoDate(4), amount: 350000 },
    ],
    riskLevel: 'CARE',
    memo: '자립정착금 미신청 상태. 신청 안내 필요.',
  },
  {
    id: 8,
    name: '임수아',
    phone: '010-8843-2256',
    age: 26,
    gender: 'FEMALE',
    regionName: '대구광역시 수성구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(1220),
    daysUntilSupportEnd: 605,
    settlementFundPaid: true,
    settlementFundPaidAt: daysAgoDate(1205),
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: true, paidAt: daysAgoDate(55), amount: 350000 },
      { month: monthLabel(1), paid: true, paidAt: daysAgoDate(25), amount: 350000 },
      { month: monthLabel(0), paid: true, paidAt: daysAgoDate(2), amount: 350000 },
    ],
    riskLevel: 'NORMAL',
    memo: '취업 후 소득 발생. 자산 형성 상담 1회 완료.',
  },
];

function monthLabel(monthsAgo: number): string {
  const d = new Date(TODAY);
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── 온라인 케어 시스템 · 이상징후 스택 ────────────────────────────
// youthId로 위 mockYouths와 연결해서, 상세를 열면 같은 청년의 정보를 그대로 보여줄 수 있게 했다.
export const mockCareSignals: CareSignalRequest[] = [
  {
    id: 101,
    youthId: 3,
    requesterName: '박지훈',
    phone: '010-4471-9920',
    age: 24,
    regionName: '서울특별시 관악구',
    protectionStatus: 'ENDED',
    status: 'REQUESTED',
    aiRiskLevel: 'HUMAN_CARE',
    reason: '2개월 연속 정기 저축 납입 누락 + 앱 미접속 3일. AI 대화 응답 없음.',
    requestedAt: daysAgoIso(0, 2),
    contactedAt: null,
    closedAt: null,
  },
  {
    id: 102,
    youthId: 7,
    requesterName: '오태양',
    phone: '010-5528-6641',
    age: 23,
    regionName: '광주광역시 북구',
    protectionStatus: 'ENDED',
    status: 'REQUESTED',
    aiRiskLevel: 'CARE',
    reason: '자립정착금 미신청 상태가 3개월째 지속. 안내 후에도 미신청.',
    requestedAt: daysAgoIso(0, 6),
    contactedAt: null,
    closedAt: null,
  },
  {
    id: 103,
    youthId: 2,
    requesterName: '이서윤',
    phone: '010-9034-1182',
    age: 22,
    regionName: '인천광역시 미추홀구',
    protectionStatus: 'ENDED',
    status: 'CONTACTED',
    aiRiskLevel: 'CARE',
    reason: 'D-365 진입 후 소비 패턴 급변(생활비 지출 62% 증가) 감지.',
    requestedAt: daysAgoIso(1, 3),
    contactedAt: daysAgoIso(0, 20),
    closedAt: null,
  },
  {
    id: 104,
    youthId: 9,
    requesterName: '서지안',
    phone: '010-1129-7743',
    age: 20,
    regionName: '경기도 안산시 단원구',
    protectionStatus: 'ENDED',
    status: 'CONTACTED',
    aiRiskLevel: 'HUMAN_CARE',
    reason: '월세 자동이체 2회 연속 실패. 잔액 급감(전월 대비 -84%) 감지.',
    requestedAt: daysAgoIso(2, 0),
    contactedAt: daysAgoIso(1, 5),
    closedAt: null,
  },
  {
    id: 105,
    youthId: 10,
    requesterName: '문가을',
    phone: '010-3357-8801',
    age: 21,
    regionName: '경상남도 창원시 성산구',
    protectionStatus: 'ENDED',
    status: 'CLOSED',
    aiRiskLevel: 'CARE',
    reason: '앱 접속 주기 급감(평소 대비 12일 미접속) 감지.',
    requestedAt: daysAgoIso(6, 0),
    contactedAt: daysAgoIso(5, 4),
    closedAt: daysAgoIso(3, 0),
  },
  {
    id: 106,
    youthId: 6,
    requesterName: '한소율',
    phone: '010-3390-8815',
    age: 21,
    regionName: '경기도 성남시 분당구',
    protectionStatus: 'ENDED',
    status: 'CLOSED',
    aiRiskLevel: 'NORMAL',
    reason: '정기 납입 1회 지연(3일). 단순 이체일 착오로 확인.',
    requestedAt: daysAgoIso(9, 0),
    contactedAt: daysAgoIso(8, 6),
    closedAt: daysAgoIso(8, 1),
  },
  {
    id: 107,
    youthId: 8,
    requesterName: '임수아',
    phone: '010-8843-2256',
    age: 26,
    regionName: '대구광역시 수성구',
    protectionStatus: 'ENDED',
    status: 'CANCELLED',
    aiRiskLevel: 'NORMAL',
    reason: '거래 변동폭 이상 감지였으나 본인 확인 결과 정상 소비(이사 비용).',
    requestedAt: daysAgoIso(11, 0),
    contactedAt: null,
    closedAt: null,
  },
];

// 케어 신호에서 참조하지만 mockYouths에 없는 두 명(서지안·문가을)도 목록에서 바로
// 상세를 볼 수 있도록 채워둔다.
mockYouths.push(
  {
    id: 9,
    name: '서지안',
    phone: '010-1129-7743',
    age: 20,
    gender: 'FEMALE',
    regionName: '경기도 안산시 단원구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(1400),
    daysUntilSupportEnd: 425,
    settlementFundPaid: true,
    settlementFundPaidAt: daysAgoDate(1385),
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: true, paidAt: daysAgoDate(53), amount: 350000 },
      { month: monthLabel(1), paid: true, paidAt: daysAgoDate(23), amount: 350000 },
      { month: monthLabel(0), paid: false, paidAt: null, amount: 350000 },
    ],
    riskLevel: 'HUMAN_CARE',
    memo: '월세 자동이체 2회 연속 실패. 담당자 연락 시도 중.',
  },
  {
    id: 10,
    name: '문가을',
    phone: '010-3357-8801',
    age: 21,
    gender: 'FEMALE',
    regionName: '경상남도 창원시 성산구',
    protectionStatus: 'ENDED',
    protectionEndDate: daysAgoDate(980),
    daysUntilSupportEnd: 845,
    settlementFundPaid: true,
    settlementFundPaidAt: daysAgoDate(965),
    settlementFundAmount: 15000000,
    monthlyAllowances: [
      { month: monthLabel(2), paid: true, paidAt: daysAgoDate(50), amount: 350000 },
      { month: monthLabel(1), paid: true, paidAt: daysAgoDate(21), amount: 350000 },
      { month: monthLabel(0), paid: true, paidAt: daysAgoDate(5), amount: 350000 },
    ],
    riskLevel: 'NORMAL',
    memo: '미접속 건은 확인 후 종결. 이후 특이사항 없음.',
  }
);

export function findYouth(id: number): CounselorYouth | undefined {
  return mockYouths.find((y) => y.id === id);
}

export const COUNSELOR_DISPLAY_NAME = '김민지 상담사';
