export type CareChoice = 'ALREADY_DONE' | 'DIFFICULT' | 'CHANGED' | 'LATER';
export interface CareButtonRequest {
  choice: CareChoice; requestId: string; expectedDay?: number; expectedAmount?: number;
}
export interface CareFreeTextRequest { input: string; requestId: string; }
export interface CarePolicyCard {
  id: string; category: 'FINANCE' | 'EMPLOYMENT'; name: string; support: string;
  applicationPeriod: string; organization: string; detailUrl: string;
}
export interface CarePolicies {
  status: 'PENDING' | 'READY' | 'EMPTY' | 'ERROR'; cards: CarePolicyCard[];
}
export interface CareSignal {
  id: number; cycleId: number; name: string;
  type: 'MISSED_SAVING' | 'MISSED_PAYMENT' | 'INCOME_MISSING';
  status: 'OPEN' | 'RESOLVED'; responseResult: 'NORMAL_REASON' | 'NEEDS_CARE' | null;
  prompt: string; options: { value: CareChoice; label: string }[];
  expectedDate: string; expectedAmount: number | null; detectedAt: string; recheckAt: string;
  recheckedAt: string | null;
  referralEligible: boolean;
  referral: { id: number; status: 'REQUESTED' | 'CONTACTED'; reason: string; requestedAt: string } | null;
  replies: {
    policies: CarePolicies | null; id: number; inputType: 'BUTTON' | 'FREE_TEXT';
    choice: CareChoice | null; userText: string; reply: string | null;
    requestId: string; aiStatus: 'PENDING' | 'READY' | 'ERROR' | null; createdAt: string;
  }[];
}
export interface CareSummary {
  asOf: string; demoEnabled: boolean; hasSchedules: boolean; riskScore: number;
  riskLevel: 'NORMAL' | 'CARE' | 'HUMAN_CARE';
  cycles: {
    id: number; scheduleId: number; name: string; type: string;
    expectedDate: string; expectedAmount: number | null;
    status: 'PENDING' | 'DONE' | 'MISSED'; actualDate: string | null; actualAmount: number | null;
  }[];
  reminders: { cycleId: number; message: string }[];
  signals: CareSignal[];
}
