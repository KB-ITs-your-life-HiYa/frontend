// 상담사(담당자) 포털 전용 타입. 지금은 전부 목업 데이터로 화면만 채우고,
// 실제 상담사 기능(이상징후 스택 API, 메시지 발송 API 등)은 백엔드에서 나중에 만든다.
// 그래서 여기 타입들은 백엔드 응답 모양이 아니라, 화면에 필요한 모양으로 자유롭게 정의했다.
// 나중에 API가 생기면 이 타입들을 실제 응답 DTO에 맞춰 바꾸면 된다.

/** 보호 상태. 백엔드 Member.protectionStatus 와 같은 값(IN_CARE=보호중, ENDED=보호종료) */
export type ProtectionStatusValue = 'IN_CARE' | 'ENDED';

export const PROTECTION_STATUS_LABEL: Record<ProtectionStatusValue, string> = {
  IN_CARE: '보호중',
  ENDED: '보호종료',
};

/** AI Care 위험도. 케어 탭(useCare)의 riskLevel과 같은 3단계를 그대로 재사용한다 —
 *  같은 위험도 개념을 화면마다 다른 척도로 보여주면 상담사가 혼란스러워하기 때문. */
export type AiRiskLevel = 'NORMAL' | 'CARE' | 'HUMAN_CARE';

export const RISK_LEVEL_META: Record<AiRiskLevel, { label: string; color: string; bg: string }> = {
  NORMAL: { label: '정상', color: '#00C896', bg: '#E4FBF3' },
  CARE: { label: '관찰 필요', color: '#FF9500', bg: '#FFF1E0' },
  HUMAN_CARE: { label: '긴급 케어', color: '#F04452', bg: '#FDECEC' },
};

/** 이상징후 스택(연계 요청)의 처리 상태 */
export type CareRequestStatus = 'REQUESTED' | 'CONTACTED' | 'CLOSED' | 'CANCELLED';

export const CARE_REQUEST_STATUS_META: Record<CareRequestStatus, { label: string; color: string; bg: string }> = {
  REQUESTED: { label: '신규', color: '#F04452', bg: '#FDECEC' },
  CONTACTED: { label: '상담 중', color: '#FF9500', bg: '#FFF1E0' },
  CLOSED: { label: '종결', color: '#00C896', bg: '#E4FBF3' },
  CANCELLED: { label: '취소', color: '#8B95A1', bg: '#EEF0F3' },
};

/** 이번 달 자립수당 지급 이력 한 달치 */
export interface AllowancePaymentRecord {
  month: string; // YYYY-MM
  paid: boolean;
  paidAt: string | null; // ISO. 미지급이면 null
  amount: number;
}

/** 자립청년 개별 관리 화면에서 다루는 청년 한 명 */
export interface CounselorYouth {
  id: number;
  name: string;
  phone: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  regionName: string; // 거주 지역(시/군/구까지)
  protectionStatus: ProtectionStatusValue;
  protectionEndDate: string | null; // YYYY-MM-DD. 보호중이면 null
  daysUntilSupportEnd: number | null; // D-1825 기준 남은 일수. 보호중이면 null
  settlementFundPaid: boolean; // 자립정착금 지급 여부
  settlementFundPaidAt: string | null; // YYYY-MM-DD
  settlementFundAmount: number;
  monthlyAllowances: AllowancePaymentRecord[]; // 최근 3개월, 오래된 순
  riskLevel: AiRiskLevel;
  memo: string; // 담당자가 남긴 메모
}

/** 이상징후 스택(온라인 케어 시스템)의 연계 요청 한 건 */
export interface CareSignalRequest {
  id: number;
  youthId: number; // CounselorYouth.id 와 연결
  requesterName: string;
  phone: string;
  age: number;
  regionName: string;
  protectionStatus: ProtectionStatusValue;
  status: CareRequestStatus;
  aiRiskLevel: AiRiskLevel;
  reason: string; // 담당자 연계 요청 사유
  requestedAt: string; // ISO. 요청 발생 일시
  contactedAt: string | null;
  closedAt: string | null;
}

/** 자립청년에게 보낸 메시지 한 건 (발송 이력) */
export interface YouthMessage {
  id: number;
  youthId: number;
  content: string;
  sentAt: string; // ISO
}
