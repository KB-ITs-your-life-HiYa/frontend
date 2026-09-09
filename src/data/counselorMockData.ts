import { TODAY } from '../utils/today';
import { CareSignalRequest, CounselorYouth } from '../types/counselor';

// 실제 배정 청년 두 명에 없는 지급 이력과, 화면 밀도를 위한 목 청년 30명을 구성한다.
// 고정 날짜 문자열 대신 TODAY 기준 상대값으로 만들어 언제 시연해도 D-day가 자연스럽다.
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
const demoYouthProfiles: CounselorYouth[] = [
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
    id: 100101,
    youthId: 10003,
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
    source: 'MOCK',
  },
  {
    id: 100102,
    youthId: 10007,
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
    source: 'MOCK',
  },
  {
    id: 100103,
    youthId: 10004,
    requesterName: '최하은',
    phone: '010-6602-3387',
    age: 19,
    regionName: '부산광역시 해운대구',
    protectionStatus: 'IN_CARE',
    status: 'CONTACTED',
    aiRiskLevel: 'CARE',
    reason: 'D-365 진입 후 소비 패턴 급변(생활비 지출 62% 증가) 감지.',
    requestedAt: daysAgoIso(1, 3),
    contactedAt: daysAgoIso(0, 20),
    closedAt: null,
    source: 'MOCK',
  },
  {
    id: 100104,
    youthId: 10009,
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
    source: 'MOCK',
  },
  {
    id: 100105,
    youthId: 10010,
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
    source: 'MOCK',
  },
  {
    id: 100106,
    youthId: 10006,
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
    source: 'MOCK',
  },
  {
    id: 100107,
    youthId: 10008,
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
    source: 'MOCK',
  },
];

// 케어 신호에서 참조하지만 mockYouths에 없는 두 명(서지안·문가을)도 목록에서 바로
// 상세를 볼 수 있도록 채워둔다.
demoYouthProfiles.push(
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

const GENERATED_NAMES = [
  '강유진', '고은찬', '권나연', '김시우', '남예린', '노준서', '문채원', '박건우',
  '배하린', '서도현', '송지우', '신현우', '안서진', '양민호', '오하늘', '윤재희',
  '이건우', '임다은', '장민서', '전우진', '정세은', '조현준',
];

const GENERATED_REGIONS = [
  '서울특별시 강서구', '경기도 부천시 원미구', '인천광역시 남동구', '대전광역시 서구',
  '광주광역시 광산구', '부산광역시 부산진구', '대구광역시 달서구', '울산광역시 남구',
  '경기도 고양시 일산동구', '충청북도 청주시 흥덕구', '충청남도 천안시 서북구',
  '전북특별자치도 전주시 완산구', '전라남도 순천시', '경상북도 포항시 북구',
  '경상남도 김해시', '강원특별자치도 원주시', '제주특별자치도 제주시',
];

const curatedMockYouths = demoYouthProfiles.slice(2).map((youth) => ({
  ...youth,
  id: youth.id + 10000,
}));

const generatedMockYouths: CounselorYouth[] = GENERATED_NAMES.map((name, index) => {
  const protectionStatus = index % 7 === 0 ? 'IN_CARE' : 'ENDED';
  const daysSinceEnd = 280 + index * 73;
  const riskLevel = index % 9 === 0 ? 'HUMAN_CARE' : index % 4 === 0 ? 'CARE' : 'NORMAL';
  const allowancePaid = index % 6 !== 0;
  return {
    id: 10011 + index,
    name,
    phone: `010-${2100 + index * 137}-${4000 + index * 211}`,
    age: 19 + (index % 8),
    gender: index % 2 === 0 ? 'FEMALE' : 'MALE',
    regionName: GENERATED_REGIONS[index % GENERATED_REGIONS.length],
    protectionStatus,
    protectionEndDate: protectionStatus === 'ENDED' ? daysAgoDate(daysSinceEnd) : null,
    daysUntilSupportEnd: protectionStatus === 'ENDED' ? 1825 - daysSinceEnd : null,
    settlementFundPaid: protectionStatus === 'ENDED' && index % 5 !== 0,
    settlementFundPaidAt: protectionStatus === 'ENDED' && index % 5 !== 0
      ? daysAgoDate(daysSinceEnd - 14)
      : null,
    settlementFundAmount: 15000000,
    monthlyAllowances: protectionStatus === 'ENDED'
      ? [2, 1, 0].map((monthsAgo) => ({
          month: monthLabel(monthsAgo),
          paid: allowancePaid || monthsAgo > 0,
          paidAt: allowancePaid || monthsAgo > 0 ? daysAgoDate(3 + monthsAgo * 30) : null,
          amount: 500000,
        }))
      : [],
    riskLevel,
    memo: riskLevel === 'HUMAN_CARE'
      ? '최근 생활비 흐름에 이상징후가 있어 우선 확인이 필요합니다.'
      : riskLevel === 'CARE'
        ? '정기 확인 일정에 맞춰 생활 상황을 확인할 예정입니다.'
        : '최근 확인 결과 특이사항이 없습니다.',
  };
});

export const mockYouths: CounselorYouth[] = [...curatedMockYouths, ...generatedMockYouths];

export function findConnectedYouthDemo(id: number): CounselorYouth | undefined {
  return demoYouthProfiles.slice(0, 2).find((youth) => youth.id === id);
}

export function findYouth(id: number): CounselorYouth | undefined {
  return mockYouths.find((youth) => youth.id === id) ?? findConnectedYouthDemo(id);
}

export const COUNSELOR_DISPLAY_NAME = '김민지 상담사';
