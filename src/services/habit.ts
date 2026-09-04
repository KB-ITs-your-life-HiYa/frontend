// 놀이 탭(금융습관 트레이닝) API 클라이언트. 백엔드 com.fledge.habit.controller.HabitController 대응.
import { api } from './api';
import {
  HabitPuzzleProgress,
  HabitPuzzleSetSummary,
  HabitQuizAnswerResult,
  HabitTodayQuiz,
  HabitTopicCategory,
  HabitTopicDetail,
  HabitTopicSummary,
} from '../types/habit';

export const habitApi = {
  getTodayQuiz: () => api.get<HabitTodayQuiz>('/habit/quiz/today'),
  submitAnswer: (optionId: number) =>
    api.post<HabitQuizAnswerResult>('/habit/quiz/today/answer', { optionId }),
  getPuzzleProgress: () => api.get<HabitPuzzleProgress>('/habit/puzzle/progress'),
  listPuzzleSets: () => api.get<HabitPuzzleSetSummary[]>('/habit/puzzle/sets'),
  // "금융 상식 쑥쑥" 최상위 카테고리 목록 (신용/대출, 저축/투자, 소비습관)
  listTopicCategories: () => api.get<HabitTopicCategory[]>('/habit/topics'),
  // 카테고리 안의 세부 토픽 목록
  listTopicsByCategory: (categoryId: number) =>
    api.get<HabitTopicSummary[]>(`/habit/topics/${categoryId}/subtopics`),
  getTopicDetail: (topicId: number) => api.get<HabitTopicDetail>(`/habit/topics/detail/${topicId}`),
};
