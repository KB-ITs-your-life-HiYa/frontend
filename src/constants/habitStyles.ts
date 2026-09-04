import { colors } from './colors';

// "금융 상식 쑥쑥" 카테고리별 고정 색상.
// 예전엔 카드가 화면에 그려지는 순서(index)를 4색 배열에 그냥 나눠 돌려썼는데,
// 그러면 카테고리 카드와 그 안의 세부 토픽 카드 색이 서로 안 맞고, 아이콘마다
// 색이 제각각이라 급하게 대충 배당한 느낌이 났다.
// 이제는 categoryId 기준으로 카테고리 하나당 색을 하나만 고정해서,
// 카테고리 카드와 그 안의 세부 토픽 카드가 항상 같은 톤으로 보이도록 통일했다.
export const CATEGORY_ICON_STYLES: Record<number, { bg: string; iconColor: string }> = {
  1: { bg: colors.blueSoft, iconColor: colors.primary }, // 신용, 대출
  2: { bg: colors.greenSoft, iconColor: colors.success }, // 저축, 투자
  3: { bg: colors.yellowSoft, iconColor: colors.warning }, // 소비습관
};

export const DEFAULT_CATEGORY_ICON_STYLE = { bg: colors.blueSoft, iconColor: colors.primary };

export function getCategoryIconStyle(categoryId: number | undefined) {
  if (categoryId === undefined) return DEFAULT_CATEGORY_ICON_STYLE;
  return CATEGORY_ICON_STYLES[categoryId] ?? DEFAULT_CATEGORY_ICON_STYLE;
}
