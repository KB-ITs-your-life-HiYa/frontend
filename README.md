# frontend — 자립동행: D-1825

2026 KB IT's Your Life 해커톤 출품작 **자립동행: D-1825**의 모바일 앱 프론트엔드입니다.
React Native(Expo) + TypeScript로 작성되었으며, Expo Go 스토어 버전(SDK 54)에서 바로 실행됩니다.

## 시작하기

```bash
npm install
npx expo start
```

1. 터미널에 뜨는 QR코드를 휴대폰의 **Expo Go** 앱으로 스캔하면 바로 실행됩니다.
2. 터미널에서 W 클릭 시 웹에서 실행


## 폴더 구조

```
src/
  navigation/     # RootNavigator = Stack(Onboarding → MainTabs → MyPage / Care)
                  #   MainTabs = 하단 5탭: 홈 / 대화 / 지원금 / 독립지원 / 놀이
  screens/        # 화면 단위 컴포넌트. 기능별 폴더로 분리
  components/     # 여러 화면에서 재사용하는 UI 조각
  constants/      # colors.ts — 토스 스타일 컬러 / 여백 / 라운드 값
  services/       # api.ts(FastAPI 백엔드), supabase.ts(Supabase) 연동 자리
  types/          # 공통 타입 정의
  hooks/          # 커스텀 훅 (아직 비어있음)
assets/
  mascot.png      # 온보딩 화면 캐릭터 일러스트
```

## 화면 구성

| 화면 | 경로 | 설명 | 진입 방식 |
| --- | --- | --- | --- |
| 온보딩 | `screens/Onboarding` | 시작 화면. "시작하기"를 누르면 메인 탭으로 이동 | 앱 최초 진입 |
| 홈 | `screens/Home` | 안심 지수, 월간 요약, 최근 활동, 첫 목돈 배분, 소비 진단, 생활비 배분, D-365 대비 모드, 할 일 목록 | 탭 |
| 대화 | `screens/Chat` | AI 상담 챗봇. 이상징후 감지 시 먼저 말을 거는 개입 대화 예시 포함 | 탭 |
| 지원금 | `screens/Benefits` | 정부 지원금 매칭 + 정책별 신청 가이드(대상/혜택/신청방법) | 탭 |
| 독립지원 | `screens/Housing` | 주거 캘린더 + 상시 모집 + 입주 준비 체크리스트 | 탭 |
| 놀이 | `screens/Play` | 금융 습관 트레이닝을 퍼즐 수집 게임으로 구현 (퀴즈 풀면 조각 획득) | 탭 |
| 마이 | `screens/MyPage` | 프로필 / 알림 설정 / 고객지원 / 온라인 케어 진입 | 각 화면 상단 프로필 아이콘 → push |
| 온라인 케어 | `screens/Care` | 안심 지수, 정기 결제 관리, 이상징후 감지 지표, 최근 활동 | 마이 화면에서 push |

## 디자인 시스템

- 컬러 팔레트: `constants/colors.ts` (토스 블루 `#3182F6` 기본 + KB 옐로우 포인트)
- 공통 컴포넌트: `Card`, `Button`, `Badge`, `Chip`, `ListRow`, `ToggleRow`, `ProgressBar`, `StackedBar`,
  `CircularGauge`, `SectionHeader`, `ScreenHeader`
- 아이콘: `@expo/vector-icons` (Ionicons / MaterialCommunityIcons)

## 다음에 할 일

- [ ] `services/supabase.ts`에 실제 프로젝트 URL/키 채우기 (`npm install @supabase/supabase-js` 필요)
- [ ] `services/api.ts`의 `BASE_URL`을 실제 FastAPI 서버 주소로 교체
- [ ] 화면 안의 하드코딩된 데이터를 서버 응답으로 교체
- [ ] 챗봇 대화를 실제 AI 백엔드 응답으로 연결
