import { useMemo, useState, useRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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

      {/* 결과 */}
      {result ? (
        <ExtensionLikePanel data={result} />
      ) : (
        <Card className="m-4 border-[#2a2a2a] bg-[#1e1e1e]">
          <CardContent className="py-10 text-center text-sm text-[#9aa0a6]">
            좌측 에디터에 내용을 입력하고 <b>Ctrl/Cmd + Enter</b> 또는 상단{" "}
            <b>분석</b> 버튼을 눌러 결과를 확인하세요.
          </CardContent>
        </Card>
      )}

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

      {/* 오른쪽 하단 /landing 이동 버튼 + 툴팁 */}
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
