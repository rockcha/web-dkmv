// src/pages/Playground.tsx
"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Gauge, FileText, BarChart3, Info, Loader2 } from "lucide-react"; // ✅ Info, Loader2 추가

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

const MODEL_OPTIONS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "starcoder-15b", label: "StarCoder 15B" },
  { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
];

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
    <div className={cn("flex flex-col items-center gap-1", className)}>
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

export default function Playground() {
  const { user } = useAuth();

  const [selected, setSelected] = useState<string>();
  const [code, setCode] = useState<string>("");
  const [modelId, setModelId] = useState<string>(MODEL_OPTIONS[0].id);

  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastReviewId, setLastReviewId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  // GET /v1/reviews/{review_id} 최종 리뷰 데이터
  const [reviewDetail, setReviewDetail] = useState<ReviewDetailResponse | null>(
    null
  );

  const [responseInfo, setResponseInfo] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  const onPick = (val: string) => {
    setSelected(val);
    setCode(SAMPLES[val] ?? "");
  };

  const canRun = code.trim().length > 0 && !loading && !!user;

  const run = async () => {
    setError(null);
    setResponseInfo("");
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          Accept: "application/json",
        },
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

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setPhase("idle");
  };

  const primaryLabel =
    phase === "requesting"
      ? "리뷰 생성 중..."
      : phase === "fetching"
      ? "리뷰 조회 중..."
      : "리뷰 생성 요청 보내기";

  const phaseText = (() => {
    switch (phase) {
      case "requesting":
        return "1/3 • 리뷰 생성 중...";
      case "requested":
        return "2/3 • 리뷰 생성 완료 (review_id 확보)";
      case "fetching":
        return "3/3 • 리뷰 상세 조회 중...";
      case "fetched":
        return "완료! 리뷰 결과를 확인해 주세요.";
      case "error":
        return "에러가 발생했습니다. 아래 메시지를 확인해 주세요.";
      default:
        return "";
    }
  })();

  // ========================
  // 4영역 뷰어용 데이터
  // ========================
  // const meta: ReviewMeta = reviewDetail?.meta ?? {};
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

  // 오른쪽 컬럼용 카테고리 키 (bug, maintainability, style, security 순서 유지)
  const categoryOrder = ["bug", "maintainability", "style", "security"];
  const availableCategories =
    scoresByCategory || comments
      ? categoryOrder.filter(
          (k) =>
            (scoresByCategory && k in scoresByCategory) ||
            (comments && k in comments)
        )
      : [];

  const isLoadingPhase = phase === "requesting" || phase === "fetching"; // ✅ UX용 플래그

  return (
    <div className="space-y-6">
      {/* ✅ 최상단: 사용법 안내 */}
      <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-950/60 px-3 py-2 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 text-sky-400" />
        <div className="space-y-1">
          <p className="font-medium text-sky-100">사용 방법</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>위에서 샘플 코드를 선택하거나 직접 코드를 붙여넣습니다.</li>
            <li>
              사용할 모델을 선택한 뒤, &quot;리뷰 생성 요청&quot;을 눌러요.
            </li>
            <li>
              아래 카드에서 전체 점수 · 요약 · 카테고리별 코멘트를 확인할 수
              있습니다.
            </li>
          </ul>
        </div>
      </div>

      {/* 상단: Playground 컨트롤 */}
      <Card>
        <CardContent className="space-y-4">
          {/* 샘플 / 모델 선택 */}
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Select onValueChange={onPick} value={selected}>
                <SelectTrigger>
                  <SelectValue placeholder="코드 블록 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ex1">배열 두 배 만들기</SelectItem>
                  <SelectItem value="ex2">평균 계산 함수</SelectItem>
                  <SelectItem value="ex3">팩토리얼 함수</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:max-w-xs">
              <div className="flex items-center gap-4">
                <p className="text-sm">사용한 모델</p>
                <Select value={modelId} onValueChange={setModelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="모델 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Textarea
            className="min-h-[220px] font-mono text-sm"
            placeholder="여기에 코드를 붙여넣거나 샘플을 선택하세요. (language는 항상 python으로 전송)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className="flex flex-col justify-end gap-2">
            <div className="flex flex-wrap items-center gap-2 ">
              <Button disabled={!canRun} onClick={run}>
                {/* ✅ 로딩 시 스피너 + 텍스트 */}
                {loading && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {primaryLabel}
              </Button>
              <Button variant="secondary" disabled={!loading} onClick={stop}>
                중단
              </Button>

              {!user && (
                <span className="text-xs text-red-400">
                  * 로그인 후에만 요청을 보낼 수 있습니다.
                </span>
              )}
            </div>

            {phaseText && (
              <span className="text-xs text-muted-foreground">
                {phaseText}
                {lastReviewId != null && phase !== "idle" && (
                  <> (review_id: {lastReviewId})</>
                )}
              </span>
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
      <Card
        className={cn(
          "overflow-hidden transition-all",
          isLoadingPhase &&
            "border-emerald-500/60 shadow-[0_0_0_1px_rgba(16,185,129,0.45)]"
        )} // ✅ 로딩 중일 때 테두리/그림자 강조
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>리뷰 결과</CardTitle>

          {/* ✅ 상단 우측에 '분석 중' 뱃지 */}
          {isLoadingPhase && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
              <Loader2 className="h-3 w-3 animate-spin" />
              리뷰 분석 중...
            </span>
          )}
        </CardHeader>
        <CardContent>
          {/* ✅ 내용도 로딩 상태에 따라 다르게 */}
          {!reviewDetail || !body ? (
            isLoadingPhase ? (
              // 🔥 로딩 스켈레톤 (아직 리뷰 결과 없고, 요청 중일 때)
              <div className="rounded-md border border-slate-800 bg-slate-950/60 p-4">
                <div className="space-y-3 text-[11px]">
                  <div className="h-3 w-32 rounded bg-slate-800 animate-pulse" />
                  <div className="h-8 rounded bg-slate-800/80 animate-pulse" />
                  <div className="h-8 rounded bg-slate-800/70 animate-pulse" />
                  <div className="h-8 rounded bg-slate-800/60 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className=" text-xs text-muted-foreground">
                아직 리뷰 결과가 없습니다. 상단에서 코드를 전송해 리뷰를 생성해
                주세요.
              </div>
            )
          ) : (
            <div
              className={cn(
                "space-y-6",
                isLoadingPhase && "pointer-events-none opacity-80"
              )} // ✅ 로딩 중일 때 약간 흐리게
            >
              {/* 레이아웃: 왼쪽(총점+요약) / 오른쪽(카테고리 4줄) */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* 왼쪽 컬럼 */}
                <div className="space-y-4">
                  {/* 총 점수 도넛 */}
                  <div className="flex flex-col rounded-xl border bg-slate-950/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-muted-foreground">
                          전체 품질 점수
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center justify-center">
                      <DonutScore
                        value={qualityScore}
                        size={140}
                        color="#22c55e"
                        backgroundColor="#020617"
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-muted-foreground">
                      점수가 높을수록 전반적인 코드 품질이 좋다는 의미입니다.
                    </p>
                  </div>

                  {/* summary */}
                  <div className="flex flex-col rounded-xl border bg-slate-950/40 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-sky-400" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        요약
                      </span>
                    </div>
                    <ScrollArea className="mt-1 max-h-48 rounded-md  p-3 text-xs leading-relaxed">
                      {summaryText || "요약 정보가 없습니다."}
                    </ScrollArea>
                  </div>
                </div>

                {/* 오른쪽 컬럼: 카테고리별 점수(도넛) + 코멘트 한 줄씩 */}
                <div className="space-y-4">
                  <div className="flex flex-col rounded-xl border bg-slate-950/40 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-violet-400" />
                        <span className="text-xs font-semibold text-muted-foreground">
                          카테고리별 점수 & 코멘트
                        </span>
                      </div>
                    </div>

                    {!scoresByCategory && !comments ? (
                      <div className="mt-1 rounded-md  p-3 text-xs text-muted-foreground">
                        카테고리별 점수/코멘트 정보가 없습니다.
                      </div>
                    ) : (
                      // ScrollArea 대신 내용만큼 높이 늘어나는 리스트
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
                              className="flex items-start gap-3 rounded-md  px-3 py-2"
                            >
                              {/* 도넛 (작게) */}
                              <DonutScore
                                value={numeric}
                                size={70}
                                color={color}
                                backgroundColor="#020617"
                                label={undefined}
                                className="mt-1 shrink-0"
                              />

                              {/* 텍스트 영역 */}
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold capitalize">
                                    {key}
                                  </span>
                                </div>
                                <p className="text-[11px] leading-relaxed">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
