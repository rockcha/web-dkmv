// src/pages/ExtensionDemo.tsx
import { useMemo, useState, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ExtensionLikePanel } from "@/components/ExtensionLikePanel";
import {
  MOCK_ANALYSES,
  MODEL_OPTIONS,
  type MockAnalysis,
  type ModelId,
} from "@/constants/mockData";
import { VscodeShell } from "@/components/vscode/Shell";
import { EditorMock } from "@/components/vscode/EditorMock";
import {
  AnalyzingOverlay,
  ANALYZE_STEPS,
  ANALYZE_TOTAL,
} from "@/components/vscode/AnalyzingOverlay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

/** 간단 해시 */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
}

type DemoResult = MockAnalysis & { elapsedMs?: number };

/** ✅ 분석 전 기본 패널용 Placeholder 생성 */
function makePlaceholderAnalysis(model: string): DemoResult {
  return {
    id: "placeholder",
    title: "분석 준비됨 — 코드를 입력하고 분석을 실행하세요",
    model: model as any,
    detectionConfidence: 0,
    aspect_scores: {
      functionality: 0,
      reliability: 0,
      usability: 0,
      efficiency: 0,
      maintainability: 0,
      portability: 0,
      security: 0,
    },
    average_score: 0,
    summaries: {
      functionality: "기능 요구사항 충족 여부와 주요 동작 일관성을 점검합니다.",
      reliability: "오류 발생 빈도, 실패 대응(예외/재시도) 기준을 확인합니다.",
      usability: "UI/UX의 직관성, 접근성, 학습 용이성을 검토합니다.",
      efficiency: "연산/메모리/네트워크 등 자원 사용을 최적화할 여지를 봅니다.",
      maintainability:
        "복잡도, 모듈화, 테스트 용이성 등 변경 친화성을 확인합니다.",
      portability:
        "환경 의존성 최소화 및 다양한 플랫폼 전환 가능성을 살핍니다.",
      security: "민감정보 노출, 입력 검증, 취약 API 사용 여부를 점검합니다.",
    },
    comments: {
      functionality:
        "핵심 시나리오의 에지 케이스(빈 값, null 등)를 테스트에 포함하세요.",
      reliability: "비동기 실패 처리와 백오프/재시도 정책을 명시하세요.",
      usability: "피드백(로딩/에러/성공)을 UI에 통일된 패턴으로 제공하세요.",
      efficiency: "중복 계산/IO는 캐시/배치 처리로 최적화하세요.",
      maintainability: "모듈 경계를 명확히 하고 공통 유틸을 분리하세요.",
      portability: "환경변수/경로 처리는 추상화 계층 뒤에서 관리하세요.",
      security:
        "입력 스키마 검증(zod/joi)과 비밀키 관리(.env)를 철저히 하세요.",
    },
    elapsedMs: undefined,
  };
}

export default function ExtensionDemo() {
  const [prompt, setPrompt] = useState("");
  const [filename, setFilename] = useState("src/app/example.ts");
  const [framework, setFramework] = useState("React");
  const [model, setModel] = useState<ModelId>(
    MODEL_OPTIONS[0].value as ModelId
  );
  const [result, setResult] = useState<DemoResult | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const pickByPrompt = useMemo(() => {
    const h = hash(prompt + "|" + filename + "|" + framework + "|" + model);
    const idx = h % MOCK_ANALYSES.length;
    return MOCK_ANALYSES[idx];
  }, [prompt, filename, framework, model]);

  async function analyzeWithFakeDelay() {
    setIsAnalyzing(true);
    setProgress(0);
    setStepIndex(0);
    cancelRef.current.cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((res) => setTimeout(res, ms));
    const totalMs = 3000;

    for (let i = 0; i < ANALYZE_STEPS.length; i++) {
      if (cancelRef.current.cancelled) break;
      setStepIndex(i);

      const sliceMs = Math.round(
        (ANALYZE_STEPS[i].weight / ANALYZE_TOTAL) * totalMs
      );
      const slices = Math.max(3, Math.floor(sliceMs / 80));
      const inc = Math.round((ANALYZE_STEPS[i].weight / ANALYZE_TOTAL) * 100);

      for (let s = 0; s < slices; s++) {
        if (cancelRef.current.cancelled) break;
        await sleep(Math.round(sliceMs / slices));
        setProgress((p) => Math.min(100, p + Math.ceil(inc / slices)));
      }
    }

    if (!cancelRef.current.cancelled) setProgress(100);
    await new Promise((r) => setTimeout(r, 150));
  }

  async function analyze() {
    if (isAnalyzing) return;
    const start = performance.now();

    await analyzeWithFakeDelay();

    if (!cancelRef.current.cancelled) {
      const picked: DemoResult = {
        ...pickByPrompt,
        model,
        elapsedMs: Math.round(performance.now() - start),
      };
      setResult(picked);
    }

    setIsAnalyzing(false);
    cancelRef.current.cancelled = false;
    setProgress(0);
    setStepIndex(0);
  }

  function cancelAnalyze() {
    if (!isAnalyzing) return;
    cancelRef.current.cancelled = true;
    setIsAnalyzing(false);
    setProgress(0);
    setStepIndex(0);
  }

  function randomize() {
    if (isAnalyzing) return;
    const idx = Math.floor(Math.random() * MOCK_ANALYSES.length);
    const picked: DemoResult = {
      ...MOCK_ANALYSES[idx],
      model,
      elapsedMs: undefined,
    };
    setResult(picked);
  }

  // ✅ 결과가 없을 때도 기본 패널(점수 0 + 기본 설명) 표시
  const panelData: DemoResult = result ?? makePlaceholderAnalysis(model);

  const RightPanel = (
    <div className="relative">
      {/* 옵션 바 */}
      <div className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-[#9aa0a6]">Framework</div>
          <Select value={framework} onValueChange={setFramework}>
            <SelectTrigger className="w-32 h-8 bg-[#1e1e1e] border-[#3a3a3a] text-[#d4d4d4]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#252526] text-[#d4d4d4] border-[#3a3a3a]">
              <SelectItem value="React">React</SelectItem>
              <SelectItem value="Node">Node</SelectItem>
              <SelectItem value="Next.js">Next.js</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Go">Go</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-2 text-xs text-[#9aa0a6]">Model</div>
          <Select value={model} onValueChange={(v) => setModel(v as ModelId)}>
            <SelectTrigger className="w-44 h-8 bg-[#1e1e1e] border-[#3a3a3a] text-[#d4d4d4]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80 overflow-auto bg-[#252526] text-[#d4d4d4] border-[#3a3a3a]">
              {MODEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value as ModelId}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={randomize}
            disabled={isAnalyzing}
            className="ml-auto text-xs px-2 py-1 rounded bg-[#3a3d41] hover:bg-[#4b4e52] disabled:opacity-50"
          >
            랜덤 결과
          </button>
        </div>
      </div>

      {/* ✅ 결과(없어도 placeholder로 렌더) */}
      <ExtensionLikePanel data={panelData} />

      {/* 분석 오버레이 */}
      <AnalyzingOverlay
        visible={isAnalyzing}
        progress={Math.min(100, progress)}
        currentStepIndex={Math.min(stepIndex, ANALYZE_STEPS.length - 1)}
      />

      {/* 취소 버튼(랜드 버튼과 겹치지 않게 bottom-16) */}
      {isAnalyzing && (
        <div className="pointer-events-none absolute bottom-16 right-4 z-30">
          <button
            onClick={cancelAnalyze}
            className="pointer-events-auto rounded-md border border-[#2a2a2a] bg-[#252526] px-3 py-1.5 text-xs text-[#d4d4d4] hover:bg-[#2d2d2d]"
          >
            취소
          </button>
        </div>
      )}

      {/* 오른쪽 하단 / (랜딩) 이동 버튼 + 툴팁 */}
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/"
              className="fixed right-4 bottom-4 z-40 grid h-10 w-10 place-items-center rounded-md border border-[#2a2a2a] bg-[#252526] text-[#d4d4d4] hover:bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e639c] focus:ring-offset-[#1e1e1e]"
              aria-label="랜딩 페이지로 이동"
            >
              <Home className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="bg-[#252526] text-[#d4d4d4] border-[#2a2a2a]"
          >
            랜딩 페이지로 이동
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <VscodeShell
      title="Extension Demo — VSCode Mock"
      left={
        <EditorMock
          filename={filename}
          setFilename={setFilename}
          value={prompt}
          setValue={setPrompt}
          onAnalyze={analyze}
        />
      }
      right={RightPanel}
    />
  );
}
