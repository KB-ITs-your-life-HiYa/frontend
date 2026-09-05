import type { EmploymentStatus, HousingType, SurveyTag } from '../types/benefit';

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  EMPLOYED: '재직 중',
  SELF_EMPLOYED: '자영업',
  STUDENT: '재학 중',
  JOB_SEEKER: '취업준비생',
  UNEMPLOYED: '무직',
};

export const HOUSING_TYPE_LABELS: Record<HousingType, string> = {
  OWNED: '자가',
  JEONSE: '전세',
  MONTHLY_RENT: '월세',
  FREE: '무상거주',
  SELF_RELIANCE_HOUSE: '자립생활관 등',
  PUBLIC_RENTAL: '공공임대',
};

export const SURVEY_TAG_LABELS: Record<SurveyTag, string> = {
  SINGLE_PARENT: '한부모 가정',
  MULTICULTURAL: '다문화 가정',
  DISABILITY: '장애가 있어요',
  MULTI_CHILD: '다자녀 가정',
  SEVERE_ILLNESS: '중증질환이 있어요',
  NORTH_KOREAN_DEFECTOR: '북한이탈주민',
  GRANDPARENT_FAMILY: '조손가정',
};
