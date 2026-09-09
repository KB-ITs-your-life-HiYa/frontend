// 독립지원(주거) 타입. 백엔드 com.fledge.housing.dto.* 와 1:1로 맞춘다.

/** 공고 대상 유형. 백엔드 TargetType 과 같은 값 */
export type HousingTargetType = 'SELF_RELIANCE' | 'YOUTH' | 'GENERAL';

/** 백엔드가 저장된 회원 정보로 계산한 자격 상태 */
export type HousingEligibilityStatus = 'MATCH' | 'NEEDS_CHECK' | 'NO_MATCH';

/** 백엔드가 공고 판정에 적용한 규칙 */
export type HousingEligibilityRuleType =
  | 'SELF_RELIANCE_DEMO'
  | 'LH_YOUTH_PURCHASE'
  | 'UNSUPPORTED';

/** LH 청년 매입임대 1순위에 해당하는 근거 */
export type YouthPurchasePriorityBasis =
  | 'BENEFIT_RECIPIENT'
  | 'SUPPORTED_SINGLE_PARENT'
  | 'NEAR_POVERTY'
  | 'NONE';

export interface HousingEligibility {
  status: HousingEligibilityStatus;
  reasons: string[];
  missingFields: string[];
  evaluatedOn: string; // YYYY-MM-DD
  /** 날짜를 옮긴 시연 공고의 규칙을 적용했으면 true */
  demo: boolean;
  ruleType: HousingEligibilityRuleType;
  /** 확인된 신청 순위. 아직 판정할 수 없으면 null */
  priority: number | null;
}

export interface HousingEligibilityProfile {
  isHomeless: boolean;
  isMarried: boolean;
  youthPurchasePriorityBasis: YouthPurchasePriorityBasis | null;
  updatedAt: string;
}

export type HousingEligibilityProfileRequest = Pick<
  HousingEligibilityProfile,
  'isHomeless' | 'isMarried' | 'youthPurchasePriorityBasis'
>;

/** 캘린더·상시 모집 목록에 쓰는 공고 요약 */
export interface HousingNoticeSummary {
  id: number;
  title: string;
  supplyType: string;
  institution: string;
  targetType: HousingTargetType;
  beginDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  eligibility: HousingEligibility;
}

/** GET /housing/calendar 응답 */
export interface HousingCalendarResponse {
  notices: HousingNoticeSummary[];
  ongoingNotices: HousingNoticeSummary[];
  appliedRegionCode: string | null;
  message: string | null;
}

/** 공고에 딸린 단지 한 줄. 값 없는 필드는 null */
export interface HousingNoticeUnit {
  id: number;
  complexName: string | null;
  region: string | null;
  district: string | null;
  fullAddress: string | null;
  heatingType: string | null;
  totalHouseholds: number | null;
  supplyCount: number | null;
  deposit: number | null;
  monthlyRent: number | null;
  contractDeposit: number | null;
  balance: number | null;
}

/** GET /housing/notices/{id} 응답 */
export interface HousingNoticeDetail {
  id: number;
  title: string | null;
  institution: string | null;
  houseType: string | null;
  supplyType: string | null;
  targetType: HousingTargetType;
  announceDate: string | null;
  beginDate: string | null;
  endDate: string | null;
  winnerAnnounceDate: string | null;
  contact: string | null;
  applyUrl: string | null;
  myhomeUrl: string | null;
  superseded: boolean;
  units: HousingNoticeUnit[];
  eligibility: HousingEligibility;
}

/** 체크리스트 종류. 백엔드 ChecklistTemplateType 과 같은 값 */
export type ChecklistTemplateType = 'HOUSE_HUNTING' | 'MOVE_IN' | 'MOVING';

/** GET/POST /members/me/housing/checklists 항목 */
export interface HousingChecklistItem {
  id: number;
  content: string;
  dueDate: string | null; // YYYY-MM-DD
  memo: string | null;
  done: boolean;
  sortOrder: number;
}

/** GET/POST /members/me/housing/checklists 응답 */
export interface HousingChecklist {
  id: number;
  templateType: ChecklistTemplateType;
  title: string;
  doneCount: number;
  totalCount: number;
  progress: number;
  items: HousingChecklistItem[];
}

export type UpdateHousingChecklistItemRequest = {
  content?: string;
  dueDate?: string | null;
  memo?: string | null;
  done?: boolean;
  sortOrder?: number;
};
