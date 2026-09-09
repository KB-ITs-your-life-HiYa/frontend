import { api } from './api';
import type { CounselorReferralApiResponse, CounselorYouthApiResponse } from '../types/counselor';

const BASE = '/members/me/counselor';

export const counselorApi = {
  youths: () => api.get<CounselorYouthApiResponse[]>(`${BASE}/youths`),
  referrals: () => api.get<CounselorReferralApiResponse[]>(`${BASE}/referrals`),
};
