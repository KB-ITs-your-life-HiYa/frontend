// 독립지원(주거) API 클라이언트. 백엔드 com.fledge.housing.controller.HousingController 대응.
import { api } from './api';
import {
  HousingCalendarResponse,
  HousingNoticeDetail,
} from '../types/housing';

export type HousingCalendarParams = {
  year: number;
  month: number;
  /** 없으면 서버가 회원 거주 시/도를 쓴다. 전국은 'ALL' */
  regionCode?: string;
};

export const housingApi = {
  getCalendar: ({ year, month, regionCode }: HousingCalendarParams) => {
    const query = new URLSearchParams({
      year: String(year),
      month: String(month),
    });
    if (regionCode !== undefined) {
      query.set('regionCode', regionCode);
    }
    return api.get<HousingCalendarResponse>(`/housing/calendar?${query.toString()}`);
  },

  getNoticeDetail: (id: number) => api.get<HousingNoticeDetail>(`/housing/notices/${id}`),
};
