// src/pages/Compare.tsx
"use client";

import { useMemo, useState } from "react";

import { useReviews, type CategoryKey } from "@/lib/useReviews";
import { useAuth } from "@/features/auth/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { MODEL_OPTIONS, type ModelOption } from "@/constants/modelOptions";
import {
  Gauge,
  AlertTriangle,
  Wrench,
  Palette,
  ShieldCheck,
  Bot,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* =======================
   Metric & 카테고리 설정
========================= */

type MetricKey = "total" | CategoryKey;

const METRIC_CONFIG: Record<
  MetricKey,
  {
    key: MetricKey;
    label: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
> = {
  total: {
    key: "total",
    label: "총점",
    description: "전체 코드 품질 점수 기준으로 모델을 비교합니다.",
    icon: Gauge,
  },
  bug: {
    key: "bug",
    label: "Bug",
    description: "버그 탐지 및 안전성 관련 점수 기준 비교입니다.",
    icon: AlertTriangle,
  },
  maintainability: {
    key: "maintainability",
    label: "Maintainability",
    description: "코드 유지보수 용이성 기준 비교입니다.",
    icon: Wrench,
  },
  style: {
    key: "style",
    label: "Style",
    description: "코드 스타일/일관성 기준 비교입니다.",
    icon: Palette,
  },
  security: {
    key: "security",
    label: "Security",
    description: "보안 관련 지적 능력 기준 비교입니다.",
    icon: ShieldCheck,
  },
};

/* =======================
   프로바이더 스타일
========================= */

const PROVIDER_COLORS: Record<string, string> = {
  openai:
    "bg-violet-500/10 text-violet-600 border-violet-400/40 dark:text-violet-300",
  google:
    "bg-emerald-500/10 text-emerald-600 border-emerald-400/40 dark:text-emerald-300",
  anthropic: "bg-sky-500/10 text-sky-600 border-sky-400/40 dark:text-sky-300",
  "x-ai":
    "bg-orange-500/10 text-orange-600 border-orange-400/40 dark:text-orange-300",
  qwen: "bg-rose-500/10 text-rose-600 border-rose-400/40 dark:text-rose-300",
  mistralai:
    "bg-amber-500/10 text-amber-600 border-amber-400/40 dark:text-amber-300",
  deepseek:
    "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-400/40 dark:text-fuchsia-300",
};

const MODEL_MAP = new Map<string, ModelOption>(
  MODEL_OPTIONS.map((m) => [m.id, m])
);

function getModelMeta(id: string): ModelOption & { providerClass: string } {
  const base =
    MODEL_MAP.get(id) ??
    ({
      id,
      label: id,
      provider: id.split("/")[0] ?? "unknown",
    } as ModelOption);

  const providerClass =
    PROVIDER_COLORS[base.provider] ??
    "bg-slate-500/10 text-slate-600 border-slate-400/40 dark:text-slate-200";

  return { ...base, providerClass };
}

/* =======================
   유틸
========================= */

function mean(nums: number[]) {
  if (!nums.length) return NaN;
  const s = nums.reduce((a, b) => a + b, 0);
  return Math.round((s / nums.length) * 10) / 10;
}

/* =======================
   공통: 모델 정보 뱃지
========================= */

type ModelMeta = ReturnType<typeof getModelMeta>;

function ModelInfoRow({
  meta,
  count,
  compact = false,
  showCountInline = true,
}: {
  meta: ModelMeta;
  count?: number;
  compact?: boolean;
  showCountInline?: boolean;
}) {
  const displayName =
    meta.label || meta.id.replace(`${meta.provider}/`, "") || meta.id;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {/* Provider 칩 */}
      <Badge
        variant="outline"
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide",
          meta.providerClass
        )}
      >
        {meta.provider}
      </Badge>

      {/* 모델 이름 */}
      <span
        className={cn(
          "truncate text-xs font-semibold text-slate-900 dark:text-slate-50",
          compact
            ? "max-w-[140px] sm:max-w-[200px]"
            : "max-w-[180px] sm:max-w-[260px]"
        )}
      >
        {displayName}
      </span>

      {/* 표본 수 (테이블에서만 사용) */}
      {showCountInline && typeof count === "number" && (
        <span className="flex-shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
          표본 {count}개
        </span>
      )}
    </div>
  );
}

/* =======================
   Compare Page
========================= */

const TOP_COUNT_OPTIONS = [3, 5, 10];

export default function Compare() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { myReviews, error, isInitialLoading, reload: load } = useReviews();

  // 🔹 기본은 총점 비교
  const [activeMetric, setActiveMetric] = useState<MetricKey>("total");

  // 🔹 TOP 개수 선택 (기본 5개)
  const [topCount, setTopCount] = useState<number>(5);

  /* ------------ 모델별 집계 ------------ */

  type ModelStats = {
    modelId: string;
    meta: ReturnType<typeof getModelMeta>;
    count: number;
    avgTotal: number;
    avgByCategory: Record<CategoryKey, number>;
  };

  const modelStats: ModelStats[] = useMemo(() => {
    if (!myReviews.length) return [];

    const byModel = new Map<string, typeof myReviews>();

    for (const r of myReviews) {
      const key = r.model || "unknown";
      if (!byModel.has(key)) byModel.set(key, []);
      byModel.get(key)!.push(r);
    }

    const stats: ModelStats[] = [];

    for (const [modelId, rows] of byModel.entries()) {
      const totalScores = rows.map((r) => r.quality_score ?? 0);
      const bugScores = rows.map((r) => r.scores_by_category?.bug ?? 0);
      const maintScores = rows.map(
        (r) => r.scores_by_category?.maintainability ?? 0
      );
      const styleScores = rows.map((r) => r.scores_by_category?.style ?? 0);
      const secScores = rows.map((r) => r.scores_by_category?.security ?? 0);

      stats.push({
        modelId,
        meta: getModelMeta(modelId),
        count: rows.length,
        avgTotal: mean(totalScores),
        avgByCategory: {
          bug: mean(bugScores),
          maintainability: mean(maintScores),
          style: mean(styleScores),
          security: mean(secScores),
        },
      });
    }

    return stats;
  }, [myReviews]);

  /* ------------ 현재 선택된 Metric 기준 정렬 + Top N ------------ */

  const selectedMetricConfig = METRIC_CONFIG[activeMetric];
  const SelectedMetricIcon = selectedMetricConfig.icon;

  const sortedStats = useMemo(() => {
    if (!modelStats.length) return [];
    return [...modelStats].sort((a, b) => {
      const aVal =
        activeMetric === "total"
          ? a.avgTotal
          : a.avgByCategory[activeMetric as CategoryKey];
      const bVal =
        activeMetric === "total"
          ? b.avgTotal
          : b.avgByCategory[activeMetric as CategoryKey];

      const av = isNaN(aVal) ? -Infinity : aVal;
      const bv = isNaN(bVal) ? -Infinity : bVal;
      return bv - av;
    });
  }, [modelStats, activeMetric]);

  // 🔹 상위 topCount개 모델
  const topStats = useMemo(() => {
    return sortedStats.slice(0, topCount);
  }, [sortedStats, topCount]);

  const topSlots = useMemo<(ModelStats | null)[]>(() => {
    const filled = [...topStats];
    while (filled.length < topCount) {
      filled.push(null);
    }
    return filled.slice(0, topCount);
  }, [topStats, topCount]);

  /* ------------ 로그인 안 된 경우 ------------ */

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md border-dashed">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
              <Bot className="h-5 w-5 text-violet-500" />
            </div>
            <CardTitle className="text-lg">
              모델 비교를 보려면 로그인이 필요해요
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              GitHub로 로그인하면 내가 요청한 리뷰들을 기반으로
              <br />
              모델별 성능을 비교해볼 수 있어요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 에러 표시 */}
      {error && (
        <Card className="border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40">
          <CardContent className="flex items-center justify-between gap-4 p-4 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <p className="text-red-700 dark:text-red-200">
                모델 비교 데이터를 불러오는 중 오류가 발생했습니다.
                <br />
                <span className="text-xs opacity-80">({error})</span>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => load()}
              className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/30 cursor-pointer"
            >
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 상단 설명 카드 + Metric 토글 + Top 개수 선택 */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
            {/* 🔹 TOP 개수 Select */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-0 sm:mr-8">
              <span>표시할 랭킹 개수</span>
              <Select
                value={String(topCount)}
                onValueChange={(value) => setTopCount(Number(value))}
              >
                <SelectTrigger className="h-8 w-[90px] rounded-full border-slate-300 bg-background/80 text-xs dark:border-slate-700 dark:bg-slate-900/70 cursor-pointer">
                  <SelectValue placeholder={`TOP ${topCount}`} />
                </SelectTrigger>
                <SelectContent side="bottom" align="end">
                  {TOP_COUNT_OPTIONS.map((n) => (
                    <SelectItem
                      key={n}
                      value={String(n)}
                      className="cursor-pointer"
                    >
                      TOP {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 🔹 Metric 토글 버튼 */}
            <div className="flex flex-wrap justify-end gap-2 w-full sm:w-auto">
              {(
                Object.values(METRIC_CONFIG) as Array<
                  (typeof METRIC_CONFIG)[MetricKey]
                >
              ).map(({ key, label, icon: Icon }) => {
                const active = activeMetric === key;
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => setActiveMetric(key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border text-xs transition-all duration-150 cursor-pointer",
                      active
                        ? "border-violet-500 bg-gradient-to-r from-violet-600 via-violet-500 to-violet-400 text-white shadow-sm shadow-violet-500/40 hover:shadow-md hover:shadow-violet-500/50 hover:brightness-110"
                        : "bg-background/70 text-slate-500 dark:text-slate-300 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-600 dark:hover:border-violet-500/70 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 모델별 랭킹 카드 리스트 (Top N) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-6 text-sm sm:text-base sm:flex-row sm:items-center ">
            <span className="flex items-center gap-1">TOP {topCount} 랭킹</span>

            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <SelectedMetricIcon className="h-3.5 w-3.5 text-violet-400" />
                <span className="hidden sm:inline">
                  {selectedMetricConfig.label} ·{" "}
                  {selectedMetricConfig.description}
                </span>
                <span className="sm:hidden">
                  {selectedMetricConfig.label} 기준
                </span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInitialLoading ? (
            <div
              className="
                grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                auto-rows-[minmax(140px,1fr)]
              "
            >
              {Array.from({ length: topCount }).map((_, i) => (
                <Skeleton key={i} className="h-full rounded-xl" />
              ))}
            </div>
          ) : !myReviews.length ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              아직 내가 요청한 리뷰 데이터가 없습니다.
              <br />
              Playground나 다른 페이지에서 먼저 코드를 리뷰해보세요.
            </div>
          ) : !topStats.length ? (
            <div className="text-sm text-slate-500">
              모델별로 집계할 데이터가 없습니다.
            </div>
          ) : (
            <div
              className="
                grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                auto-rows-[minmax(150px,1fr)]
              "
            >
              {topSlots.map((row, index) => {
                const rank = index + 1;
                const isTop1 = index === 0;
                const isTop3 = index < 3;

                // 🔹 빈 슬롯 (데이터 없음)
                if (!row) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="flex h-full flex-col justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500"
                    >
                      {/* 1줄: n위 + 왕관 자리 (비어 있음) */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {rank}위
                        </span>
                      </div>

                      {/* 2줄: 모델 자리 (데이터 없음) */}
                      <div className="mt-1 flex items-center gap-2 min-h-[1.5rem]">
                        <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[11px] dark:border-slate-700">
                          데이터 없음
                        </span>
                      </div>

                      {/* 3줄: 점수 + 표본 */}
                      <div className="mt-3 flex items-end justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold tracking-tight tabular-nums text-slate-400">
                            -
                          </span>
                          <span className="text-[11px] text-slate-400">
                            / 100
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          표본 0개
                        </span>
                      </div>
                    </div>
                  );
                }

                const value =
                  activeMetric === "total"
                    ? row.avgTotal
                    : row.avgByCategory[activeMetric as CategoryKey];

                const hasData = !isNaN(value);

                return (
                  <div
                    key={row.modelId}
                    className={cn(
                      "relative flex h-full flex-col justify-between rounded-xl border p-3 sm:p-4 text-xs transition-all duration-200 overflow-hidden",
                      isTop1 &&
                        "border-violet-400/80 bg-gradient-to-br from-violet-500/25 via-slate-900 to-violet-900/60 shadow-lg shadow-violet-500/50",
                      !isTop1 &&
                        isTop3 &&
                        "border-violet-500/60 bg-slate-900/80 shadow-md shadow-violet-500/30",
                      !isTop3 &&
                        "border-slate-700/60 bg-slate-900/70 hover:border-violet-400/80 hover:bg-slate-900"
                    )}
                  >
                    {/* 👑 1등 왕관 - n위 오른쪽 */}
                    {isTop1 && (
                      <>
                        <div className="pointer-events-none absolute -top-16 -right-10 h-32 w-32 rounded-full bg-violet-500/25 blur-3xl" />
                      </>
                    )}

                    {/* 1줄: n위 + 왕관 아이콘 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "text-[11px] font-semibold",
                            isTop1
                              ? "text-violet-100"
                              : isTop3
                              ? "text-violet-200"
                              : "text-slate-300"
                          )}
                        >
                          {rank}위
                        </span>
                      </div>
                      {isTop1 && (
                        <span className="text-lg drop-shadow">👑</span>
                      )}
                    </div>

                    {/* 2줄: 모델 */}
                    <div className="mt-1 min-h-[1.5rem]">
                      <ModelInfoRow
                        meta={row.meta}
                        compact
                        showCountInline={false}
                      />
                    </div>

                    {/* 3줄: 점수 + 표본 개수 */}
                    <div className="mt-3 flex items-end justify-between">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "font-bold tracking-tight tabular-nums",
                            isTop1
                              ? "text-2xl text-violet-50"
                              : isTop3
                              ? "text-xl text-violet-100"
                              : "text-xl text-slate-100"
                          )}
                        >
                          {hasData ? value.toFixed(1) : "-"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          / 100
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300">
                        표본 {row.count}개
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 테이블: 상위 N개 모델 x 카테고리 */}
      {!isInitialLoading && !!topStats.length && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              TOP {topCount}개 모델 카테고리별 평균 점수
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[minmax(52px,0.5fr)_2.4fr_repeat(5,minmax(80px,1fr))] gap-2 pb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <div className="text-center">순위</div>
                <div>모델</div>
                <div className="text-center">총점</div>
                <div className="text-center">Bug</div>
                <div className="text-center">Maintainability</div>
                <div className="text-center">Style</div>
                <div className="text-center">Security</div>
              </div>

              {topSlots.map((row, index) => {
                const rank = index + 1;

                if (!row) {
                  // 🔹 테이블 빈 슬롯
                  return (
                    <div
                      key={`empty-row-${index}`}
                      className="grid grid-cols-[minmax(52px,0.5fr)_2.4fr_repeat(5,minmax(80px,1fr))] gap-2 border-t border-slate-200 py-2 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500"
                    >
                      <div className="flex items-center justify-center text-[11px]">
                        {rank}위
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[11px] dark:border-slate-700">
                          데이터 없음
                        </span>
                      </div>
                      <div className="text-center">-</div>
                      <div className="text-center">-</div>
                      <div className="text-center">-</div>
                      <div className="text-center">-</div>
                      <div className="text-center">-</div>
                    </div>
                  );
                }

                return (
                  <div
                    key={row.modelId}
                    className="grid grid-cols-[minmax(52px,0.5fr)_2.4fr_repeat(5,minmax(80px,1fr))] gap-2 border-t border-slate-200 py-2 text-xs dark:border-slate-800"
                  >
                    {/* 순위 */}
                    <div className="flex items-center justify-center text-[11px] font-semibold text-slate-600 dark:text-slate-200">
                      {rank}위
                    </div>

                    {/* 모델 정보 + 여기서는 표본 수 같이 표시 */}
                    <ModelInfoRow
                      meta={row.meta}
                      count={row.count}
                      showCountInline
                    />

                    <div className="text-center">
                      {!isNaN(row.avgTotal) ? row.avgTotal.toFixed(1) : "-"}
                    </div>
                    <div className="text-center">
                      {!isNaN(row.avgByCategory.bug)
                        ? row.avgByCategory.bug.toFixed(1)
                        : "-"}
                    </div>
                    <div className="text-center">
                      {!isNaN(row.avgByCategory.maintainability)
                        ? row.avgByCategory.maintainability.toFixed(1)
                        : "-"}
                    </div>
                    <div className="text-center">
                      {!isNaN(row.avgByCategory.style)
                        ? row.avgByCategory.style.toFixed(1)
                        : "-"}
                    </div>
                    <div className="text-center">
                      {!isNaN(row.avgByCategory.security)
                        ? row.avgByCategory.security.toFixed(1)
                        : "-"}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
