# frontend — 자립동행: D-1825 🏠

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
  navigation/     # RootNavigator = 인증 상태·회원 역할에 따라 로그인 / 청년 탭 / 상담사 포털 분기
                  #   MainTabs = 하단 5탭: 홈 / 대화 / 지원금 / 독립지원 / 놀이
  screens/        # 화면 단위 컴포넌트. 기능별 폴더로 분리
  components/     # 여러 화면에서 재사용하는 UI 조각
  constants/      # colors.ts — 토스 스타일 컬러 / 여백 / 라운드 값
  services/       # 공통 API 클라이언트, 토큰 저장소, 주거·지원금·습관·케어 API
  contexts/       # AuthContext — 로그인 회원·인증 상태
  data/           # 상담사 포털 모의 데이터
  types/          # 공통 타입 정의
  hooks/          # useCare(케어 조회·요청 상태), useRiseIn(진입 애니메이션)
assets/
  mascot.png      # 온보딩 화면 캐릭터 일러스트
```

## 화면 구성

| 화면 | 경로 | 설명 | 진입 방식 |
| --- | --- | --- | --- |
| 온보딩 | `screens/Onboarding` | 시작 화면. "시작하기"를 누르면 로그인 화면으로 이동 | 앱 최초 진입 |
| 로그인 | `screens/Auth` | JWT 로그인. 회원 역할에 따라 청년 탭 또는 상담사 포털 진입 | 온보딩 이후 |
| 홈 | `screens/Home` | 안심 지수, 월간 요약, 최근 활동, 첫 목돈 배분, 소비 진단, 생활비 배분, D-365 대비 모드, 할 일 목록 | 탭 |
| 대화 | `screens/Chat` | 케어 신호 기반 대화·응답, Gemini 연동, 정책 추천·상담 연계 요청 | 탭 |
| 지원금 | `screens/Benefits` | 정부 지원금 매칭 + 정책별 신청 가이드(대상/혜택/신청방법) | 탭 |
| 독립지원 | `screens/Housing` | 주거 캘린더 + 상시 모집 + 입주 준비 체크리스트 | 탭 |
| 놀이 | `screens/Play` | 금융 습관 트레이닝을 퍼즐 수집 게임으로 구현 (퀴즈 풀면 조각 획득) | 탭 |
| 마이 | `screens/MyPage` | 프로필 / 알림 설정 / 고객지원 / 온라인 케어 진입 | 각 화면 상단 프로필 아이콘 → push |
| 온라인 케어 | `screens/Care` | 안심 지수, 정기 결제 관리, 이상징후 감지 지표, 최근 활동 | 마이 화면에서 push |
| 상담사 포털 | `screens/Counselor` | 대시보드·청년·케어 관리 화면. 현재 모의 데이터 사용 | 상담사 계정 로그인 |

## 디자인 시스템

- 컬러 팔레트: `constants/colors.ts` (블루 `#3182F6` 기본 + KB 옐로우 포인트)
- 공통 컴포넌트: `Card`, `Button`, `Badge`, `Chip`, `ListRow`, `ToggleRow`, `ProgressBar`, `StackedBar`,
  `CircularGauge`, `SectionHeader`, `ScreenHeader`
- 아이콘: `@expo/vector-icons` (Ionicons / MaterialCommunityIcons)

## 현재 구현 상태

2026-09-07 로컬 코드 기준이다. API 호출 구현 여부를 정리한 것으로, 배포 환경의 정상 동작을 보증하는 목록은 아니다.

| 영역 | 구현 상태 |
| --- | --- |
| 인증·화면 분기 | 백엔드 JWT 로그인·회원 조회 연동. 비로그인은 온보딩·로그인, 청년은 메인 탭, 상담사는 전용 포털로 분기 |
| 홈·재무 | 계좌·자산 요약, 소비 요약·리포트, 월별 예산 조회·저장·삭제, 지원 종료 예측 API 연동 |
| 지원금 | 회원 설문 조회·저장 및 맞춤 지원금 조회 API 연동 |
| 독립지원 | 주거 캘린더·공고 상세 및 체크리스트 API 연동 |
| 놀이 | 오늘의 퀴즈·답안 제출, 퍼즐 진행도·세트, 학습 주제 API 연동 |
| 대화·케어 | 신호 평가, 응답·메시지, Gemini 재시도, 정책 조회, 상담 연계 요청 API 연동 |
| 상담사 포털 | 화면은 구현되어 있으나 `src/data/counselorMockData.ts`의 모의 데이터 사용 |
| 남은 정적·미구현 영역 | 알림 목록은 모의 데이터, 정착금 기준은 코드 내 매핑. 할 일 전체 목록은 준비 중 화면. 마이의 알림·동의 토글은 화면 상태만 변경하며 고객센터·약관 버튼은 미구현 |

`src/services/supabase.ts`는 주석만 있는 자리 표시자이며 현재 인증·데이터 흐름에서 사용하지 않는다.
후속 작업은 기존 API 연동을 유지하면서 위 미연동 영역을 구현하는 것이다.

## 실행 환경

백엔드를 먼저 실행하고 `.env.example`을 `.env`로 복사한다.
서버 주소는 `EXPO_PUBLIC_API_BASE_URL`로 설정한다(기본 `http://localhost:8080`).
실기기에서는 개발 PC의 LAN IP를 사용한다. `api.ts`의 주소를 직접 수정하지 않는다.
현재 앱 실행에는 Supabase 클라이언트 설치나 프론트의 Supabase 환경변수 설정이 필요하지 않다.
타입 검사는 `npm run typecheck`로 실행한다.
