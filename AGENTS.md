# AGENTS.md — 자립동행 D-1825 프론트엔드

AI 코딩 도구(Claude Code·Cursor·Copilot 등)와 팀원이 함께 지키는 규칙.
**프로젝트 규칙은 이 문서를 기준으로 합니다.**

## 스택

Expo SDK 54 · React Native 0.81.5 · React 19.1 · TypeScript 6.0 ·
React Navigation 7 (Stack + Bottom Tabs)

백엔드는 별도 레포다. → `KB-ITs-your-life-HiYa/backend`

---

## 폴더 구조

```
src/
├── navigation/    RootNavigator — 로그인 여부로 화면 목록이 갈린다
├── screens/       화면 단위 컴포넌트. 기능별 폴더
├── components/    여러 화면에서 재사용하는 UI 조각
├── contexts/      AuthContext — 앱 전체가 공유하는 상태
├── constants/     colors.ts — 컬러 · 여백 · 라운드 값
├── services/      api.ts (백엔드), auth.ts (토큰 저장소), supabase.ts
├── types/         공통 타입
├── hooks/         커스텀 훅
└── utils/         confirm.ts 등
```

- 화면은 `screens/<기능>/XxxScreen.tsx`
- 한 화면에서만 쓰는 조각은 그 화면 폴더에 둔다. 두 곳 이상에서 쓰면 `components/` 로 올린다
- 컴포넌트 파일명은 `PascalCase.tsx`

---

## API 호출

**반드시 `services/api.ts` 의 `api` 를 통해서 호출한다.** 화면에서 `fetch` 를 직접 쓰지 않는다.

```ts
import { api } from '../../services/api'

const notice = await api.get<HousingNotice>('/housing/12')
```

- 경로에 `/api/v1` 을 쓰지 않는다. `api.ts` 가 붙인다
- 주소를 바꿀 때는 코드가 아니라 `.env` 의 `EXPO_PUBLIC_API_BASE_URL` 을 고친다
- 실패는 throw 된다. 화면에서 `try/catch` 로 잡는다

백엔드 응답은 `{ success, data, error }` 로 감싸여 온다.
**벗기는 일은 `api.ts` 안에서만 한다** — 화면에서 `.data` 를 꺼내지 않는다.

---

## 인증

**토큰을 직접 다루지 않는다.** `api.ts` 가 요청마다 `Authorization` 헤더를 붙이고,
401 이 오면 저장된 토큰을 지운다. 화면은 토큰의 존재를 몰라도 된다.

로그인한 회원 정보가 필요하면 `useAuth()` 를 쓴다.

```tsx
const { member, login, logout } = useAuth()
```

**로그인·로그아웃 후 화면을 직접 이동시키지 않는다.** `member` 가 바뀌면
`RootNavigator` 가 화면 목록을 통째로 갈아끼운다.
`navigate` 로 옮기면 뒤로가기로 로그인 화면에 돌아가는 문제가 생긴다.

`member.daysUntilSupportEnd` 는 **보호중인 회원에게 `null`** 이다. D-day 를 그릴 수
없는 경우를 화면이 처리해야 한다.

### 확인 대화상자

**`Alert.alert` 을 직접 쓰지 않는다.** react-native-web 은 버튼이 있는 Alert 을
구현하지 않아 **웹에서 아무 일도 일어나지 않는다**(에러도 나지 않는다).

```ts
import { confirm } from '../../utils/confirm'

if (await confirm('로그아웃', '로그아웃하시겠어요?', '로그아웃')) { ... }
```

---

## 스타일

**색·여백·라운드는 `constants/colors.ts` 의 값을 쓴다.** 화면에 색상 코드를 직접 적지 않는다.

```ts
import { colors, spacing, radius } from '../../constants/colors'
```

새 색이 필요하면 `colors.ts` 에 추가한 뒤 쓴다.
기존 화면들이 같은 톤을 쓰고 있으므로, 새 화면은 비슷한 화면을 열어 여백과 폰트 크기를 맞춘다.

---

## 타입

- `strict` 가 켜져 있다. `any` 는 쓰지 않는다
- 여러 화면이 공유하는 타입은 `types/index.ts` 에 둔다
- 한 화면에서만 쓰는 타입은 그 파일 안에 둔다
- 커밋 전 `npm run typecheck` 로 확인한다

---

## 환경변수

`.env` 에 넣고, `.env.example` 에 키 이름을 같이 추가한다. `.env` 는 커밋되지 않는다.

**`EXPO_PUBLIC_` 이 붙은 값은 앱 번들에 그대로 포함되어 누구나 읽을 수 있다.**
Supabase `service_role` 키처럼 서버 전용 비밀값은 절대 여기 두지 않는다. 백엔드에만 둔다.

| 변수 | 용도 |
| --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | 백엔드 주소. 기본 `http://localhost:8080` |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 주소 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |

실기기(Expo Go)로 볼 때는 `localhost` 가 휴대폰 자신을 가리키므로,
`EXPO_PUBLIC_API_BASE_URL` 에 개발 PC 의 LAN IP 를 적는다.

---

## 명령어

```bash
npm install
npx expo start        # QR 스캔(Expo Go) 또는 w 를 눌러 웹
npm run typecheck     # 타입 검사
```

---

## Git

백엔드 레포와 같은 규칙이다.

### 커밋

**제목 한 줄만 쓴다.** 상세 설명은 전부 PR 본문에 적는다.

```
<type>: <한글 제목>

feat: 주거 캘린더에 실제 공고 데이터 연결
```

- type: `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `chore`
- 명령조·현재시제, **끝에 마침표 없음**, 한글 30자 내외

### 브랜치

**모든 작업은 새 브랜치에서 한다.** `develop` 에 직접 커밋·push 금지.

```bash
git switch develop && git pull
git switch -c feature/housing-calendar
```

- 기본 브랜치는 **`develop`**
- 이름은 `<type>/<영문-설명>` — 소문자와 하이픈만
- type: `feature` · `fix` · `refactor` · `docs` · `chore`

### PR

- 타겟은 `develop`, 머지 후 브랜치 삭제
- 본문에 **무엇을 / 왜 / 변경 사항 / 확인 방법**을 적는다

---

## 지금 상태

화면은 온보딩 · 홈 · 대화 · 지원금 · 독립지원 · 놀이 · 마이 · 온라인케어까지
모두 만들어져 있고, **데이터는 전부 화면 안에 하드코딩되어 있다.**

앞으로의 작업은 그 하드코딩을 백엔드 응답으로 바꾸는 것이다.
화면을 새로 만드는 것이 아니라, 기존 화면의 데이터 출처를 바꾸는 일이다.

---

_최종 갱신: 2026-09-03_
