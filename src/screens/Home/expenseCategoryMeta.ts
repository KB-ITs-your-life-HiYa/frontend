import { Ionicons } from '@expo/vector-icons';
import { ExpenseCategory } from '../../types';

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  HOUSING_UTILITY: '주거·공과금',
  FOOD: '식비',
  TRANSPORT: '교통',
  LIVING_MEDICAL: '생활·의료',
  LEISURE_SHOPPING: '여가·쇼핑',
  SAVINGS: '저축',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, keyof typeof Ionicons.glyphMap> = {
  HOUSING_UTILITY: 'home-outline',
  FOOD: 'restaurant-outline',
  TRANSPORT: 'bus-outline',
  LIVING_MEDICAL: 'medkit-outline',
  LEISURE_SHOPPING: 'bag-outline',
  SAVINGS: 'wallet-outline',
};