// 자립동행: D-1825 — 토스 스타일 컬러 팔레트
export const colors = {
  // base
  white: '#FFFFFF',
  background: '#F2F4F6',
  border: '#E5E8EB',
  track: '#EAEDF1',

  // text
  textPrimary: '#191F28',
  textSecondary: '#4E5968',
  textTertiary: '#8B95A1',

  // brand
  primary: '#3182F6', // 토스 블루
  primaryLight: '#E8F3FF',
  accent: '#FFC107', // KB 옐로우 포인트
  accentLight: '#FFF6D9',

  // status
  success: '#00C896',
  successLight: '#E4FBF3',
  warning: '#FF9500',
  warningLight: '#FFF1E0',
  danger: '#F04452',
  dangerLight: '#FDECEC',

  // pastel icon backgrounds
  blueSoft: '#E8F0FE',
  yellowSoft: '#FDEFD3',
  greenSoft: '#E3F7EE',
  graySoft: '#EEF0F3',
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
