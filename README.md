# frontend — 자립동행: D-1825 🏠

## 시작하기

\`\`\`bash
npm install
npx expo start
\`\`\`

휴대폰의 **Expo Go** 앱설치 후 터미널에 뜨는 QR코드 스캔


## 폴더 구조

\`\`\`
src/
  navigation/     # 화면 이동 구조 (RootNavigator = 하단 5탭: 홈/대화/지원금/독립지원/마이)
  screens/        # 화면 단위 컴포넌트. 기능별 폴더로 분리
    Home/         # 홈 — D-Day 생활비 관리 대시보드
    Chat/         # AI 상담 챗봇
    Benefits/     # 정부 지원금 매칭
    Housing/      # 독립 지원 — 주거 캘린더
    Care/         # 온라인 케어 (마이 화면에서 진입, 아직 네비게이션 미연결)
    Education/    # 금융 습관 트레이닝 (마이 화면에서 진입, 아직 네비게이션 미연결)
    Onboarding/   # 온보딩 (아직 네비게이션 미연결)
    MyPage/       # 마이
  components/     # 여러 화면에서 재사용하는 UI 조각 (Card, Button, Badge ...)
  constants/      # colors.ts
  services/       # api.ts(FastAPI 백엔드), supabase.ts(Supabase) 연동 자리
  types/          # 공통 타입 정의
  hooks/          # 커스텀 훅 (아직 비어있음)
\`\`\`