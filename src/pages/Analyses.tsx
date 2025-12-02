// src/pages/Analyses.tsx
"use client";

import * as React from "react";
import { fetchReviews } from "@/lib/reviewsApi";
import { useAuth } from "@/features/auth/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import {
  Palette,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Bot,
  ArrowDownWideNarrow,
  ListChecks,
  Gauge,
  Trophy,
  Clock,
} from "lucide-react";

/* ===========================================================
   🔹 타입 정의
=========================================================== */

type CategoryKey = "bug" | "maintainability" | "style" | "security";

type ScoresByCategory = Record<CategoryKey, number>;

type CommentsByCategory = Partial<Record<CategoryKey, string>> &
  Record<string, string>;

type ReviewItem = {
  review_id: number;
  github_id: string | null;
  model: string;
  trigger: string | null;
  language: string | null;
  quality_score: number;
  summary: string;
  scores_by_category: ScoresByCategory;
  comments: CommentsByCategory;
  audit: string;
};

type ReviewListResponse = {
  meta: unknown;
  body: ReviewItem[];
};

/* ===========================================================
   🔹 카테고리 설정
=========================================================== */

const CATEGORY_KEYS: CategoryKey[] = [
  "bug",
  "maintainability",
  "style",
  "security",
];

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  bug: "Bug",
  maintainability: "Maintainability",
  style: "Style",
  security: "Security",
};

const CATEGORY_ICONS: Record<CategoryKey, React.ComponentType<any>> = {
  bug: AlertTriangle,
  maintainability: Wrench,
  style: Palette,
  security: ShieldCheck,
};

/* ===========================================================
   🔹 Util
=========================================================== */

function qualityTone(score: number) {
  if (score >= 85)
    return {
      label: "Excellent",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    };
  if (score >= 70)
    return {
      label: "Good",
      className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
    };
  if (score >= 55)
    return {
      label: "Needs Work",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    };
  return {
    label: "Poor",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  };
}

function formatAudit(audit: string) {
  const d = new Date(audit);
  if (Number.isNaN(d.getTime())) return audit;

  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} · ${time}`;
}

/* ===========================================================
   🔹 메인 컴포넌트
=========================================================== */

export default function Analyses() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [allReviews, setAllReviews] = React.useState<ReviewItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // 헤더에서 쓸 정렬/모델 필터
  const [sortBy, setSortBy] = React.useState<"latest" | "score">("latest");
  const [modelFilter, setModelFilter] = React.useState<string>("__all__");

  /* ------------------------ 데이터 로드 ------------------------ */

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = (await fetchReviews()) as ReviewListResponse;
      setAllReviews(Array.isArray(res.body) ? res.body : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  /* ------------------------ 내 리뷰만 (A 전략) ------------------------ */

  const myGithubId = user?.github_id ?? null;

  const myReviews = React.useMemo(() => {
    if (!myGithubId) return [];
    return allReviews.filter((r) => r.github_id === myGithubId);
  }, [allReviews, myGithubId]);

  /* ------------------------ 파생 데이터 ------------------------ */

  const allModels = React.useMemo(() => {
    const set = new Set<string>();
    myReviews.forEach((r) => r.model && set.add(r.model));
    return Array.from(set);
  }, [myReviews]);

  const filtered = React.useMemo(() => {
    let arr = [...myReviews];

    // 모델별 필터
    if (modelFilter !== "__all__") {
      arr = arr.filter((r) => r.model === modelFilter);
    }

    // 정렬
    if (sortBy === "latest") {
      arr.sort(
        (a, b) => new Date(b.audit).getTime() - new Date(a.audit).getTime()
      );
    } else {
      arr.sort((a, b) => b.quality_score - a.quality_score);
    }

    return arr;
  }, [myReviews, modelFilter, sortBy]);

  const stats = React.useMemo(() => {
    if (!myReviews.length) return null;

    const total = myReviews.length;
    const avg = Math.round(
      myReviews.reduce((acc, r) => acc + r.quality_score, 0) / total
    );
    const best = [...myReviews].sort(
      (a, b) => b.quality_score - a.quality_score
    )[0];
    const worst = [...myReviews].sort(
      (a, b) => a.quality_score - b.quality_score
    )[0];

    return { total, avg, best, worst };
  }, [myReviews]);

  const isInitialLoading = authLoading || loading;

  /* ===========================================================
     🔹 로그인 안 된 경우
  ============================================================ */

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md border-dashed">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
              <Bot className="h-5 w-5 text-violet-500" />
            </div>
            <CardTitle className="text-lg">로그인이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              GitHub로 로그인하면 내가 받은 코드 리뷰 내역을 한 번에 모아서 볼
              수 있어요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ===========================================================
     🔹 페이지 UI
  ============================================================ */

  return (
    <div className=" pb-20">
      {/* 1. 상단 헤더 + 컨트롤 바 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className=" text-xl font-semibold">리뷰 요약</h2>
        </div>

        <Card className="w-full max-w-md border-none bg-transparent md:w-auto">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
              {/* 정렬 */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDownWideNarrow className="h-4 w-4 text-violet-500" />
                <span className="hidden sm:inline">정렬</span>
              </div>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as "latest" | "score")
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="score">점수순</SelectItem>
                </SelectContent>
              </Select>

              {/* 모델 선택 (AI 아이콘 + Select) */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bot className="h-4 w-4 text-violet-500" />
                <span className="hidden sm:inline">모델</span>
              </div>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">전체 모델</SelectItem>
                  {allModels.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. 상단 요약 카드 */}
      {stats && (
        <Card className="bg-gradient-to-r from-violet-500/5 via-background to-background border-violet-500/20">
          <CardContent className="grid gap-4 p-5 md:grid-cols-4">
            {/* 총 리뷰 수 */}
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
                  <ListChecks className="h-4 w-4 text-violet-500" />
                </div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  총 리뷰 수
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold leading-tight">
                  {stats.total}
                </div>
                <div className="text-xs text-muted-foreground">
                  누적 리뷰 개수
                </div>
              </div>
            </div>

            {/* 평균 Quality */}
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
                  <Gauge className="h-4 w-4 text-violet-500" />
                </div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  평균 Quality
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-semibold">
                    {stats.avg}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px]",
                    qualityTone(stats.avg).className
                  )}
                >
                  {qualityTone(stats.avg).label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                최근 리뷰 전반의 평균적인 코드 품질 점수입니다.
              </p>
            </div>

            {/* 최고 점수 */}
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
                  <Trophy className="h-4 w-4 text-violet-500" />
                </div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  최고 점수
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-semibold">
                    {stats.best.quality_score}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {stats.best.summary}
                </p>
              </div>
            </div>

            {/* 최저 점수 */}
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
                  <AlertTriangle className="h-4 w-4 text-violet-500" />
                </div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  최저 점수
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-semibold">
                    {stats.worst.quality_score}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {stats.worst.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. 리스트 영역 */}
      <div>
        <div className="mt-8 mb-3 flex items-center justify-between">
          <h2 className=" text-xl font-semibold">리뷰 목록</h2>
        </div>

        {error && (
          <Card className="mb-4 border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40">
            <CardContent className="flex items-center justify-between gap-4 p-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-red-700 dark:text-red-200">
                  리뷰를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해
                  주세요.
                  <br />
                  <span className="text-xs opacity-80">({error})</span>
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/30"
                onClick={() => load()}
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {isInitialLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx}>
                <CardContent className="space-y-3 p-4">
                  <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-20 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isInitialLoading && filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                <Bot className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  아직 내가 받은 리뷰가 없습니다.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  GitHub에서 코드를 푸시하거나 PR을 생성하면, 여기에서 AI 리뷰
                  결과를 확인할 수 있어요.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 🔹 카드 2열 그리드 (작을 땐 1열) */}
        {!isInitialLoading && filtered.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {filtered.map((item) => {
              const tone = qualityTone(item.quality_score);

              return (
                <Card
                  key={item.review_id}
                  className={cn(
                    "group border border-slate-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md",
                    "dark:border-slate-800 dark:bg-slate-900/40"
                  )}
                >
                  <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800">
                    <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                      {/* Quality 숫자 강조 */}
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-2xl font-semibold">
                          {item.quality_score}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /100
                        </span>
                        <span
                          className={cn(
                            "ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            tone.className
                          )}
                        >
                          {tone.label}
                        </span>
                      </div>

                      {/* 메타 정보: 모델 / 언어 */}
                      <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                        {item.model && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[14px] font-medium text-violet-600 dark:text-white">
                            <Bot className="h-5 w-5" />
                            {item.model}
                          </span>
                        )}
                      </div>
                    </CardTitle>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3 text-violet-500" />
                      <span>{formatAudit(item.audit)}</span>
                    </div>
                  </CardHeader>

                  {/* 🔹 카드 내용은 일정 높이 넘어가면 스크롤 */}
                  <CardContent className="mt-1 max-h-80 space-y-4 overflow-y-auto pr-1 text-sm">
                    {/* 요약 */}
                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        리뷰 요약
                      </div>
                      <p className="line-clamp-4 leading-relaxed text-slate-800 dark:text-slate-100">
                        {item.summary}
                      </p>
                    </div>

                    {/* Category breakdown */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                          유형별 점수 및 코멘트
                        </span>
                      </div>

                      <div className="grid gap-2">
                        {CATEGORY_KEYS.map((key) => {
                          const Icon = CATEGORY_ICONS[key];
                          const score = item.scores_by_category[key];
                          const comment = item.comments[key];

                          const hasData =
                            typeof score === "number" || !!comment;
                          if (!hasData) return null;

                          return (
                            <div
                              key={key}
                              className="rounded-lg bg-white p-2 shadow-sm dark:bg-slate-950/40"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10">
                                    <Icon className="h-3.5 w-3.5 text-violet-500" />
                                  </div>
                                  <span className="text-xs font-medium">
                                    {CATEGORY_LABELS[key]}
                                  </span>
                                </div>

                                {/* 점수 숫자로 명확하게 */}
                                {typeof score === "number" && (
                                  <Badge
                                    variant="outline"
                                    className="font-mono text-[10px]"
                                  >
                                    {score}/100
                                  </Badge>
                                )}
                              </div>

                              {comment && (
                                <p className="mt-1 whitespace-pre-wrap text-[11px] text-muted-foreground">
                                  {comment}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
