// 공통 타입 정의. 화면/기능이 늘어나면 파일을 나눠도 됩니다 (예: types/benefit.ts).

export interface UserProfile {
  id: string;
  name: string;
  protectionEndDate: string; // 보호종료일 (YYYY-MM-DD)
  allowanceEndDate: string; // 자립수당 종료 예정일 (YYYY-MM-DD)
  region?: string;
  incomeLevel?: string;
}

export interface Benefit {
  id: string;
  title: string;
  category: '주거' | '저축' | '생활비' | '교육' | '기타';
  matchRate?: number; // 0~100
  description: string;
  isEligible: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  type: 'benefit' | 'housing' | 'saving';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
