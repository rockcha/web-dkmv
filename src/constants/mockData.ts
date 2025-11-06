// ===== 품질 관점(7개) =====
// (한국어 라벨은 패널에서 매핑, 키는 코드에서 사용)
export type AspectKey =
  | "functionality" // 기능성
  | "reliability" // 신뢰성
  | "usability" // 사용 가능성(사용성)
  | "efficiency" // 효율성
  | "maintainability" // 유지보수성
  | "portability" // 이식성
  | "security"; // 보안성

export type AspectScores = Record<AspectKey, number>;
export type AspectTexts = Partial<Record<AspectKey, string>>;

// ===== 모델 카탈로그(이전 답변과 동일하게 확장 가능) =====
export const MODEL_IDS = [
  "GPT-4.1",
  "GPT-4o",
  "Claude 3.5 Sonnet",
  "Gemini 2.0 Flash",
  "Qwen 2.5-Coder",
  "Llama 3.1 70B",
  "DeepSeek-Coder V2",
  "GitHub Copilot",
  "Cursor",
] as const;

export type ModelId = (typeof MODEL_IDS)[number];
export const MODEL_OPTIONS = MODEL_IDS.map((m) => ({ value: m, label: m }));

export type MockAnalysis = {
  id: string;
  title: string;
  model: ModelId;
  detectionConfidence: number; // 0~1 (수동 선택 시 낮게)
  aspect_scores: AspectScores; // 7개 점수
  average_score: number; // 평균 점수(게터)
  summaries: AspectTexts; // 각 관점 "요약"
  comments: AspectTexts; // 각 관점 "코멘트"
};

// ===== 유틸 =====
const avg = (o: Record<string, number>) =>
  Math.round(
    Object.values(o).reduce((a, b) => a + b, 0) / Object.values(o).length
  );

// ===== 샘플(8개) — 라벨/텍스트는 한국어로 제공 =====
export const MOCK_ANALYSES: MockAnalysis[] = [
  {
    id: "sample-01",
    title: "React 상태 관리 스니펫",
    model: "Qwen 2.5-Coder",
    detectionConfidence: 0.92,
    aspect_scores: {
      functionality: 88,
      reliability: 84,
      usability: 80,
      efficiency: 79,
      maintainability: 82,
      portability: 76,
      security: 86,
    },
    get average_score() {
      return avg(this.aspect_scores);
    },
    summaries: {
      functionality: "핵심 동작은 정상이며 주요 분기 로직이 충실함.",
      reliability: "에러 경계가 일부 컴포넌트에만 적용됨.",
      usability: "상태 변경 흐름이 직관적이나 도움 텍스트 부족.",
      efficiency: "재연산 최적화 여지(useMemo/selector) 존재.",
      maintainability: "훅 분리 기준 양호, 네이밍 일관성 보통.",
      portability: "프레임워크 종속 API 사용이 일부 존재.",
      security: "민감 데이터 노출 징후 없음.",
    },
    comments: {
      functionality: "에지 케이스(빈 배열, null) 테스트 케이스를 보강하세요.",
      reliability: "비동기 실패 처리에 재시도/백오프를 고려해보세요.",
      usability: "입력 가이드/토스트 안내를 추가하면 진입장벽이 낮아집니다.",
      efficiency: "파생 상태는 selector로 계산해 리렌더를 줄이세요.",
      maintainability:
        "커스텀 훅 간 공통 유틸을 분리하면 재사용성이 높아집니다.",
      portability: "환경변수 접근 로직을 추상화 계층 뒤로 숨기세요.",
      security: "외부 입력에 대한 스키마 검증(zod/joi)을 추가하세요.",
    },
  },
  {
    id: "sample-02",
    title: "Express API 라우팅",
    model: "Llama 3.1 70B",
    detectionConfidence: 0.88,
    aspect_scores: {
      functionality: 82,
      reliability: 78,
      usability: 72,
      efficiency: 81,
      maintainability: 85,
      portability: 80,
      security: 68,
    },
    get average_score() {
      return avg(this.aspect_scores);
    },
    summaries: {
      security: "입력 검증과 인증 경계가 다소 느슨함.",
      maintainability: "라우트/컨트롤러/서비스 분리가 잘됨.",
    },
    comments: {
      security: "JWT 만료 처리와 권한 스코프 검증을 강화하세요.",
      usability: "API 문서에 에러 코드를 표준화해 반영하세요.",
    },
  },
  {
    id: "sample-03",
    title: "Python 데이터 처리 스크립트",
    model: "GPT-4.1",
    detectionConfidence: 1.0,
    aspect_scores: {
      functionality: 90,
      reliability: 83,
      usability: 77,
      efficiency: 74,
      maintainability: 80,
      portability: 86,
      security: 88,
    },
    get average_score() {
      return avg(this.aspect_scores);
    },
    summaries: {
      efficiency: "중복 IO가 있어 배치 처리로 개선 여지.",
      portability: "표준 라이브러리 중심으로 이식성 양호.",
    },
    comments: {
      efficiency: "파일 읽기/쓰기 작업을 배치/버퍼링으로 묶으세요.",
      maintainability: "함수 길이를 50줄 이하로 분리하면 가독성↑",
    },
  },
  {
    id: "sample-04",
    title: "Next.js 페이지 + 서버 액션",
    model: "Claude 3.5 Sonnet",
    detectionConfidence: 0.7,
    aspect_scores: {
      functionality: 84,
      reliability: 79,
      usability: 81,
      efficiency: 86,
      maintainability: 78,
      portability: 74,
      security: 73,
    },
    get average_score() {
      return avg(this.aspect_scores);
    },
    summaries: {
      usability: "폼 상호작용과 피드백 루프가 자연스러움.",
      security: "서버 액션 입력 검증이 제한적.",
    },
    comments: {
      security: "서버 액션 파라미터 스키마 검증을 의무화하세요.",
      maintainability: "서버/클라이언트 경계 유틸을 공통 모듈로 분리.",
    },
  },
  {
    id: "sample-05",
    title: "Go 마이크로서비스 헬스체크",
    model: "Gemini 2.0 Flash",
    detectionConfidence: 0.83,
    aspect_scores: {
      functionality: 93,
      reliability: 88,
      usability: 76,
      efficiency: 89,
      maintainability: 86,
      portability: 90,
      security: 82,
    },
    get average_score() {
      return avg(this.aspect_scores);
    },
    summaries: {
      reliability: "헬스/레디니스 구분이 명확하여 장애 격리 용이.",
      usability: "운영 지표 노출이 제한적.",
    },
    comments: {
      usability: "프로메테우스 메트릭/로그 샘플을 문서에 추가하세요.",
      security: "관리 엔드포인트에 IP 화이트리스트를 고려하세요.",
    },
  },
  {
    id: "sample-06",
    title: "TypeScript 유틸 라이브러리",
    model: "DeepSeek-Coder V2",
    detectionConfidence: 0.95,
    aspect_scores: {
      functionality: 91,
      reliability: 86,
      usability: 82,
      efficiency: 84,
      maintainability: 88,
      portability: 87,
      security: 89,
    },
    get average_score() {
      return avg(this.aspect_scores);
    },
    summaries: {
      maintainability: "타입 정의와 테스트가 균형 있게 배치됨.",
    },
    comments: {
      usability: "README에 사용 예시를 더 추가하면 도입이 쉬워집니다.",
    },
  },
  {
    id: "sample-07",
    title: "Monorepo 빌드 스크립트",
    model: "GitHub Copilot",
    detectionConfidence: 0.78,
    aspect_scores: {
      functionality: 80,
      reliability: 79,
      usability: 74,
      efficiency: 83,
      maintainability: 81,
      portability: 75,
      security: 70,
    },
    get average_score() {
      return avg(this.aspect_scores);
    },
    summaries: {
      efficiency: "캐시 활용으로 빌드 시간이 안정적.",
    },
    comments: {
      security: "스크립트 실행 권한 범위를 최소 권한으로 제한하세요.",
    },
  },
  {
    id: "sample-08",
    title: "CLI 도구(Arg 파서) 리팩토링",
    model: "Cursor",
    detectionConfidence: 0.9,
    aspect_scores: {
      functionality: 86,
      reliability: 82,
      usability: 85,
      efficiency: 82,
      maintainability: 85,
      portability: 89,
      security: 80,
    },
    get average_score() {
      return avg(this.aspect_scores);
    },
    summaries: {
      usability: "명령/옵션 체계가 일관되어 학습 곡선 완만.",
    },
    comments: {
      maintainability: "서브커맨드별 파일 분리로 변경 영향 범위를 축소하세요.",
    },
  },
];
