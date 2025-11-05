// src/contexts/DummyDataContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

export type Category = {
  name: string;
  score: number;
  comment?: string;
};

export type DummyAnalysis = {
  id: string;
  model_id: string;
  code: string;
  language: string;
  trigger: string;
  criteria: string[]; // e.g. ["readability","efficiency"...]
  scores: { global: number; model: number };
  categories: Category[];
  summary?: string;
  createdAt: string;
};

type DummyContextValue = {
  list: DummyAnalysis[];
  addDummy: (payload: Omit<DummyAnalysis, "id" | "createdAt">) => void;
  clearAll: () => void;
};

/** ===== 시드 10개 =====
 * CATEGORY_OPTIONS의 value들과 동일한 name을 사용:
 * "Bug" | "Performance" | "Maintainability" | "Style" | "Docs" | "Dependency" | "Security" | "Testing"
 */
const SEED_DUMMIES: Array<Omit<DummyAnalysis, "id" | "createdAt">> = [
  {
    model_id: "starcoder-15b",
    code: `def add(a, b):\n    return a + b`,
    language: "python",
    trigger: "manual",
    criteria: ["readability", "simplicity"],
    scores: { global: 82, model: 84 },
    categories: [
      { name: "Maintainability", score: 88, comment: "짧고 명확한 함수" },
      { name: "Style", score: 80, comment: "PEP8 공백은 양호" },
    ],
    summary: "간단하고 가독성 좋음. 예외 처리 확장은 여지 있음.",
  },
  {
    model_id: "gpt-4.1",
    code: `export const sum = (a: number, b: number) => a + b;`,
    language: "typescript",
    trigger: "push",
    criteria: ["typescript-typing", "readability"],
    scores: { global: 90, model: 92 },
    categories: [
      { name: "Style", score: 92, comment: "타입 명시 적절" },
      { name: "Testing", score: 78, comment: "단위 테스트 부재" },
    ],
    summary: "타입 안전성 우수. 테스트 케이스 보강 필요.",
  },
  {
    model_id: "claude-3.5-sonnet",
    code: `function fetchUsers(){ return fetch("/api/users").then(r=>r.json()); }`,
    language: "javascript",
    trigger: "pull_request",
    criteria: ["error-handling", "async"],
    scores: { global: 68, model: 70 },
    categories: [
      { name: "Bug", score: 60, comment: "에러 처리 없음" },
      { name: "Maintainability", score: 72, comment: "async/await로 개선 가능" },
      { name: "Security", score: 66, comment: "응답 검증 미흡" },
    ],
    summary: "기능은 동작하나 에러/응답 검증과 async 패턴 개선 권장.",
  },
  {
    model_id: "codegemma-7b",
    code: `for i in range(10):\n    print(i)\n# TODO: replace with logger`,
    language: "python",
    trigger: "pre_commit",
    criteria: ["logging", "style"],
    scores: { global: 61, model: 58 },
    categories: [
      { name: "Style", score: 64, comment: "print 대신 로거 권장" },
      { name: "Docs", score: 52, comment: "주석 보완 필요" },
    ],
    summary: "개발 로그는 print 대신 logging 모듈 사용 권장.",
  },
  {
    model_id: "gpt-4.1",
    code: `const arr = new Array(100000).fill(0).map((_,i)=>i*i);`,
    language: "javascript",
    trigger: "push",
    criteria: ["performance", "memory"],
    scores: { global: 72, model: 74 },
    categories: [
      { name: "Performance", score: 68, comment: "지연 계산/스트리밍 고려" },
      { name: "Maintainability", score: 78, comment: "의도 주석 추가 필요" },
    ],
    summary: "메모리 사용량 큼. 지연 평가 또는 청크 처리 고려.",
  },
  {
    model_id: "starcoder-15b",
    code: `package main\nimport "fmt"\nfunc main(){ fmt.Println("ok") }`,
    language: "go",
    trigger: "manual",
    criteria: ["style", "project-structure"],
    scores: { global: 80, model: 79 },
    categories: [
      { name: "Docs", score: 70, comment: "패키지 주석 추가 가능" },
      { name: "Style", score: 86, comment: "go fmt 기준 적합" },
    ],
    summary: "기본 구조 양호. 주석/README 강화 여지.",
  },
  {
    model_id: "claude-3.5-sonnet",
    code: `try { risky(); } catch (e) { console.error(e) }`,
    language: "javascript",
    trigger: "pull_request",
    criteria: ["error-handling", "observability"],
    scores: { global: 65, model: 67 },
    categories: [
      { name: "Bug", score: 62, comment: "사용자 피드백 누락" },
      { name: "Testing", score: 58, comment: "예외 케이스 테스트 없음" },
    ],
    summary: "로깅 외 복구/사용자 알림 경로 필요.",
  },
  {
    model_id: "codegemma-7b",
    code: `public class App { public static void main(String[] args) { System.out.println("Hello"); } }`,
    language: "java",
    trigger: "push",
    criteria: ["structure", "style"],
    scores: { global: 76, model: 73 },
    categories: [
      { name: "Maintainability", score: 78, comment: "패키지 구조화 권장" },
      { name: "Style", score: 74, comment: "포맷/라인 길이 규약 확인" },
    ],
    summary: "엔트리포인트 분리 및 패키지 구조 정리 권장.",
  },
  {
    model_id: "gpt-4.1",
    code: `use std::fs;\nfn main(){ let _ = fs::read_to_string("conf.toml").unwrap(); }`,
    language: "rust",
    trigger: "pre_commit",
    criteria: ["error-handling", "robustness"],
    scores: { global: 55, model: 57 },
    categories: [
      { name: "Bug", score: 50, comment: "unwrap() 제거 필요" },
      { name: "Security", score: 60, comment: "입력 검증/권한 고려" },
    ],
    summary: "에러 전파 혹은 메시지화 필요. unwrap() 지양.",
  },
  {
    model_id: "starcoder-15b",
    code: `# requirements.txt\nflask==1.0.2\nrequests==2.19.1`,
    language: "python",
    trigger: "manual",
    criteria: ["dependencies", "supply-chain"],
    scores: { global: 48, model: 52 },
    categories: [
      { name: "Dependency", score: 42, comment: "구버전 고정. 보안 이슈 가능" },
      { name: "Security", score: 54, comment: "CVE 확인 필요" },
    ],
    summary: "의존성 최신화 및 취약점 스캔 권장.",
  },
  {
    model_id: "claude-3.5-sonnet",
    code: `describe("sum", ()=>{ /* TODO: write tests */ })`,
    language: "typescript",
    trigger: "pull_request",
    criteria: ["tests", "coverage"],
    scores: { global: 63, model: 65 },
    categories: [
      { name: "Testing", score: 60, comment: "테스트 본문 미작성" },
      { name: "Docs", score: 66, comment: "테스트 가이드라인 링크" },
    ],
    summary: "테스트 스켈레톤만 존재. 케이스 작성 필요.",
  },
];

const DummyDataContext = createContext<DummyContextValue | undefined>(undefined);

export const DummyDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 앱 시작 시 시드 10개 주입
  const [list, setList] = useState<DummyAnalysis[]>(
    () =>
      SEED_DUMMIES.map((p, i) => ({
        ...p,
        id: `seed_${i + 1}`,
        // 최근 항목이 위로 오도록 시간 간격을 조금씩 다르게
        createdAt: new Date(Date.now() - i * 1000 * 60 * 47).toISOString(),
      }))
  );

  const addDummy = (payload: Omit<DummyAnalysis, "id" | "createdAt">) => {
    const item: DummyAnalysis = {
      ...payload,
      id: `dummy_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setList((s) => [item, ...s]);
    console.debug("Added dummy analysis", item);
  };

  const clearAll = () => setList([]);

  return (
    <DummyDataContext.Provider value={{ list, addDummy, clearAll }}>
      {children}
    </DummyDataContext.Provider>
  );
};

export function useDummyData() {
  const ctx = useContext(DummyDataContext);
  if (!ctx) throw new Error("useDummyData must be used within DummyDataProvider");
  return ctx;
}
