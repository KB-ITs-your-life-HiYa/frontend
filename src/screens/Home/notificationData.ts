import { Ionicons } from '@expo/vector-icons';

// 알림 목록. 현재는 목 데이터지만, 나중에 API 응답으로 그대로 교체할 수 있도록
// 컴포넌트 밖으로 분리해뒀다 (scheduleData.ts 와 동일한 방식)
export interface Notification {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  time: string;
}

export const notifications: Notification[] = [
  {
    id: '1',
    icon: 'arrow-up',
    title: '자립정착금, 어떻게 나눠 쓸까요?',
    body: '처음 받은 목돈을 나눌 기준을 준비했어요.',
    time: '오늘 오전 9:00',
  },
];