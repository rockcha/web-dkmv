// src/pages/Compare.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
  Filter,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  fetchModelStats,
  type ModelStatsApiItem,
  datePreset,
} from "@/api/reviewStats";

/* =======================
   Metric & 카테고리 설정
========================= */

type CategoryKey = "bug" | "maintainability" | "style" | "security";

type MetricKey = "total" | CategoryKey;

const METRIC_CONFIG: Record<
  MetricKey,
  {
    key: MetricKey;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
> = {
  total: {
    key: "total",
    label: "총점",
    shortLabel: "총점",
    description: "전체 코드 품질 점수 기준으로 모델을 비교합니다.",
    icon: Gauge,
  },
  bug: {
    key: "bug",
    label: "Bug 점수",
    shortLabel: "Bug",
    description: "버그 탐지 및 안전성 관련 점수 기준 비교입니다.",
    icon: AlertTriangle,
  },
  maintainability: {
    key: "maintainability",
    label: "Maintainability",
    shortLabel: "Maint.",
    description: "코드 유지보수 용이성 기준 비교입니다.",
    icon: Wrench,
  },
  style: {
    key: "style",
    label: "Style",
    shortLabel: "Style",
    description: "코드 스타일/일관성 기준 비교입니다.",
    icon: Palette,
  },
  security: {
    key: "security",
    label: "Security",
    shortLabel: "Sec.",
    description: "보안 관련 지적 능력 기준 비교입니다.",
    icon: ShieldCheck,
  },
};

/* =======================
   프로바이더 스타일
========================= */

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-violet-500/10 text-violet-200 border-violet-400/40",
  google: "bg-emerald-500/10 text-emerald-200 border-emerald-400/40",
  anthropic: "bg-sky-500/10 text-sky-200 border-sky-400/40",
  "x-ai": "bg-orange-500/10 text-orange-200 border-orange-400/40",
  qwen: "bg-rose-500/10 text-rose-200 border-rose-400/40",
  mistralai: "bg-amber-500/10 text-amber-200 border-amber-400/40",
  deepseek: "bg-fuchsia-500/10 text-fuchsia-200 border-fuchsia-400/40",
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
    "bg-slate-500/10 text-slate-100 border-slate-500/60";

  return { ...base, providerClass };
}

/* =======================
   유틸
========================= */

function mean(nums: Array<number | null | undefined>): number {
  const filtered = nums
    .map((n) => (typeof n === "number" ? n : null))
    .filter((n): n is number => n !== null);

  if (!filtered.length) return NaN;

  const s = filtered.reduce((a, b) => a + b, 0);
  return Math.round((s / filtered.length) * 10) / 10;
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
          "truncate text-xs font-semibold text-slate-100",
          compact
            ? "max-w-[140px] sm:max-w-[200px]"
            : "max-w-[180px] sm:max-w-[260px]"
        )}
      >
        {displayName}
      </span>

      {/* 표본 수 */}
      {showCountInline && typeof count === "number" && (
        <span className="flex-shrink-0 text-[11px] text-slate-400">
          표본 {count}개
        </span>
      )}
    </div>
  );
}

/* =======================
   Time & Sort 옵션
========================= */

type TimeRangeKey = "week" | "month" | "year";
type SortKey = "popular" | "score" | "alpha";

const TIME_RANGE_LABELS: Record<TimeRangeKey, string> = {
  week: "이번주",
  month: "이번달",
  year: "이번년도",
};

const SORT_LABELS: Record<SortKey, string> = {
  popular: "인기 순 (리뷰 수)",
  score: "점수 순",
  alpha: "가나다 순",
};

/* =======================
   Compare Page
========================= */

type ModelStats = {
  modelId: string;
  meta: ModelMeta;
  count: number;
  avgTotal: number;
  avgByCategory: Record<CategoryKey, number>;
};

export default function Compare() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // 🔹 API 원본 데이터
  const [rawStats, setRawStats] = useState<ModelStatsApiItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 🔹 필터/정렬 상태
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("week"); // 기본: 이번주
  const [sortKey, setSortKey] = useState<SortKey>("popular"); // 기본: 인기 순
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    "total",
  ]); // 기본: 총점만

  const primaryMetric: MetricKey = selectedMetrics[0] ?? "total";

  const primaryMetricConfig = METRIC_CONFIG[primaryMetric];
  const PrimaryMetricIcon = primaryMetricConfig.icon;

  const handleToggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) => {
      const exists = prev.includes(key);
      if (exists) {
        // 최소 1개는 항상 유지
        if (prev.length === 1) return prev;
        return prev.filter((m) => m !== key);
      }
      return [...prev, key];
    });
  };

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatsLoading(true);
    setStatsError(null);

    try {
      const range =
        timeRange === "week"
          ? datePreset.thisWeek()
          : timeRange === "month"
          ? datePreset.thisMonth()
          : datePreset.thisYear();

      const data = await fetchModelStats({
        from: range.from,
        to: range.to,
      });

      setRawStats(data);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      setStatsError(msg);
    } finally {
      setStatsLoading(false);
    }
  }, [isAuthenticated, timeRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /* ------------ API 결과 → 화면용 모델 ------------ */

  const modelStats: ModelStats[] = useMemo(() => {
    if (!rawStats.length) return [];

    return rawStats.map((row) => {
      const modelId = row.model ?? "unknown";
      return {
        modelId,
        meta: getModelMeta(modelId),
        count: row.review_count ?? 0,
        avgTotal: row.avg_total ?? NaN,
        avgByCategory: {
          bug: row.avg_bug ?? NaN,
          maintainability: row.avg_maintainability ?? NaN,
          style: row.avg_style ?? NaN,
          security: row.avg_security ?? NaN,
        },
      };
    });
  }, [rawStats]);

  /* ------------ 정렬 적용 ------------ */

  const sortedStats = useMemo(() => {
    if (!modelStats.length) return [];

    const list = [...modelStats];

    if (sortKey === "popular") {
      list.sort((a, b) => b.count - a.count);
    } else if (sortKey === "alpha") {
      list.sort((a, b) =>
        (a.meta.label ?? a.modelId).localeCompare(
          b.meta.label ?? b.modelId,
          "ko"
        )
      );
    } else {
      // 점수 순: primaryMetric 기준 내림차순
      list.sort((a, b) => {
        const getVal = (row: ModelStats): number => {
          const base =
            primaryMetric === "total"
              ? row.avgTotal
              : row.avgByCategory[primaryMetric];
          return isNaN(base) ? -Infinity : base;
        };
        return getVal(b) - getVal(a);
      });
    }

    return list;
  }, [modelStats, sortKey, primaryMetric]);

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
              GitHub로 로그인하면 모델별 리뷰 집계 데이터를
              <br />
              기간/정렬 조건에 맞게 비교해볼 수 있어요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasData = !!sortedStats.length && !statsLoading;

  return (
    <div className="space-y-6">
      {/* 에러 표시 */}
      {statsError && (
        <Card className="border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40">
          <CardContent className="flex items-center justify-between gap-4 p-4 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <p className="text-red-700 dark:text-red-200">
                모델 비교 데이터를 불러오는 중 오류가 발생했습니다.
                <br />
                <span className="text-xs opacity-80">({statsError})</span>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadStats}
              className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/30 cursor-pointer"
            >
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 상단 필터/정렬/메트릭 선택 */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 w-full">
            {/* 기간 & 정렬 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <Filter className="h-3 w-3" />
                  Filters
                </span>

                {/* 기간 선택 */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <Select
                    value={timeRange}
                    onValueChange={(value: TimeRangeKey) => setTimeRange(value)}
                  >
                    <SelectTrigger className="h-8 w-[120px] rounded-full border-slate-300 bg-background/80 text-xs dark:border-slate-700 dark:bg-slate-900/70 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start">
                      <SelectItem value="week" className="cursor-pointer">
                        이번주
                      </SelectItem>
                      <SelectItem value="month" className="cursor-pointer">
                        이번달
                      </SelectItem>
                      <SelectItem value="year" className="cursor-pointer">
                        이번년도
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 정렬 선택 */}
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                  <Select
                    value={sortKey}
                    onValueChange={(value: SortKey) => setSortKey(value)}
                  >
                    <SelectTrigger className="h-8 w-[160px] rounded-full border-slate-300 bg-background/80 text-xs dark:border-slate-700 dark:bg-slate-900/70 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start">
                      <SelectItem value="popular" className="cursor-pointer">
                        인기 순 (리뷰 수)
                      </SelectItem>
                      <SelectItem value="score" className="cursor-pointer">
                        점수 순
                      </SelectItem>
                      <SelectItem value="alpha" className="cursor-pointer">
                        가나다 순
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasData && (
                <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                  총{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {sortedStats.length}
                  </span>{" "}
                  개 모델
                </div>
              )}
            </div>

            {/* 메트릭 멀티 선택 */}
            <div className="flex flex-wrap gap-2">
              {(
                Object.values(METRIC_CONFIG) as Array<
                  (typeof METRIC_CONFIG)[MetricKey]
                >
              ).map(({ key, label, icon: Icon }) => {
                const active = selectedMetrics.includes(key);
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => handleToggleMetric(key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border text-xs transition-all duration-150 cursor-pointer",
                      active
                        ? "border-violet-500 bg-gradient-to-r from-violet-600 via-violet-500 to-violet-400 text-white shadow-sm shadow-violet-500/40 hover:shadow-md hover:shadow-violet-500/50 hover:brightness-110"
                        : "bg-background/70 text-slate-500 dark:text-slate-300 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-600 dark:hover:border-violet-500/70 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                    {primaryMetric === key && (
                      <span className="ml-0.5 rounded-full bg-white/20 px-1.5 text-[9px] uppercase tracking-wide">
                        기준
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 모델별 랭킹 카드 리스트 (가로 슬라이드) */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex flex-col gap-2 text-sm sm:text-base sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-1">
              모델 랭킹
              <span className="text-xs text-slate-400">
                ({TIME_RANGE_LABELS[timeRange]} · {SORT_LABELS[sortKey]})
              </span>
            </span>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <PrimaryMetricIcon className="h-3.5 w-3.5 text-violet-400" />
              <span>
                {primaryMetricConfig.label} 기준 정렬 ·{" "}
                {primaryMetricConfig.description}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {statsLoading ? (
            <div className="-mx-4 md:mx-0">
              <div className="flex gap-3 overflow-x-auto px-4 pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-[150px] min-w-[220px] rounded-xl"
                  />
                ))}
              </div>
            </div>
          ) : !hasData ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              선택한 기간에 해당하는 모델 집계 데이터가 없습니다.
              <br />
              다른 기간이나 정렬 조건으로 다시 시도해보세요.
            </div>
          ) : (
            <div className="-mx-4 md:mx-0">
              <div
                className="
                  flex gap-3 overflow-x-auto px-4 pb-3 pt-1
                  scrollbar-thin scrollbar-thumb-slate-600/60 scrollbar-track-transparent
                "
              >
                {sortedStats.map((row, index) => {
                  const rank = index + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  const getMetricValue = (metric: MetricKey): number => {
                    return metric === "total"
                      ? row.avgTotal
                      : row.avgByCategory[metric];
                  };

                  const primaryValue = getMetricValue(primaryMetric);
                  const primaryHasData = !isNaN(primaryValue);

                  const rankBadge =
                    rank === 1
                      ? "👑"
                      : rank === 2
                      ? "🥈"
                      : rank === 3
                      ? "🥉"
                      : null;

                  return (
                    <div
                      key={row.modelId}
                      className={cn(
                        "relative flex h-full min-h-[150px] min-w-[230px] max-w-[260px] flex-col justify-between rounded-2xl border p-3 sm:p-4 text-xs transition-all duration-200 overflow-hidden",
                        isTop1 &&
                          "border-violet-400/80 bg-gradient-to-br from-violet-500/25 via-slate-900 to-violet-900/60 shadow-lg shadow-violet-500/50",
                        !isTop1 &&
                          isTop2 &&
                          "border-slate-500/80 bg-slate-900/90 shadow-md shadow-slate-600/40",
                        !isTop1 &&
                          !isTop2 &&
                          isTop3 &&
                          "border-amber-500/80 bg-slate-900/80 shadow-md shadow-amber-500/40",
                        !isTop1 &&
                          !isTop2 &&
                          !isTop3 &&
                          "border-slate-700/60 bg-slate-900/70 hover:border-violet-400/80 hover:bg-slate-900"
                      )}
                    >
                      {isTop1 && (
                        <div className="pointer-events-none absolute -top-16 -right-10 h-32 w-32 rounded-full bg-violet-500/25 blur-3xl" />
                      )}

                      {/* 1줄: 순위 + 아이콘 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "text-[11px] font-semibold",
                              isTop1
                                ? "text-violet-100"
                                : isTop2
                                ? "text-slate-100"
                                : isTop3
                                ? "text-amber-100"
                                : "text-slate-300"
                            )}
                          >
                            {rank}위
                          </span>
                        </div>
                        {rankBadge && (
                          <span className="text-lg drop-shadow">
                            {rankBadge}
                          </span>
                        )}
                      </div>

                      {/* 2줄: 모델 정보 */}
                      <div className="mt-1 min-h-[1.5rem]">
                        <ModelInfoRow
                          meta={row.meta}
                          compact
                          showCountInline={false}
                        />
                      </div>

                      {/* 3줄: 주요 점수 + 표본 수 */}
                      <div className="mt-3 flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-1">
                            <span
                              className={cn(
                                "font-bold tracking-tight tabular-nums",
                                isTop1
                                  ? "text-2xl text-violet-50"
                                  : isTop2
                                  ? "text-xl text-slate-50"
                                  : isTop3
                                  ? "text-xl text-amber-100"
                                  : "text-xl text-slate-100"
                              )}
                            >
                              {primaryHasData ? primaryValue.toFixed(1) : "-"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              / 100
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {primaryMetricConfig.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-300">
                          표본 {row.count}개
                        </span>
                      </div>

                      {/* 4줄: 선택된 다른 메트릭들 미니 뱃지 */}
                      {selectedMetrics.length > 1 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {selectedMetrics.map((metric) => {
                            if (metric === primaryMetric) return null;
                            const cfg = METRIC_CONFIG[metric];
                            const val = getMetricValue(metric);
                            const has = !isNaN(val);
                            const MetricIcon = cfg.icon;
                            return (
                              <div
                                key={metric}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-600/80 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-200"
                              >
                                <MetricIcon className="h-3 w-3 text-slate-300" />
                                <span className="font-medium">
                                  {cfg.shortLabel}
                                </span>
                                <span className="tabular-nums">
                                  {has ? val.toFixed(1) : "-"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 테이블: 현재 정렬 순서대로 전체 출력 */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              모델별 카테고리 평균 점수
              <span className="ml-1 text-xs font-normal text-slate-400">
                ({TIME_RANGE_LABELS[timeRange]} · {SORT_LABELS[sortKey]})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[minmax(52px,0.5fr)_2.4fr_repeat(5,minmax(80px,1fr))] gap-2 pb-2 text-xs font-semibold text-slate-200">
                <div className="text-center">순위</div>
                <div>모델</div>
                <div className="text-center">총점</div>
                <div className="text-center">Bug</div>
                <div className="text-center">Maintainability</div>
                <div className="text-center">Style</div>
                <div className="text-center">Security</div>
              </div>

              {sortedStats.map((row, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={row.modelId}
                    className="grid grid-cols-[minmax(52px,0.5fr)_2.4fr_repeat(5,minmax(80px,1fr))] gap-2 border-t border-slate-800 py-2 text-xs"
                  >
                    {/* 순위 */}
                    <div className="flex items-center justify-center text-[11px] font-semibold text-slate-200">
                      {rank}위
                    </div>

                    {/* 모델 정보 + 표본 수 */}
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
