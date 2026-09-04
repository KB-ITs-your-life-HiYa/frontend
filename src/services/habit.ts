// 놀이 탭(금융습관 트레이닝) API 클라이언트. 백엔드 com.fledge.habit.controller.HabitController 대응.
import { api } from './api';
import {
  HabitPuzzleProgress,
  HabitPuzzleSetSummary,
  HabitQuizAnswerResult,
  HabitTodayQuiz,
  HabitTopicDetail,
  HabitTopicSummary,
} from '../types/habit';

export const habitApi = {
  getTodayQuiz: () => api.get<HabitTodayQuiz>('/habit/quiz/today'),
  submitAnswer: (optionId: number) =>
    api.post<HabitQuizAnswerResult>('/habit/quiz/today/answer', { optionId }),
  getPuzzleProgress: () => api.get<HabitPuzzleProgress>('/habit/puzzle/progress'),
  listPuzzleSets: () => api.get<HabitPuzzleSetSummary[]>('/habit/puzzle/sets'),
  listTopics: () => api.get<HabitTopicSummary[]>('/habit/topics'),
  getTopicDetail: (topicId: number) => api.get<HabitTopicDetail>(`/habit/topics/${topicId}`),
};
