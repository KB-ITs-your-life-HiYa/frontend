import { api } from './api';
import type { CategoryMatchResponse, SubsidySummary, SurveyRequest, SurveyResponse } from '../types/benefit';

export const surveyApi = {
  /** 저장된 설문이 없으면 null. 지원금 탭에서 설문 화면을 보여줄지 판단하는 용도 */
  getMine: () => api.get<SurveyResponse | null>('/members/me/survey'),
  save: (request: SurveyRequest) => api.post<SurveyResponse>('/members/me/survey', request),
};

export const benefitApi = {
  matches: () => api.get<CategoryMatchResponse[]>('/members/me/benefit/matches'),
};

/** 지원금 카탈로그 검색. "받고 있는 지원금 추가" 화면에서 쓴다. 우리 DB 안에서만 검색됨 */
export const subsidyApi = {
  search: (q: string) => api.get<SubsidySummary[]>(`/subsidies?q=${encodeURIComponent(q)}`),
};

/** 회원이 현재 받고 있는 지원금 */
export const mySubsidyApi = {
  list: () => api.get<SubsidySummary[]>('/members/me/subsidies'),
  add: (subsidyId: number) => api.post<void>('/members/me/subsidies', { subsidyId }),
  remove: (subsidyId: number) => api.delete<void>(`/members/me/subsidies/${subsidyId}`),
};
