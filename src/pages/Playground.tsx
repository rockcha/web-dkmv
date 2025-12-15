// src/pages/Playground.tsx
"use client";

import { useRef, useState, useMemo } from "react";
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

/* Lucide 아이콘 */
import {
  Gauge,
  FileText,
  BarChart3,
  Loader2,
  ChevronsUpDown,
  Search,
  Cpu,
  Check,
  Wand2,
  MonitorPlay,
} from "lucide-react";

/* 검색용 콤보박스 UI */
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

/* 모델 리스트 (실제 백엔드용 ID들) */
import { MODEL_OPTIONS, type ModelOption } from "@/constants/modelOptions";

const SAMPLES: Record<string, string> = {
  ex1: `# 리스트 원소 두 배 만들기 (Python)
arr = [1, 12, 3, 4, -5]
arr2 = [e * 2 for e in arr]

print(arr2)
print(arr)
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

type Phase =
  | "idle"
  | "requesting"
  | "requested"
  | "fetching"
  | "fetched"
  | "error";

/** /v1/reviews/{review_id} 최종 응답 타입 (필요한 부분만 정의) */
type ReviewMeta = {
  github_id?: string | null;
  review_id?: number | null;
  version?: string;
  actor?: string;
  language?: string;
  trigger?: string;
  code_fingerprint?: string | null;
  model?: string | null;
  result?: {
    result_ref?: string | null;
    error_message?: string | null;
  } | null;
  audit?: string | null;
  status?: string;
  [key: string]: any;
};

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
  meta: ReviewMeta;
  body: ReviewBody;
};

/* ===========================================================
   ✅ Analyses 톤 Brand Header (Playground에서도 통일)
=========================================================== */

const brandHeader =
  "relative px-5 pt-5 pb-4 border-b border-slate-200/70 dark:border-white/10";

const iconWrap =
  "relative grid place-items-center h-11 w-11 rounded-2xl " +
  "ring-1 ring-purple-500/25 dark:ring-purple-300/25 " +
  "bg-purple-500/5 dark:bg-purple-300/10 " +
  "shadow-[0_0_0_6px_rgba(139,92,246,0.08)] dark:shadow-[0_0_0_6px_rgba(196,181,253,0.10)]";

const iconGlyph = "h-6 w-6 text-purple-700 dark:text-purple-200";

function BrandHeader({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={brandHeader}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={iconWrap}>
            <Icon className={iconGlyph} />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
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

/**
 * 공통 도넛 컴포넌트
 */
type DonutScoreProps = {
  value: number | null;
  size?: number; // px
  color?: string; // 메인 색
  backgroundColor?: string;
  label?: string;
  className?: string;
};

function DonutScore({
  value,
  size = 120,
  color = "#22c55e",
  backgroundColor = "#020617",
  label,
  className,
}: DonutScoreProps) {
  const clamped =
    typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
  const angle = clamped * 3.6;

  return (
    <div
      className={cn("flex flex-col items-center gap-1", className)}
      aria-label={label}
    >
      <div
        className="relative flex items-center justify-center rounded-full shadow-inner"
        style={{
          width: size,
          height: size,
          backgroundImage: `conic-gradient(${color} ${angle}deg, ${backgroundColor} ${angle}deg)`,
        }}
      >
        <div
          className="absolute rounded-full bg-slate-950"
          style={{
            width: size - 22,
            height: size - 22,
          }}
        />
        <span className="relative text-base font-semibold">
          {value != null ? value.toFixed(1) : "-"}
        </span>
      </div>
      {label && (
        <span className="text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * 카테고리별 색상
 */
function getCategoryColor(category: string): string {
  switch (category) {
    case "bug":
      return "#ef4444"; // red-500
    case "maintainability":
      return "#0ea5e9"; // sky-500
    case "style":
      return "#a855f7"; // violet-500
    case "security":
      return "#f59e0b"; // amber-500
    default:
      return "#64748b"; // slate-500
  }
}

/**
 * 모델 라벨 예쁘게 포맷팅
 * - provider: openai
 * - name: gpt-5.1-codex
 */
function formatModelName(model: ModelOption) {
  const parts = model.id.split("/");
  const provider = parts[0] ?? "unknown";
  const name = parts.slice(1).join("/") || model.id;
  return { provider, name };
}

/**
 * 검색 가능한 모델 선택 콤보 박스
 */
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
            "hover:bg-white/90 dark:hover:bg-white/10"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Cpu className="h-4 w-4 text-violet-500 dark:text-violet-300" />
            {selectedModel ? (
              <div className="flex flex-col text-left">
                <span className="truncate text-xs font-medium md:text-sm">
                  {selectedMeta?.name}
                </span>
                <span className="text-[10px] uppercase text-slate-500 dark:text-white/50">
                  {selectedMeta?.provider}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                사용할 모델을 검색해서 선택하세요
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

export default function Playground() {
  const { user } = useAuth();

  const [selected, setSelected] = useState<string>();
  const [code, setCode] = useState<string>("");

  // 기본 모델: openai 계열 중 하나, 없으면 첫 번째
  const defaultModelId =
    MODEL_OPTIONS.find((m) => m.id.startsWith("openai/"))?.id ??
    MODEL_OPTIONS[0]?.id ??
    "";
  const [modelId, setModelId] = useState<string>(defaultModelId);

  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastReviewId, setLastReviewId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  // GET /v1/reviews/{review_id} 최종 리뷰 데이터
  const [reviewDetail, setReviewDetail] = useState<ReviewDetailResponse | null>(
    null
  );

  const [responseInfo, setResponseInfo] = useState<string>("");

  // /v1/fix 응답 (원문 그대로)
  const [fixLoading, setFixLoading] = useState(false);
  const [fixResponseRaw, setFixResponseRaw] = useState<string | null>(null);
  const [fixError, setFixError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const onPick = (val: string) => {
    setSelected(val);
    setCode(SAMPLES[val] ?? "");
  };

  const canRun = code.trim().length > 0 && !loading && !!user && !!modelId;

  const run = async () => {
    setError(null);
    setResponseInfo("");
    setFixResponseRaw(null);
    setFixError(null);
    setLastReviewId(null);
    setReviewDetail(null);

    setPhase("requesting");
    setLoading(true);

    if (!user) {
      setError("로그인이 되어 있지 않습니다. 먼저 로그인해 주세요.");
      setLoading(false);
      setPhase("error");
      return;
    }

    if (!user.github_id) {
      setError(
        "현재 사용자 github_id를 찾을 수 없습니다. 다시 로그인 후 시도해 주세요."
      );
      setLoading(false);
      setPhase("error");
      return;
    }

    if (!modelId) {
      setError("사용할 모델을 먼저 선택해 주세요.");
      setLoading(false);
      setPhase("error");
      return;
    }

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
          result: null as {
            result_ref: string | null;
            error_message: string | null;
          } | null,
          audit: nowIso as string,
        },
        body: {
          snippet: {
            code,
          },
        },
      };

      // 1) POST /v1/reviews/request
      const postUrl = "/api/v1/reviews/request";

      const postResp = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });

      const postText = await postResp.text();

      if (!postResp.ok) {
        setResponseInfo(
          `${postResp.status} ${postResp.statusText} • ${postUrl}`
        );
        throw new Error(
          `리뷰 생성 실패 (HTTP ${postResp.status})\n${postText}`
        );
      }

      let reviewId: number | null = null;
      try {
        const parsed = JSON.parse(postText);
        reviewId = parsed?.body?.review_id ?? parsed?.review_id ?? null;
        const status = parsed?.body?.status ?? parsed?.status;
        setResponseInfo(
          `${postResp.status} ${
            postResp.statusText
          } • ${postUrl} • review_id: ${reviewId ?? "?"} • status: ${
            status ?? "unknown"
          }`
        );
      } catch {
        // 아래에서 reviewId null 처리
      }

      if (reviewId == null) {
        throw new Error("리뷰 생성 응답에서 review_id를 찾을 수 없습니다.");
      }

      setPhase("requested");
      setLastReviewId(reviewId);

      // 2) GET /v1/reviews/{review_id}
      setPhase("fetching");

      const getUrl = `/api/v1/reviews/${reviewId}`;
      const getResp = await fetch(getUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: ac.signal,
      });

      const getText = await getResp.text();
      setResponseInfo(`${getResp.status} ${getResp.statusText} • ${getUrl}`);

      if (!getResp.ok) {
        throw new Error(`리뷰 조회 실패 (HTTP ${getResp.status})\n${getText}`);
      }

      try {
        const parsedGet = JSON.parse(getText) as ReviewDetailResponse;
        if (!parsedGet.meta || !parsedGet.body) {
          throw new Error(
            "/v1/reviews/{review_id} 응답에서 meta/body 구조를 찾지 못했습니다."
          );
        }
        setReviewDetail(parsedGet);
      } catch {
        throw new Error("리뷰 상세 응답 JSON 파싱에 실패했습니다.");
      }

      setPhase("fetched");
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? String(e));
        setPhase("error");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  // ✅ 단계 문구 제거: 한 줄 통일 상태 텍스트
  const reviewLoadingLabel =
    phase === "requesting" || phase === "fetching" || phase === "requested"
      ? "리뷰 생성 중..."
      : phase === "error"
      ? "에러"
      : phase === "fetched"
      ? "완료"
      : "";

  const primaryLabel = loading ? "리뷰 생성 중..." : "리뷰 생성 요청 보내기";

  // ========================
  // 결과 데이터
  // ========================
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

  const currentModel = useMemo(
    () => MODEL_OPTIONS.find((m) => m.id === modelId) ?? null,
    [modelId]
  );
  const currentModelMeta = currentModel ? formatModelName(currentModel) : null;

  // 리뷰가 나온 뒤에만 fix 가능
  const canFix = !!body && lastReviewId != null && !loading && !fixLoading;

  const runFix = async () => {
    if (!body || lastReviewId == null) return;

    setFixError(null);
    setFixResponseRaw(null);
    setFixLoading(true);

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
          `코드 수정 제안 요청 실패 (HTTP ${resp.status})\n${text}`
        );
      }

      setFixResponseRaw(text);
    } catch (e: any) {
      setFixError(e?.message ?? String(e));
    } finally {
      setFixLoading(false);
    }
  };

  const subtleCard =
    "overflow-hidden pt-0 border border-slate-200 bg-white shadow-sm " +
    "dark:border-white/15 dark:bg-slate-900/40";

  return (
    <div className="space-y-6 mt-6 pb-16">
      {/* 상단: Playground 컨트롤 */}
      <Card className={subtleCard}>
        <BrandHeader
          icon={MonitorPlay}
          title="Playground"
          subtitle="코드를 붙여넣고, 모델을 선택해서 AI 리뷰를 바로 받아보세요."
          right={
            <div className="flex items-center gap-2">
              {currentModelMeta && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-[10px] text-purple-700 dark:text-white">
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
                  {fixLoading ? "개선 코드 생성 중..." : "리뷰 생성 중..."}
                </span>
              )}
            </div>
          }
        />

        <CardContent className="space-y-4 pt-4">
          {/* 샘플 / 모델 선택 */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* 샘플 선택 */}
            <div className="flex-1">
              <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                코드 샘플
              </p>
              <Select onValueChange={onPick} value={selected}>
                <SelectTrigger className="text-xs md:text-sm cursor-pointer bg-white/70 dark:bg-white/5">
                  <SelectValue placeholder="코드 블록 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ex1">배열 두 배 만들기</SelectItem>
                  <SelectItem value="ex2">평균 계산 함수</SelectItem>
                  <SelectItem value="ex3">팩토리얼 함수</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 모델 검색 선택 */}
            <div className="w-full md:w-[340px]">
              <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground ">
                <Search className="h-3.5 w-3.5 text-violet-400" />
                내가 사용한 모델 선택
              </p>
              <ModelSearchCombobox
                value={modelId || null}
                onChange={setModelId}
                disabled={loading}
              />
            </div>
          </div>

          {/* 코드 입력 */}
          <Textarea
            className={cn(
              "min-h-[240px] font-mono text-sm",
              "bg-white/70 dark:bg-white/5",
              "border-slate-200/70 dark:border-white/10",
              "focus-visible:ring-2 focus-visible:ring-purple-500/60"
            )}
            placeholder="여기에 코드를 붙여넣거나 샘플을 선택하세요. (language는 항상 python으로 전송)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {/* 실행 컨트롤 */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={!canRun}
                onClick={run}
                className={cn(
                  "cursor-pointer",
                  "bg-purple-600 text-white hover:bg-purple-500 active:bg-purple-700",
                  "transition hover:-translate-y-[1px]",
                  "shadow-[0_10px_30px_rgba(139,92,246,0.18)]"
                )}
              >
                {loading && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {primaryLabel}
              </Button>

              {!user && (
                <span className="text-xs text-red-400">
                  * 로그인 후에만 요청을 보낼 수 있습니다.
                </span>
              )}
            </div>

            {/* ✅ 단계 제거: 한 줄 상태만 */}
            {(reviewLoadingLabel || lastReviewId != null) && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {reviewLoadingLabel && phase !== "idle" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-1 text-[11px] text-slate-700 dark:bg-white/10 dark:text-white/70">
                    {phase === "error" ? null : (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {reviewLoadingLabel}
                  </span>
                )}
                {lastReviewId != null && phase !== "idle" && (
                  <span className="text-[11px]">
                    review_id: <span className="font-mono">{lastReviewId}</span>
                  </span>
                )}
              </div>
            )}

            {responseInfo && (
              <span className="text-[11px] text-muted-foreground">
                {responseInfo}
              </span>
            )}

            {error && (
              <div className="text-sm text-red-400">에러: {String(error)}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 아래: 리뷰 결과 */}
      <Card className={subtleCard}>
        <BrandHeader
          icon={BarChart3}
          title="리뷰 결과"
          subtitle="총점 · 요약 · 카테고리별 코멘트를 한 번에 확인하세요."
          right={
            <div className="flex items-center gap-2">
              {body && (
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8 text-[11px] cursor-pointer rounded-full",
                    "bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10",
                    "border-slate-200/70 dark:border-white/10"
                  )}
                  disabled={!canFix}
                  onClick={runFix}
                >
                  {fixLoading ? (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="mr-1.5 h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
                  )}
                  {fixLoading ? "개선 코드 생성 중..." : "개선 코드 생성"}
                </Button>
              )}

              {(loading || fixLoading) && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-[11px] font-medium text-purple-700 dark:text-purple-200">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {fixLoading ? "개선 코드 생성 중..." : "리뷰 생성 중..."}
                </span>
              )}
            </div>
          }
        />

        <CardContent className="pt-4">
          {!reviewDetail || !body ? (
            loading ? (
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
                <div className="space-y-3 text-[11px]">
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                  <div className="h-8 animate-pulse rounded bg-slate-200/80 dark:bg-white/10" />
                  <div className="h-8 animate-pulse rounded bg-slate-200/70 dark:bg-white/10" />
                  <div className="h-8 animate-pulse rounded bg-slate-200/60 dark:bg-white/10" />
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                아직 리뷰 결과가 없습니다. 상단에서 코드를 전송해 리뷰를 생성해
                주세요.
              </div>
            )
          ) : (
            <div
              className={cn(
                "space-y-6",
                (loading || fixLoading) && "pointer-events-none opacity-85"
              )}
            >
              {/* 레이아웃: 왼쪽(총점+요약) / 오른쪽(카테고리) */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* 왼쪽 */}
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
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-muted-foreground">
                          전체 품질 점수
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <DonutScore
                        value={qualityScore}
                        size={140}
                        color="#22c55e"
                        backgroundColor="#020617"
                      />
                    </div>

                    <p className="mt-3 text-[11px] text-muted-foreground">
                      점수가 높을수록 전반적인 코드 품질이 좋다는 의미입니다.
                    </p>
                  </div>

                  {/* summary */}
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

                    <ScrollArea className="mt-1 max-h-48 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-black/20 p-3 text-xs leading-relaxed">
                      {summaryText || "요약 정보가 없습니다."}
                    </ScrollArea>
                  </div>
                </div>

                {/* 오른쪽 */}
                <div className="space-y-4">
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      "bg-white/60 dark:bg-white/5",
                      "border-slate-200/70 dark:border-white/10",
                      "shadow-sm"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-semibold text-muted-foreground">
                          카테고리별 점수 & 코멘트
                        </span>
                      </div>
                    </div>

                    {!scoresByCategory && !comments ? (
                      <div className="mt-1 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-black/20 p-3 text-xs text-muted-foreground">
                        카테고리별 점수/코멘트 정보가 없습니다.
                      </div>
                    ) : (
                      <div className="mt-1 space-y-3 text-xs">
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
                                "flex items-start gap-3 rounded-2xl px-3 py-2",
                                "border border-slate-200/70 dark:border-white/10",
                                "bg-white/70 dark:bg-black/20"
                              )}
                            >
                              <DonutScore
                                value={numeric}
                                size={70}
                                color={color}
                                backgroundColor="#020617"
                                className="mt-1 shrink-0"
                              />

                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold capitalize">
                                    {key}
                                  </span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-800 dark:text-white/80">
                                  {commentText || "코멘트가 없습니다."}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* /v1/fix 응답 뷰어 */}
              {fixError && (
                <div className="text-xs text-red-400">
                  개선 코드 생성 에러: {fixError}
                </div>
              )}

              {fixResponseRaw && (
                <div
                  className={cn(
                    "rounded-2xl border p-4",
                    "bg-white/60 dark:bg-white/5",
                    "border-slate-200/70 dark:border-white/10",
                    "shadow-sm"
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      개선 코드 생성 응답 (/v1/fix 원본)
                    </span>
                  </div>

                  <ScrollArea className="mt-1 max-h-64 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-950/90 p-3 text-xs font-mono leading-relaxed text-slate-50">
                    <pre className="whitespace-pre-wrap">{fixResponseRaw}</pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
