import { api } from './api';
import type { CareButtonRequest, CareFreeTextRequest, CareSummary } from '../types/care';

const BASE = '/members/me/care';
export const careApi = {
  evaluate: () => api.post<CareSummary>(`${BASE}/evaluate`, {}),
  respond: (signalId: number, request: CareButtonRequest) =>
    api.post<CareSummary>(`${BASE}/signals/${signalId}/responses`, request),
  message: (signalId: number, request: CareFreeTextRequest) =>
    api.post<CareSummary>(`${BASE}/signals/${signalId}/messages`, request),
  retryGemini: (signalId: number, responseId: number) =>
    api.post<CareSummary>(`${BASE}/signals/${signalId}/responses/${responseId}/gemini`, {}),
  policies: (signalId: number, responseId: number) =>
    api.post<CareSummary>(`${BASE}/signals/${signalId}/responses/${responseId}/policies`, {}),
  refer: (signalId: number) => api.post<CareSummary>(`${BASE}/signals/${signalId}/referrals`, { consent: true }),
  date: (date: string) => api.post<CareSummary>(`${BASE}/demo/date`, { date }),
  reset: () => api.post<CareSummary>(`${BASE}/demo/reset`, {}),
};
