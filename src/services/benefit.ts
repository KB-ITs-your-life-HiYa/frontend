import { api } from './api';
import type { CategoryMatchResponse, SurveyRequest, SurveyResponse } from '../types/benefit';

export const surveyApi = {
  /** 저장된 설문이 없으면 null. 지원금 탭에서 설문 화면을 보여줄지 판단하는 용도 */
  getMine: () => api.get<SurveyResponse | null>('/members/me/survey'),
  save: (request: SurveyRequest) => api.post<SurveyResponse>('/members/me/survey', request),
};

export const benefitApi = {
  matches: () => api.get<CategoryMatchResponse[]>('/members/me/benefit/matches'),
};
