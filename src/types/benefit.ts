// 정부 지원금 매칭 관련 타입. 백엔드 SurveyRequest/SurveyResponse, SubsidyMatchResponse 와 1:1로 맞춘다.

/** JOB_SEEKER 는 졸업(중퇴) 후 2년 이내 구직중, UNEMPLOYED 는 그 외 무직 */
export type EmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'STUDENT' | 'JOB_SEEKER' | 'UNEMPLOYED';
export type HousingType =
  | 'OWNED'
  | 'JEONSE'
  | 'MONTHLY_RENT'
  | 'FREE'
  | 'SELF_RELIANCE_HOUSE'
  | 'PUBLIC_RENTAL';

/** 백엔드 member_survey_tag CHECK 제약과 같은 값 */
export type SurveyTag =
  | 'SINGLE_PARENT'
  | 'MULTICULTURAL'
  | 'DISABILITY'
  | 'MULTI_CHILD'
  | 'SEVERE_ILLNESS'
  | 'NORTH_KOREAN_DEFECTOR'
  | 'GRANDPARENT_FAMILY';

/** POST /members/me/survey 요청 */
export interface SurveyRequest {
  householdSize: number | null;
  /** 기준중위소득 구간(%). 32/48/50/60/100/120/150/999(초과). 모르면 null */
  incomePctBracket: number | null;
  isBenefitRecipient: boolean | null;
  employmentStatus: EmploymentStatus | null;
  housingType: HousingType | null;
  tags: SurveyTag[];
}

/** GET·POST /members/me/survey 응답 */
export type SurveyResponse = SurveyRequest;

/** 백엔드 MatchStatus 와 같은 값 */
export type MatchStatus = 'MET' | 'NEEDS_REVIEW';

export interface MatchCondition {
  label: string;
  status: MatchStatus;
}

export interface SubsidyBenefitItem {
  benefitName: string;
  amountKrw: number | null;
  cycle: string | null;
}

/** GET /members/me/benefit/matches 응답의 지원금 항목 */
export interface SubsidyMatchResponse {
  subsidyId: number;
  name: string;
  summary: string | null;
  orgName: string | null;
  category: string;
  applyMethod: string | null;
  applyDeadlineRaw: string | null;
  applyDeadlineDate: string | null; // YYYY-MM-DD
  detailUrl: string | null;
  benefits: SubsidyBenefitItem[];
  conditions: MatchCondition[];
  needsReviewCount: number;
}

/** GET /members/me/benefit/matches 응답 */
export interface CategoryMatchResponse {
  category: string;
  items: SubsidyMatchResponse[];
}
