// 놀이 탭(금융습관 트레이닝) 관련 타입. 백엔드 com.fledge.habit.dto.* 와 1:1로 맞춘다.

export interface HabitQuizOption {
  id: number;
  label: string;
}

export interface HabitQuizResult {
  selectedOptionId: number;
  correct: boolean;
  explanation: string;
}

export interface HabitTodayQuiz {
  quizId: number;
  question: string;
  options: HabitQuizOption[];
  answered: boolean;
  result: HabitQuizResult | null;
}

export interface HabitPuzzleProgress {
  puzzleSetId: number;
  title: string;
  assetKey: string;
  collectedPieces: number;
  totalPieces: number;
  completed: boolean;
  allSetsCompleted: boolean;
}

export interface HabitQuizAnswerResult {
  correct: boolean;
  explanation: string;
  progress: HabitPuzzleProgress;
  justCompleted: boolean;
}

export type HabitPuzzleSetStatus = 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';

export interface HabitPuzzleSetSummary {
  puzzleSetId: number;
  title: string;
  assetKey: string;
  sortOrder: number;
  status: HabitPuzzleSetStatus;
  collectedPieces: number;
  totalPieces: number;
}

export interface HabitTopicSummary {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

export interface HabitTopicDetail extends HabitTopicSummary {
  body: string;
}
