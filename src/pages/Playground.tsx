"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/features/auth/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import {
  BarChart3,
  Check,
  ChevronsUpDown,
  Cpu,
  FileText,
  Gauge,
  Loader2,
  MonitorPlay,
  Search,
  Wand2,
  Copy,
  CheckCheck,
  Sparkles,
} from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { MODEL_OPTIONS, type ModelOption } from "@/constants/modelOptions";

/* ======================
   샘플
====================== */
const SAMPLES: Record<string, string> = {
  ex1: `# 리스트 원소 두 배 만들기 (Python)
arr = [1, 12, 3, 4, -5]
arr2 = [e * 2 for e in arr]
print(arr2)
`,
  ex2: `# 평균 계산 함수 예제
def calculate_average(nums):
    if not nums:
        return 0
    return sum(nums) / len(nums)

print(calculate_average([1, 2, 3, 4]))
`,
  ex3: `# 간단한 팩토리얼 함수
def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
`,
};

type Phase = "idle" | "requesting" | "fetching" | "done" | "error";

/** /v1/reviews/{review_id} 결과(서비스용으로 필요한 부분만) */
type ScoresByCategory = {
  bug: number;
  maintainability: number;
  style: number;
  security: number;
  [key: string]: number;
};

type ReviewBody = {
  quality_score: number;
  summary: string;
  scores_by_category: ScoresByCategory;
  comments: Record<string, string>;
};

type ReviewDetailResponse = {
  meta?: any;
  body: ReviewBody;
};

/* ======================
   톤/스타일 토큰
====================== */
const brandHeaderBase =
  "relative px-5 pt-5 pb-4 border-b border-slate-200/70 dark:border-white/10";

const iconWrapBase =
  "relative grid place-items-center h-11 w-11 rounded-2xl " +
  "ring-1 ring-purple-500/25 dark:ring-purple-300/25 " +
  "bg-purple-500/5 dark:bg-purple-300/10 " +
  "shadow-[0_0_0_6px_rgba(139,92,246,0.08)] dark:shadow-[0_0_0_6px_rgba(196,181,253,0.10)]";

const iconGlyphBase = "h-6 w-6 text-purple-700 dark:text-purple-200";

function BrandHeader({
  icon: Icon,
  title,
  subtitle,
  right,
  muted = false,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        brandHeaderBase,
        muted && "border-slate-200/40 dark:border-white/5"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              iconWrapBase,
              muted &&
                "ring-slate-300/40 dark:ring-white/10 bg-slate-900/5 dark:bg-white/5 shadow-none"
            )}
          >
            <Icon
              className={cn(
                iconGlyphBase,
                muted && "text-slate-500 dark:text-white/60"
              )}
            />
          </div>

          <div className="min-w-0">
            <div
              className={cn(
                "text-[15px] font-extrabold tracking-tight",
                muted
                  ? "text-slate-700 dark:text-white/80"
                  : "text-slate-900 dark:text-white"
              )}
            >
              {title}
            </div>
            {subtitle ? (
              <p className="mt-1 text-xs text-slate-600 dark:text-white/70 line-clamp-1">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}

/* ======================
   미니 유틸/UI
====================== */
function getCategoryColor(category: string): string {
  switch (category) {
    case "bug":
      return "#ef4444";
    case "maintainability":
      return "#0ea5e9";
    case "style":
      return "#a855f7";
    case "security":
      return "#f59e0b";
    default:
      return "#64748b";
  }
}

function formatModelName(model: ModelOption) {
  const parts = model.id.split("/");
  const provider = parts[0] ?? "unknown";
  const name = parts.slice(1).join("/") || model.id;
  return { provider, name };
}

type ModelSearchComboboxProps = {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function ModelSearchCombobox({
  value,
  onChange,
  disabled,
}: ModelSearchComboboxProps) {
  const [open, setOpen] = useState(false);

  const sortedModels = useMemo(
    () =>
      [...MODEL_OPTIONS].sort((a, b) => {
        const pa = a.provider.localeCompare(b.provider);
        if (pa !== 0) return pa;
        return a.id.localeCompare(b.id);
      }),
    []
  );

  const selectedModel = useMemo(
    () => sortedModels.find((m) => m.id === value) ?? null,
    [sortedModels, value]
  );

  const selectedMeta = selectedModel ? formatModelName(selectedModel) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-xs md:text-sm cursor-pointer",
            "bg-white/70 dark:bg-white/5",
            "border-slate-200/70 dark:border-white/10",
            "hover:bg-white/90 dark:hover:bg-white/10",
            "transition"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Cpu className="h-4 w-4 text-violet-500 dark:text-violet-300" />
            {selectedModel ? (
              <div className="flex flex-col text-left min-w-0">
                <span className="truncate text-xs font-medium md:text-sm">
                  {selectedMeta?.name}
                </span>
                <span className="text-[10px] uppercase text-slate-500 dark:text-white/50">
                  {selectedMeta?.provider}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                모델을 검색해서 선택하세요
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-[320px] p-0",
          "border-slate-200/70 dark:border-white/10",
          "bg-white dark:bg-slate-950"
        )}
        align="end"
      >
        <Command>
          <CommandInput
            placeholder="모델 이름 / provider 검색..."
            className="text-xs"
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              검색 결과가 없습니다.
            </CommandEmpty>
            <CommandGroup heading="모델 목록" className="text-[11px]">
              {sortedModels.map((model) => {
                const { provider, name } = formatModelName(model);
                const isSelected = model.id === value;
                return (
                  <CommandItem
                    key={model.id}
                    value={`${model.id} ${provider} ${name}`}
                    onSelect={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="inline-flex h-5 items-center rounded-full bg-slate-900 px-2 text-[10px] font-mono uppercase text-slate-200 dark:bg-white/10 dark:text-white/80">
                      {provider}
                    </span>
                    <span className="truncate">{name}</span>
                    {isSelected && (
                      <Check className="ml-auto h-3.5 w-3.5 text-violet-500 dark:text-violet-300" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function BigInlineLoading({ title, desc }: { title: string; desc?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-7",
        "bg-white/70 dark:bg-white/5",
        "border-slate-200/70 dark:border-white/10"
      )}
    >
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
            <div className="pointer-events-none absolute -inset-3 rounded-full blur-xl bg-violet-500/10" />
          </div>

          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </div>
          {desc ? (
            <div className="text-xs text-slate-600 dark:text-white/70">
              {desc}
            </div>
          ) : null}

          <div className="mt-2 w-[min(420px,90vw)]">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-violet-500/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-7",
        "bg-white/60 dark:bg-white/5",
        "border-slate-200/70 dark:border-white/10"
      )}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className={cn(
            "grid h-12 w-12 place-items-center rounded-2xl",
            "bg-slate-900/5 dark:bg-white/10"
          )}
        >
          <Icon className="h-6 w-6 text-slate-600 dark:text-white/70" />
        </div>
        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </div>
        {desc ? (
          <div className="text-xs text-slate-600 dark:text-white/70 max-w-[46ch]">
            {desc}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** fix 응답에서 코드만 최대한 “서비스용”으로 뽑기 */
function extractImprovedCode(raw: string): string {
  if (!raw) return "";

  // 1) JSON 가능하면 후보 키들에서 추출
  try {
    const j = JSON.parse(raw);
    const candidates = [
      j?.body?.code,
      j?.body?.fixed_code,
      j?.body?.improved_code,
      j?.code,
      j?.fixed_code,
      j?.improved_code,
      j?.result?.code,
      j?.result?.fixed_code,
      j?.result?.improved_code,
      j?.data?.code,
      j?.data?.fixed_code,
      j?.data?.improved_code,
    ];
    const found = candidates.find(
      (v) => typeof v === "string" && v.trim().length > 0
    );
    if (found) return found.trim();
  } catch {
    // ignore
  }

  // 2) 마크다운 코드펜스가 있으면 첫 블록 추출
  const fence = raw.match(/```[\s\S]*?```/);
  if (fence?.[0]) {
    return fence[0]
      .replace(/^```[a-zA-Z0-9_-]*\n?/, "")
      .replace(/```$/, "")
      .trim();
  }

  // 3) 그냥 텍스트로
  return raw.trim();
}

export default function Playground() {
  const { user } = useAuth();

  const [selected, setSelected] = useState<string>();
  const [code, setCode] = useState<string>("");

  const defaultModelId =
    MODEL_OPTIONS.find((m) => m.id.startsWith("openai/"))?.id ??
    MODEL_OPTIONS[0]?.id ??
    "";
  const [modelId, setModelId] = useState<string>(defaultModelId);

  const [phase, setPhase] = useState<Phase>("idle");
  const [loading, setLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // 서비스용 결과만
  const [reviewDetail, setReviewDetail] = useState<ReviewDetailResponse | null>(
    null
  );
  const [improvedCode, setImprovedCode] = useState<string>("");

  // 내부 동작을 위한 값(표시 X)
  const [lastReviewId, setLastReviewId] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 자동 스크롤 타겟
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);

  // 개선 코드 복사 UX
  const [copied, setCopied] = useState(false);

  const subtleCard =
    "overflow-hidden pt-0 border border-slate-200 bg-white shadow-sm " +
    "dark:border-white/15 dark:bg-slate-900/40";

  const onPick = (val: string) => {
    setSelected(val);
    setCode(SAMPLES[val] ?? "");
  };

  const body: ReviewBody | null = reviewDetail?.body ?? null;

  const qualityScoreRaw = body?.quality_score ?? null;
  const qualityScore =
    typeof qualityScoreRaw === "number"
      ? Math.max(0, Math.min(100, qualityScoreRaw))
      : null;

  const summaryText = body?.summary ?? "";
  const scoresByCategory: ScoresByCategory | null =
    body?.scores_by_category ?? null;
  const comments: Record<string, string> | null = body?.comments ?? null;

  const categoryOrder = ["bug", "maintainability", "style", "security"];
  const availableCategories =
    scoresByCategory || comments
      ? categoryOrder.filter(
          (k) =>
            (scoresByCategory && k in scoresByCategory) ||
            (comments && k in comments)
        )
      : [];

  const canRun =
    code.trim().length > 0 && !!user && !!modelId && !loading && !fixLoading;

  // 리뷰가 나온 뒤에만 fix 가능
  const canFix = !!body && lastReviewId != null && !loading && !fixLoading;

  const currentModel = useMemo(
    () => MODEL_OPTIONS.find((m) => m.id === modelId) ?? null,
    [modelId]
  );
  const currentModelMeta = currentModel ? formatModelName(currentModel) : null;

  const scrollToReview = () => {
    window.setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const run = async () => {
    setError(null);
    setImprovedCode("");
    setReviewDetail(null);
    setLastReviewId(null);
    setCopied(false);

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (!user.github_id) {
      setError("사용자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
      return;
    }
    if (!modelId) {
      setError("모델을 선택해 주세요.");
      return;
    }

    setPhase("requesting");
    setLoading(true);
    scrollToReview();

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const nowIso = new Date().toISOString();
      const payload = {
        meta: {
          github_id: user.github_id,
          review_id: null as number | null,
          version: "v1",
          actor: "web-playground",
          language: "python",
          trigger: "manual",
          code_fingerprint: null as string | null,
          model: modelId,
          result: null,
          audit: nowIso as string,
        },
        body: { snippet: { code } },
      };

      // 1) POST request
      const postUrl = "/api/v1/reviews/request";
      const postResp = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });

      const postText = await postResp.text();
      if (!postResp.ok) {
        throw new Error(
          "리뷰 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
        );
      }

      let reviewId: number | null = null;
      try {
        const parsed = JSON.parse(postText);
        reviewId = parsed?.body?.review_id ?? parsed?.review_id ?? null;
      } catch {
        // ignore
      }
      if (reviewId == null) {
        throw new Error("리뷰 생성에 실패했습니다. 다시 시도해 주세요.");
      }
      setLastReviewId(reviewId);

      // 2) GET detail
      setPhase("fetching");
      const getUrl = `/api/v1/reviews/${reviewId}`;
      const getResp = await fetch(getUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: ac.signal,
      });

      const getText = await getResp.text();
      if (!getResp.ok) {
        throw new Error("리뷰 결과를 불러오지 못했습니다. 다시 시도해 주세요.");
      }

      try {
        const parsedGet = JSON.parse(getText) as ReviewDetailResponse;
        if (!parsedGet?.body) throw new Error();
        setReviewDetail(parsedGet);
        setPhase("done");
      } catch {
        throw new Error("리뷰 결과 처리 중 문제가 발생했습니다.");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? "요청 처리 중 문제가 발생했습니다.");
        setPhase("error");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const runFix = async () => {
    if (!body || lastReviewId == null) return;

    setError(null);
    setFixLoading(true);
    setCopied(false);

    try {
      const fixUrl = "/api/v1/fix";
      const resp = await fetch(fixUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: lastReviewId, code }),
      });

      const text = await resp.text();
      if (!resp.ok) {
        throw new Error(
          "개선 코드 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
        );
      }

      const extracted = extractImprovedCode(text);
      if (!extracted) {
        throw new Error("개선 코드를 받아오지 못했습니다. 다시 시도해 주세요.");
      }
      setImprovedCode(extracted);
    } catch (e: any) {
      setError(e?.message ?? "개선 코드 생성 중 문제가 발생했습니다.");
    } finally {
      setFixLoading(false);
    }
  };

  const copyImproved = async () => {
    if (!improvedCode?.trim()) return;
    try {
      await navigator.clipboard.writeText(improvedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore: clipboard permission
    }
  };

  // 언마운트/이탈 시 abort
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // ✅ 개선 코드 섹션: 리뷰 없으면 “닫힘”
  const improvedOpen = !!body || fixLoading || improvedCode.trim().length > 0;

  // ✅ 초기 진입 UX: 우측/하단은 “존재감은 있지만 무게는 낮게”
  const isInitial = !loading && !body && !error;

  return (
    <div className="space-y-6 mt-6 pb-16">
      {/* ===== 상단: 좌우 레이아웃 ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: 입력 코드 */}
        <Card className={subtleCard}>
          <BrandHeader
            icon={MonitorPlay}
            title="입력 코드"
            subtitle="코드를 붙여넣고 분석을 시작하세요."
            right={
              <div className="flex items-center gap-2">
                {currentModelMeta && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-[10px] text-purple-700 dark:text-white">
                    <Cpu className="h-3 w-3 text-purple-600 dark:text-purple-300" />
                    <span className="uppercase text-[9px] text-slate-500 dark:text-white/60">
                      {currentModelMeta.provider}
                    </span>
                    <span className="max-w-[160px] truncate">
                      {currentModelMeta.name}
                    </span>
                  </span>
                )}

                {(loading || fixLoading) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-[11px] font-medium text-purple-700 dark:text-purple-200">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {fixLoading ? "개선 코드 만드는 중..." : "AI가 분석 중..."}
                  </span>
                )}
              </div>
            }
          />

          <CardContent className="space-y-4 pt-4">
            {/* 샘플 / 모델 선택 */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  코드 샘플
                </p>
                <Select onValueChange={onPick} value={selected}>
                  <SelectTrigger className="text-xs md:text-sm cursor-pointer bg-white/70 dark:bg-white/5 border-slate-200/70 dark:border-white/10">
                    <SelectValue placeholder="샘플 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ex1">배열 두 배 만들기</SelectItem>
                    <SelectItem value="ex2">평균 계산 함수</SelectItem>
                    <SelectItem value="ex3">팩토리얼 함수</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-[340px]">
                <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Search className="h-3.5 w-3.5 text-violet-400" />
                  사용할 모델 선택
                </p>
                <ModelSearchCombobox
                  value={modelId || null}
                  onChange={setModelId}
                  disabled={loading || fixLoading}
                />
              </div>
            </div>

            {/* 코드 입력 */}
            <Textarea
              className={cn(
                "min-h-[280px] font-mono text-sm leading-relaxed",
                "bg-white/70 dark:bg-white/5",
                "border-slate-200/70 dark:border-white/10",
                "focus-visible:ring-2 focus-visible:ring-purple-500/60"
              )}
              placeholder="여기에 코드를 붙여넣거나 샘플을 선택하세요."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading || fixLoading}
            />

            {/* 실행 */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  disabled={!canRun}
                  onClick={run}
                  className={cn(
                    "cursor-pointer h-11 px-4 rounded-2xl font-extrabold",
                    "bg-purple-600 text-white hover:bg-purple-500 active:bg-purple-700",
                    "transition hover:-translate-y-[1px]",
                    "shadow-[0_10px_30px_rgba(139,92,246,0.18)]",
                    "disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none"
                  )}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "분석 중..." : "이 코드 분석하기"}
                </Button>

                {!user && (
                  <span className="text-xs text-red-400">
                    로그인 후에 사용할 수 있어요.
                  </span>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200/70 dark:border-red-500/30 bg-red-50/70 dark:bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-200">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: 개선 코드 */}
        <Card
          className={cn(
            subtleCard,
            isInitial && "opacity-[0.88] saturate-[0.96]"
          )}
        >
          <BrandHeader
            icon={Wand2}
            title="개선 코드"
            subtitle="리뷰가 끝나면 더 나은 코드를 제안해요."
            muted={isInitial && !improvedOpen}
            right={
              body ? (
                <Button
                  disabled={!canFix}
                  onClick={runFix}
                  className={cn(
                    "h-10 px-4 text-xs rounded-2xl font-extrabold",
                    "cursor-pointer",
                    "bg-purple-600 text-white hover:bg-purple-500 active:bg-purple-700",
                    "transition hover:-translate-y-[1px]",
                    "shadow-[0_10px_30px_rgba(139,92,246,0.18)]",
                    "disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none"
                  )}
                >
                  {fixLoading ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                  )}
                  {fixLoading ? "만드는 중..." : "개선 코드 받아보기"}
                </Button>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-900/5 px-2 py-1 text-[11px] text-slate-700 dark:bg-white/10 dark:text-white/70">
                  리뷰 후 사용 가능
                </span>
              )
            }
          />

          <CardContent className="pt-4">
            {!improvedOpen ? (
              <EmptyState
                icon={Wand2}
                title="아직 개선 코드를 만들 수 없어요"
                desc="왼쪽에서 먼저 ‘이 코드 분석하기’를 눌러 주세요."
              />
            ) : fixLoading ? (
              <BigInlineLoading
                title="개선 코드를 생성하고 있어요"
                desc="잠시만 기다려 주세요."
              />
            ) : improvedCode ? (
              <div
                className={cn(
                  "rounded-2xl border p-4",
                  "bg-white/60 dark:bg-white/5",
                  "border-slate-200/70 dark:border-white/10",
                  "shadow-sm"
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      개선된 코드가 준비됐어요
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyImproved}
                    className={cn(
                      "h-8 px-3 rounded-xl text-xs",
                      "bg-white/70 dark:bg-white/5",
                      "border-slate-200/70 dark:border-white/10",
                      "hover:bg-white/90 dark:hover:bg-white/10",
                      "cursor-pointer"
                    )}
                  >
                    {copied ? (
                      <CheckCheck className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="mr-2 h-3.5 w-3.5" />
                    )}
                    {copied ? "복사됨" : "복사"}
                  </Button>
                </div>

                <ScrollArea className="mt-1 max-h-[360px] rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-950/90 p-3 text-xs font-mono leading-relaxed text-slate-50">
                  <pre className="whitespace-pre-wrap">{improvedCode}</pre>
                </ScrollArea>
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="리뷰는 끝났어요"
                desc="우측 상단의 ‘개선 코드 받아보기’를 눌러 보세요."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== 아래: 리뷰 결과 (자동 스크롤 타겟) ===== */}
      <div ref={reviewSectionRef} />

      <Card className={subtleCard}>
        <BrandHeader
          icon={BarChart3}
          title="리뷰 결과"
          subtitle="총점 · 요약 · 카테고리 코멘트를 한 번에 확인하세요."
          muted={isInitial && !loading && !body}
        />

        <CardContent className="pt-4">
          {/* ✅ 리뷰 생성 중: 아래 섹션에 크게 로딩 */}
          {loading && (
            <BigInlineLoading
              title="AI가 코드를 분석하고 있어요"
              desc="보통 몇 초 안에 결과가 나와요."
            />
          )}

          {/* ✅ 완료 상태 */}
          {!loading && body && (
            <div className={cn("space-y-6", fixLoading && "opacity-90")}>
              <div className="grid gap-4 lg:grid-cols-2">
                {/* 총점 + 요약 */}
                <div className="space-y-4">
                  {/* 총점 */}
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      "bg-white/60 dark:bg-white/5",
                      "border-slate-200/70 dark:border-white/10",
                      "shadow-sm"
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        전체 품질 점수
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                          {qualityScore != null ? qualityScore.toFixed(1) : "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          / 100
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-500/80"
                          style={{
                            width:
                              qualityScore != null
                                ? `${Math.max(0, Math.min(100, qualityScore))}%`
                                : "0%",
                          }}
                        />
                      </div>

                      <p className="mt-3 text-[11px] text-muted-foreground">
                        점수가 높을수록 전반적인 코드 품질이 좋다는 의미입니다.
                      </p>
                    </div>
                  </div>

                  {/* 요약 */}
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      "bg-white/60 dark:bg-white/5",
                      "border-slate-200/70 dark:border-white/10",
                      "shadow-sm"
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-sky-500" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        요약
                      </span>
                    </div>

                    <ScrollArea className="mt-1 max-h-56 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-black/20 p-3 text-xs leading-relaxed">
                      {summaryText || "요약 정보가 없습니다."}
                    </ScrollArea>
                  </div>
                </div>

                {/* 카테고리 */}
                <div className="space-y-4">
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      "bg-white/60 dark:bg-white/5",
                      "border-slate-200/70 dark:border-white/10",
                      "shadow-sm"
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-violet-500" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        카테고리별 코멘트
                      </span>
                    </div>

                    {!scoresByCategory && !comments ? (
                      <div className="mt-1 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-black/20 p-3 text-xs text-muted-foreground">
                        카테고리 정보가 없습니다.
                      </div>
                    ) : (
                      <div className="mt-2 space-y-3 text-xs">
                        {availableCategories.map((key) => {
                          const v =
                            scoresByCategory && key in scoresByCategory
                              ? scoresByCategory[key]
                              : null;

                          const numeric =
                            typeof v === "number"
                              ? v
                              : Number.isFinite(Number(v))
                              ? Number(v)
                              : null;

                          const commentText =
                            comments && key in comments ? comments[key] : "";

                          const color = getCategoryColor(key);

                          return (
                            <div
                              key={key}
                              className={cn(
                                "rounded-2xl px-3 py-3",
                                "border border-slate-200/70 dark:border-white/10",
                                "bg-white/70 dark:bg-black/20"
                              )}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-[11px] font-semibold capitalize">
                                    {key}
                                  </span>
                                </div>

                                <span className="text-[11px] text-muted-foreground">
                                  {numeric != null ? numeric.toFixed(1) : "-"}
                                  <span className="opacity-60"> / 100</span>
                                </span>
                              </div>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width:
                                      numeric != null
                                        ? `${Math.max(
                                            0,
                                            Math.min(100, numeric)
                                          )}%`
                                        : "0%",
                                    backgroundColor: color,
                                    opacity: 0.75,
                                  }}
                                />
                              </div>

                              <p className="mt-2 text-[11px] leading-relaxed text-slate-800 dark:text-white/80">
                                {commentText || "코멘트가 없습니다."}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ 아무 것도 없을 때 (초기 진입 UX: 중앙 정렬 + 안내) */}
          {!loading && !body && (
            <div className="py-2">
              <EmptyState
                icon={BarChart3}
                title="아직 결과가 없어요"
                desc="왼쪽에서 코드를 입력하고 ‘이 코드 분석하기’를 눌러 시작해 보세요."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
