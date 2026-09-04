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

/** 자격 단계. 백엔드 EligibilityTier 와 같은 값 */
export type EligibilityTier = 'SELF_RELIANCE' | 'YOUTH' | 'GENERAL';

/** GET /members/me 응답. 로그인 응답 안의 member 와 같은 모양 */
export interface Member {
  memberId: number;
  email: string;
  age: number;
  tier: EligibilityTier;
  tierLabel: string;
  daysUntilSupportEnd: number | null;
}

/** POST /auth/login 응답 */
export interface LoginResponse {
  token: string;
  member: Member;
}

/** GET /members/me/accounts/summary 응답 */
export interface AccountSummary {
  depositTotal: number;
  savingsTotal: number;
  netAsset: number;
}

export type AccountType = 'DEPOSIT' | 'SAVINGS';

/** GET /members/me/accounts?type=... 응답의 계좌 항목 */
export interface AccountItem {
  bankName: string;
  accountType: AccountType;
  balance: number;
}

/** GET /members/me/accounts?type=... 응답 */
export interface AccountListResponse {
  accountType: AccountType;
  totalBalance: number;
  accounts: AccountItem[];
}