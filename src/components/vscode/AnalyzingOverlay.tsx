import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { label: string; weight: number };

const STEPS: Step[] = [
  { label: "Parsing snippet...", weight: 18 },
  { label: "Static checks (bug/security)...", weight: 22 },
  { label: "LLM scoring (8 aspects)...", weight: 28 },
  { label: "Normalizing & model-score...", weight: 18 },
  { label: "Rendering panel...", weight: 14 },
];

export function AnalyzingOverlay({
  visible,
  className,
  progress,
  currentStepIndex,
}: {
  visible: boolean;
  className?: string;
  progress: number; // 0~100
  currentStepIndex: number; // 0~(STEPS.length-1)
}) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center",
        "bg-black/40 backdrop-blur-sm",
        className
      )}
    >
      <div className="w-full max-w-md rounded-xl border border-[#2a2a2a] bg-[#1e1e1e]/95 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#252526] p-2">
            <Loader2 className="size-6 animate-spin text-[#9cdcfe]" />
          </div>
          <div>
            <div className="text-sm text-[#9aa0a6]">Analyzing</div>
            <div className="text-base font-semibold text-[#d4d4d4]">
              확장 패널용 모의 분석 중...
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-[#bdbdbd] tabular-nums">
          {STEPS[currentStepIndex]?.label ?? "Finalizing..."}
        </div>

        <div className="mt-2">
          <Progress value={progress} className="[&>div]:bg-[#0e639c]" />
          <div className="mt-1 text-right text-[11px] text-[#9aa0a6]">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}

// 단계 합계(가중치 → 100% 스케일 변환용)와 보조 유틸을 노출하면 재사용 편함
export const ANALYZE_STEPS = STEPS;
export const ANALYZE_TOTAL = STEPS.reduce((a, s) => a + s.weight, 0);
