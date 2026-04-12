# Don't Kill My Vibe 🎯

> **바이브 코딩의 품질을 지켜주는 AI 코드 리뷰 웹 플랫폼**

바이브 코딩(AI 보조 코딩)으로 작성한 코드를 AI가 자동으로 분석하고, 점수와 피드백을 웹 대시보드에서 한눈에 확인할 수 있는 서비스입니다.  
VS Code 확장과 연동하여 코딩 → 리뷰 → 확인의 흐름을 자연스럽게 이어줍니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **대시보드** | 내 코드 품질 점수(총점·Bug·Maintainability·Style·Security)를 시계열 차트로 시각화 |
| **리뷰 목록 (Analyses)** | AI가 수행한 코드 리뷰 내역을 카테고리·날짜 기준으로 필터링·조회 |
| **리뷰 상세** | 개별 리뷰의 카테고리별 점수와 피드백 상세 확인 |
| **플레이그라운드** | 코드를 직접 입력하고 원하는 AI 모델로 즉석 리뷰 요청 |
| **모델 비교 (Compare)** | GPT·Gemini·Grok 등 다양한 AI 모델 간 리뷰 성능·점수 비교 |
| **리더보드** | 사용자 전체의 코드 품질 순위 확인 |
| **리포트** | 개인 점수 요약·모델 비교 리포트 다운로드 (예정) |
| **다운로드** | VS Code 확장 프로그램 설치 안내 |
| **GitHub OAuth 로그인** | GitHub 계정으로 간편 로그인·연동 |

---

## 기술 스택

### 프론트엔드

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite |
| 스타일링 | Tailwind CSS v4 |
| UI 컴포넌트 | shadcn/ui (Radix UI 기반) |
| 라우팅 | React Router v7 |
| 차트 | Recharts |
| 애니메이션 | Motion (Framer Motion), Rough Notation |
| 폰트 | Gowun Dodum (Google Fonts) |

### 배포 및 백엔드 연동

| 분류 | 기술 |
|------|------|
| 배포 | Vercel |
| API 프록시 | Vercel Rewrites (`/api/*` → 백엔드 서버) |
| 인증 | GitHub OAuth (JWT 토큰 방식) |
| AI 모델 | OpenAI GPT, Google Gemini, xAI Grok 외 다수 (OpenRouter 경유) |

---

## 화면 구성

```
/                     랜딩 페이지 (서비스 소개 및 시작하기)
/about                서비스 소개
/start                VS Code 확장 다운로드 안내
/login                GitHub OAuth 로그인

/mypage/dashboard     대시보드 (품질 점수 차트)
/mypage/analyses      리뷰 목록
/mypage/analyses/:id  리뷰 상세
/mypage/compare       AI 모델 비교
/mypage/leaderboard   사용자 랭킹
/mypage/playground    즉석 AI 코드 리뷰
/mypage/reports       리포트
/mypage/settings      설정
```

---

## 프로젝트 구조

```
web-dkmv/
├── api/                    # Vercel Serverless Functions (프록시)
│   ├── [...path].ts
│   └── ping.ts
├── public/
│   ├── downloads/          # VS Code 확장 배포 파일
│   └── images/
├── src/
│   ├── app/                # 레이아웃 및 라우터
│   │   ├── AppLayout.tsx
│   │   ├── AppRoutes.tsx
│   │   ├── AppHeader.tsx
│   │   └── AppFooter.tsx
│   ├── api/                # API 호출 모듈
│   │   ├── client.ts
│   │   ├── reviewStats.ts
│   │   ├── users.ts
│   │   └── userStats.ts
│   ├── components/         # 공통 UI 컴포넌트
│   │   └── ui/             # shadcn/ui 컴포넌트
│   ├── constants/          # 상수 (모델 목록, 목 데이터 등)
│   ├── features/auth/      # 인증 (GitHub OAuth, Context, Token)
│   ├── lib/                # 유틸리티 및 커스텀 훅
│   └── pages/              # 페이지 컴포넌트
│       ├── Landing.tsx
│       ├── Dashboard.tsx
│       ├── Analyses.tsx
│       ├── AnalysisDetail.tsx
│       ├── Compare.tsx
│       ├── Leaderboard.tsx
│       ├── Playground.tsx
│       ├── Reports.tsx
│       ├── Settings.tsx
│       ├── DownloadPage.tsx
│       ├── About.tsx
│       └── Login.tsx
├── vercel.json             # Vercel 배포 설정 (API 프록시 포함)
├── vite.config.ts
└── package.json
```

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 참고사항

- **API 프록시**: Vercel 환경에서 HTTPS → HTTP 직접 요청이 차단되므로 모든 백엔드 호출은 `/api/*` 경로를 경유합니다 (`vercel.json` rewrites 설정).
- **인증 방식**: GitHub OAuth 로그인 후 발급된 JWT 토큰을 `localStorage`에 저장하여 API 요청에 활용합니다.
- **AI 모델**: Playground 및 Compare 페이지에서 OpenAI GPT, Google Gemini, xAI Grok 등 다양한 모델을 선택할 수 있습니다.
- **VS Code 확장 연동**: 확장에서 코드 리뷰를 요청하면 결과가 이 웹 대시보드에 자동으로 집계됩니다.
- **다크 모드**: 기본적으로 다크 모드로 실행되며 `next-themes`로 테마 전환을 지원합니다.

---

<!-- 아래는 Vite 템플릿 기본 내용입니다 -->

## ESLint 설정 확장

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
