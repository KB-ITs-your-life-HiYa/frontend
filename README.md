# 🏠 frontend — 자립동행: D-1825 🏠

2026 KB IT's Your Life 해커톤 출품작 **자립동행: D-1825**의 모바일 앱 프론트엔드입니다.

React Native(Expo) + TypeScript로 작성되었으며, Expo Go 스토어 버전(SDK 54)에서 바로 실행됩니다.

## 시작하기

```bash
npm install
npx expo start
```

터미널에 뜨는 QR코드를 휴대폰의 **Expo Go** 앱으로 스캔하면 바로 실행됩니다.

## 폴더 구조

```
src/
  navigation/     # 화면 이동 구조 (RootNavigator = 하단 5탭: 홈 / 대화 / 지원금 / 독립지원 / 마이)
  screens/        # 화면 단위 컴포넌트. 기능별 폴더로 분리
  components/     # 여러 화면에서 재사용하는 UI 조각
  constants/      # colors.ts — 토스 스타일 컬러 / 여백 / 라운드 값
  services/       # api.ts(FastAPI 백엔드), supabase.ts(Supabase) 연동 자리
  types/          # 공통 타입 정의
  hooks/          # 커스텀 훅 (아직 비어있음)
```

## 화면 구성

| 화면 | 경로 | 설명 | 탭 연결 |
| --- | --- | --- | --- |
| 홈 | `screens/Home` | D-Day 생활비 관리 — 잔액, 첫 목돈 배분, 소비 진단, 생활비 배분, D-365 대비 모드 | ✅ |
| 대화 | `screens/Chat` | AI 상담 챗봇 | ✅ |
| 지원금 | `screens/Benefits` | 정부 지원금 매칭 + 신청 가이드 | ✅ |
| 독립지원 | `screens/Housing` | 주거 캘린더 + 입주 준비 체크리스트 | ✅ |
| 마이 | `screens/MyPage` | 프로필 / 알림 설정 / 고객지원 | ✅ |
| 온라인 케어 | `screens/Care` | 안심 지수 게이지 + 이상징후 감지 지표 | 미연결 (마이 화면에서 진입 예정) |
| 금융습관 트레이닝 | `screens/Education` | 콘텐츠 + 퀴즈 | 미연결 (마이 화면에서 진입 예정) |
| 온보딩 | `screens/Onboarding` | 시작 화면 | 미연결 |

## 디자인 시스템

- 컬러 팔레트: `constants/colors.ts`
- 공통 컴포넌트: `Card`, `Button`, `Badge`, `Chip`, `ListRow`, `ToggleRow`, `ProgressBar`, `StackedBar`,
  `CircularGauge`, `SectionHeader`, `ScreenHeader`
- 아이콘: `@expo/vector-icons` (Ionicons / MaterialCommunityIcons)

## 다음에 할 일

- [ ] `Care`, `Education`, `Onboarding` 화면을 Stack Navigator로 연결하기
- [ ] `services/supabase.ts`에 실제 프로젝트 URL/키 채우기 (`npm install @supabase/supabase-js` 필요)
- [ ] `services/api.ts`의 `BASE_URL`을 실제 FastAPI 서버 주소로 교체
- [ ] 화면 안의 하드코딩된 데이터를 서버 응답으로 교체
