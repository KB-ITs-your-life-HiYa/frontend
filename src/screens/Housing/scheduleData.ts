// 주거지원 일정 — 홈/캘린더 화면 미리보기와 "전체보기" 화면에서 함께 사용하는 공용 데이터
// eligible: 판정 엔진이 사용자 프로필(보호종료일·거주지·소득 등) 기준으로 자동 확인한 지원 대상 충족 여부
export interface ScheduleItem {
  id: string;
  date: Date;
  weekday: string;
  place: string;
  title: string;
  eligible: boolean;
}

export const scheduleItems: ScheduleItem[] = [
  {
    id: '1',
    date: new Date(2026, 8, 8),
    weekday: '화요일',
    place: 'LH 청약센터',
    title: '청년 매입임대주택 지원 공고',
    eligible: true,
  },
  {
    id: '2',
    date: new Date(2026, 8, 23),
    weekday: '수요일',
    place: 'SH 인터넷청약',
    title: '행복주택 접수 마감',
    eligible: false,
  },
  {
    id: '3',
    date: new Date(2026, 8, 16),
    weekday: '수요일',
    place: '주민센터 방문/온라인',
    title: '주거급여 수급자 정기조사',
    eligible: true,
  },
  {
    id: '4',
    date: new Date(2026, 9, 23),
    weekday: '금요일',
    place: 'LH 청약센터',
    title: '전세임대주택 예비입주자 모집',
    eligible: true,
  },
  {
    id: '5',
    date: new Date(2026, 10, 7),
    weekday: '토요일',
    place: 'SH 인터넷청약',
    title: '청년안심주택 입주자 모집공고',
    eligible: false,
  },
];
