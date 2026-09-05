// 독립지원(주거) API 클라이언트.
// HousingController · HousingChecklistController 대응.
import { api } from './api';
import {
  ChecklistTemplateType,
  HousingCalendarResponse,
  HousingChecklist,
  HousingChecklistItem,
  HousingNoticeDetail,
  UpdateHousingChecklistItemRequest,
} from '../types/housing';

export type HousingCalendarParams = {
  year: number;
  month: number;
  /** 없으면 서버가 회원 거주 시/도를 쓴다. 전국은 'ALL' */
  regionCode?: string;
};

const CHECKLISTS = '/members/me/housing/checklists';

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

  listChecklists: () => api.get<HousingChecklist[]>(CHECKLISTS),

  createChecklist: (templateType: ChecklistTemplateType) =>
    api.post<HousingChecklist>(CHECKLISTS, { templateType }),

  deleteChecklist: (id: number) => api.delete<null>(`${CHECKLISTS}/${id}`),

  addChecklistItem: (
    checklistId: number,
    body: { content: string; dueDate?: string | null; memo?: string | null }
  ) => api.post<HousingChecklistItem>(`${CHECKLISTS}/${checklistId}/items`, body),

  updateChecklistItem: (
    checklistId: number,
    itemId: number,
    body: UpdateHousingChecklistItemRequest
  ) =>
    api.patch<HousingChecklistItem>(`${CHECKLISTS}/${checklistId}/items/${itemId}`, body),

  deleteChecklistItem: (checklistId: number, itemId: number) =>
    api.delete<null>(`${CHECKLISTS}/${checklistId}/items/${itemId}`),
};
