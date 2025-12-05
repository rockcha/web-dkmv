"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import type React from "react";

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
    description:
      "각 모델의 전체 코드 품질 총점 평균으로 비교하거나, 다른 지표와 함께 평균을 냅니다.",
    icon: Gauge,
  },
  bug: {
    key: "bug",
    label: "Bug",
    shortLabel: "Bug",
    description:
      "버그 탐지 및 안전성 관련 점수 평균으로 비교하거나, 다른 지표와 함께 평균을 냅니다.",
    icon: AlertTriangle,
  },
  maintainability: {
    key: "maintainability",
    label: "Maintainability",
    shortLabel: "Maint.",
    description:
      "유지보수 용이성 점수 평균으로 비교하거나, 다른 지표와 함께 평균을 냅니다.",
    icon: Wrench,
  },
  style: {
    key: "style",
    label: "Style",
    shortLabel: "Style",
    description:
      "코드 스타일/일관성 점수 평균으로 비교하거나, 다른 지표와 함께 평균을 냅니다.",
    icon: Palette,
  },
  security: {
    key: "security",
    label: "Security",
    shortLabel: "Sec.",
    description:
      "보안 관련 지적 능력 점수 평균으로 비교하거나, 다른 지표와 함께 평균을 냅니다.",
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
   공통: 모델 정보 뱃지
========================= */

type ModelMeta = ReturnType<typeof getModelMeta>;

function ModelInfoRow({
  meta,
  compact = false,
}: {
  meta: ModelMeta;
  count?: number;
  compact?: boolean;
  showCountInline?: boolean;
}) {
  const displayName =
    meta.label || meta.id.replace(`${meta.provider}/`, "") || meta.id;

  return (
    <div className="flex flex-col min-w-0 items-center gap-2">
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
  popular: "인기 순",
  score: "점수 순",
  alpha: "이름 순",
};

/* =======================
   Compare Page 타입
========================= */

type ModelStats = {
  modelId: string;
  meta: ModelMeta;
  count: number;
  avgTotal: number;
  avgByCategory: Record<CategoryKey, number>;
};

// 카드 하나의 최소 너비 기준 (Tailwind min-w-[230px] 참고)
const CARD_MIN_WIDTH = 230;

/* =======================
   상세 메트릭 타일
========================= */

function DetailMetricTile({
  title,
  icon: Icon,
  value,
  suffix,
  accentClass,
}: {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
  suffix?: string;
  accentClass?: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-700/70 bg-slate-950/70 px-3 py-3 shadow-sm shadow-slate-900/60">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-400">{title}</span>
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-200",
            accentClass
          )}
        >
          <Icon className="mr-1 h-3 w-3" />
          <span className="tracking-tight">Score</span>
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold tabular-nums text-slate-50">
          {value}
        </span>
        {suffix && <span className="text-[11px] text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

/* =======================
   Compare Page
========================= */

export default function Compare() {
  // 🔹 API 원본 데이터
  const [rawStats, setRawStats] = useState<ModelStatsApiItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 🔹 필터/정렬 상태
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("week"); // 기본: 이번주
  const [sortKey, setSortKey] = useState<SortKey>("popular"); // 기본: 인기 순

  // 🔹 선택 지표 (총점 + 카테고리 전부 동일하게 토글)
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    "total",
  ]);

  // 🔹 가로 리스트 페이지네이션 & 선택된 모델
  const [page, setPage] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // 🔹 부모 width 에 따라 동적으로 pageSize 계산
  const [pageSize, setPageSize] = useState(5);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const isScoreSort = sortKey === "score";

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el || typeof window === "undefined") return;

    const updatePageSize = () => {
      const width = el.clientWidth || el.offsetWidth || 0;
      if (!width) return;
      // 카드 최소 너비 + gap 대략 16px 고려해서 계산
      const perPage = Math.max(1, Math.floor(width / (CARD_MIN_WIDTH + 16)));
      setPageSize(perPage);
    };

    updatePageSize();

    let resizeObserver: ResizeObserver | null = null;

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(updatePageSize);
      resizeObserver.observe(el);
    } else {
      window.addEventListener("resize", updatePageSize);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updatePageSize);
      }
    };
  }, []);

  const handleToggleMetric = (key: MetricKey) => {
    // 🔒 점수 순이 아닐 때는 지표 뱃지 조작 불가
    if (!isScoreSort) return;

    setSelectedMetrics((prev) => {
      const exists = prev.includes(key);
      if (exists) {
        // 최소 1개는 유지
        if (prev.length === 1) return prev;
        return prev.filter((m) => m !== key);
      }
      return [...prev, key];
    });
  };

  const primaryMetricKey: MetricKey = selectedMetrics[0] ?? "total";
  const PrimaryMetricIcon = METRIC_CONFIG[primaryMetricKey].icon;
  const hasMultiMetrics = selectedMetrics.length > 1;

  const metricBadgeLabel = hasMultiMetrics
    ? "선택 지표 평균"
    : `${METRIC_CONFIG[primaryMetricKey].label} 기준`;

  const loadStats = useCallback(async () => {
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
  }, [timeRange]);

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

  /* ------------ 유틸: 선택 지표 평균 점수 ------------ */

  const getAverageMetric = (row: ModelStats): number => {
    const metrics = selectedMetrics.length
      ? selectedMetrics
      : (["total"] as MetricKey[]);

    let sum = 0;
    let used = 0;

    for (const key of metrics) {
      const v =
        key === "total" ? row.avgTotal : row.avgByCategory[key as CategoryKey];
      if (!isNaN(v)) {
        sum += v;
        used += 1;
      }
    }

    if (used === 0) return -Infinity;
    // 🔢 선택한 지표 개수로 나누어 평균 (예: 총점+Bug+Style 선택 시 3개로 나눔)
    return sum / used;
  };

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
      // 점수 순: 선택 지표 평균 기준 내림차순
      list.sort((a, b) => getAverageMetric(b) - getAverageMetric(a));
    }

    return list;
  }, [modelStats, sortKey, selectedMetrics]);

  const hasData = !!sortedStats.length && !statsLoading;
  const topModel = hasData ? sortedStats[0] : null;

  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(sortedStats.length / safePageSize));

  // 필터/정렬/지표 바뀌면 페이지 초기화
  useEffect(() => {
    setPage(0);
  }, [timeRange, sortKey, selectedMetrics.join(","), rawStats]);

  // 페이지 범위 보정
  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(sortedStats.length / safePageSize) - 1
    );
    if (page > maxPage) {
      setPage(0);
    }
  }, [sortedStats, page, safePageSize]);

  const startIndex = page * safePageSize;
  const pagedStats = sortedStats.slice(startIndex, startIndex + safePageSize);

  // 선택된 모델 기본값 & 유효성 유지
  useEffect(() => {
    if (!sortedStats.length) {
      setSelectedModelId(null);
      return;
    }
    const exists = selectedModelId
      ? sortedStats.some((m) => m.modelId === selectedModelId)
      : false;
    if (!selectedModelId || !exists) {
      setSelectedModelId(sortedStats[0].modelId);
    }
  }, [sortedStats, selectedModelId]);

  // 상세 보기용 모델
  const detailModel = useMemo(() => {
    if (!hasData) return null;
    if (!selectedModelId) return topModel;
    return sortedStats.find((m) => m.modelId === selectedModelId) ?? topModel;
  }, [hasData, selectedModelId, sortedStats, topModel]);

  return (
    <div className="max-w-full overflow-x-hidden">
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

      {/* 상단 필터/정렬/지표 선택 */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 w-full">
            {/* 기간 & 정렬 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4 font-bold text-muted-foreground">
                {/* 기간 선택 */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <Select
                    value={timeRange}
                    onValueChange={(value: TimeRangeKey) => setTimeRange(value)}
                  >
                    <SelectTrigger className="h-8 w-[120px] rounded-full border-slate-300 bg-background/80 text-sm dark:border-slate-700 dark:bg-slate-900/70 cursor-pointer">
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
                    <SelectTrigger className="h-8 w-[160px] rounded-full border-slate-300 bg-background/80 text-sm dark:border-slate-700 dark:bg-slate-900/70 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start">
                      <SelectItem value="popular" className="cursor-pointer">
                        인기 순
                      </SelectItem>
                      <SelectItem value="score" className="cursor-pointer">
                        점수 순
                      </SelectItem>
                      <SelectItem value="alpha" className="cursor-pointer">
                        이름 순
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 지표 멀티 선택 (총점 + 유형 동일 취급) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "total",
                    "bug",
                    "maintainability",
                    "style",
                    "security",
                  ] as MetricKey[]
                ).map((key) => {
                  const cfg = METRIC_CONFIG[key];
                  const active = selectedMetrics.includes(key);
                  const Icon = cfg.icon;
                  return (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      disabled={!isScoreSort}
                      onClick={() => handleToggleMetric(key)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border text-xs transition-all duration-150 px-3 py-1",
                        active
                          ? "border-violet-500 bg-violet-600/90 text-white shadow-sm shadow-violet-500/40 hover:bg-violet-500"
                          : "bg-background/70 text-slate-500 dark:text-slate-300 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-600 dark:hover:border-violet-500/70 dark:hover:bg-violet-500/10 dark:hover:text-violet-200",
                        !isScoreSort &&
                          "opacity-50 cursor-not-allowed hover:border-slate-700 hover:bg-background/70 hover:text-slate-400 dark:hover:bg-slate-900"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{cfg.label}</span>
                    </Button>
                  );
                })}
              </div>
              {/* 안내 문구: 점수 순에서만 지표 선택 가능 */}
              <p className="text-[11px] text-slate-500">
                <span
                  className={cn(
                    "font-medium",
                    isScoreSort ? "text-violet-300" : "text-slate-400"
                  )}
                >
                  점수 순
                </span>{" "}
                정렬에서만 여러 지표(총점, Bug, 스타일 등)를 선택해서 평균
                점수로 비교할 수 있어요.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 모델별 랭킹 카드 리스트 (가로 슬라이드 + 페이지네이션) */}
      <Card className="overflow-hidden dark:border-white/50">
        <CardHeader className="space-y-3">
          {/* 제목 */}
          <CardTitle className="flex flex-col gap-1 text-sm sm:text-base sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              모델 랭킹
              <span className="text-xs text-slate-400">
                {TIME_RANGE_LABELS[timeRange]}
              </span>
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-4">
          {statsLoading ? (
            <div className="w-full max-w-full">
              <div className="flex gap-3 overflow-x-auto pb-2">
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
            <div className="w-full max-w-full" ref={listContainerRef}>
              {/* 이 섹션 안에서만 가로 스크롤 (뷰포트 전체 X) */}
              <div
                className="
                  flex gap-3 overflow-x-auto pb-3 pt-1
                  scrollbar-thin scrollbar-thumb-slate-600/60 scrollbar-track-transparent
                "
              >
                {pagedStats.map((row) => {
                  const globalRank =
                    sortedStats.findIndex((m) => m.modelId === row.modelId) + 1;

                  // 메인 표시 값 계산
                  let primaryValueText = "";
                  let primarySuffix = "";

                  if (sortKey === "popular") {
                    // 인기 순 => 리뷰 수만
                    primaryValueText = row.count.toLocaleString();
                    primarySuffix = "개";
                  } else {
                    const avg = getAverageMetric(row);
                    primaryValueText = !isNaN(avg) ? avg.toFixed(1) : "-";
                    primarySuffix = "/ 100";
                  }

                  const rankBadge =
                    globalRank === 1
                      ? "🥇"
                      : globalRank === 2
                      ? "🥈"
                      : globalRank === 3
                      ? "🥉"
                      : null;

                  const isSelected = selectedModelId === row.modelId;

                  return (
                    <button
                      key={row.modelId}
                      type="button"
                      onClick={() => setSelectedModelId(row.modelId)}
                      className={cn(
                        "dark:border-white/30 relative flex h-full min-h-[150px] min-w-[230px] max-w-[260px] flex-col justify-between rounded-2xl border border-slate-700/70 bg-slate-950/70 p-3 sm:p-4 text-xs transition-all duration-200 overflow-hidden text-left cursor-pointer",
                        "shadow-sm shadow-slate-950/60 hover:-translate-y-0.5 hover:border-violet-400/80 hover:shadow-lg hover:shadow-violet-500/40",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-0",
                        isSelected &&
                          "ring-2 ring-violet-400/90 ring-offset-0 border-violet-400 bg-slate-950"
                      )}
                    >
                      {/* 1줄: 순위 + 아이콘 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-slate-100">
                            {globalRank}위
                          </span>
                          {isSelected && (
                            <span className="ml-1 rounded-full bg-violet-500/25 px-1.5 py-0.5 text-[10px] text-violet-100">
                              선택됨
                            </span>
                          )}
                        </div>
                        {rankBadge && (
                          <span className="text-lg drop-shadow-sm">
                            {rankBadge}
                          </span>
                        )}
                      </div>

                      {/* 2줄: 모델 정보 */}
                      <div className="mt-1 min-h-[1.5rem]">
                        <ModelInfoRow
                          meta={row.meta}
                          compact
                          // 점수 순 / 이름 순일 때 표본 안 보이게
                          showCountInline={sortKey === "popular"}
                          count={row.count}
                        />
                      </div>

                      {/* 3줄: 메인 지표 */}
                      <div className="mt-3 flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className="font-bold tracking-tight tabular-nums text-xl text-violet-500">
                              {sortKey === "popular" ? (
                                <>리뷰 {primaryValueText}</>
                              ) : (
                                primaryValueText
                              )}
                            </span>
                            {primarySuffix && (
                              <span className="text-[11px] text-slate-400">
                                {primarySuffix}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ✅ 유형 고를 때마다 카드 안에 미니 뱃지 추가되는 부분은 삭제함 */}
                    </button>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              {pageCount > 1 && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-950/80 px-1.5 py-1 shadow-sm shadow-slate-950/60 backdrop-blur">
                    {Array.from({ length: pageCount }, (_, i) => {
                      const isActive = i === page;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPage(i)}
                          className={cn(
                            "relative cursor-pointer rounded-full px-3 py-0.5 text-[11px] transition-[background,transform,box-shadow,color,border] duration-150",
                            isActive
                              ? "border border-violet-400/80 bg-violet-600 text-white shadow-sm shadow-violet-500/70"
                              : "border border-transparent text-slate-300 hover:border-violet-400/80 hover:bg-violet-500/10 hover:text-violet-100 hover:-translate-y-0.5"
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 보기 섹션: 선택된 모델 상세 (기본: 1위) */}
      {hasData && detailModel && (
        <Card className="mt-4 dark:border-white/50">
          <CardHeader className="space-y-2">
            <CardTitle className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2">
                상세 보기
                <span className="text-xs text-slate-400">
                  선택한 모델 카드 상세 정보
                </span>
              </span>
              <span className="text-[11px] text-slate-500">
                {TIME_RANGE_LABELS[timeRange]} · {SORT_LABELS[sortKey]}
              </span>
            </CardTitle>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[11px] font-semibold text-violet-100">
                  {(() => {
                    const rank =
                      sortedStats.findIndex(
                        (m) => m.modelId === detailModel.modelId
                      ) + 1;
                    return `${rank}위`;
                  })()}
                </span>
                <ModelInfoRow
                  meta={detailModel.meta}
                  count={detailModel.count}
                  showCountInline
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <PrimaryMetricIcon className="h-3.5 w-3.5 text-violet-400" />
                <span>{metricBadgeLabel}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-200">
            {/* 선택 기준 요약 라인 */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/70 px-2.5 py-1">
                <PrimaryMetricIcon className="h-3.5 w-3.5 text-violet-300" />
                <span className="font-medium text-slate-200">
                  {metricBadgeLabel}
                </span>
                <span className="mx-1 h-3 w-px bg-slate-700/70" />
                <span className="text-slate-400">
                  {TIME_RANGE_LABELS[timeRange]} · {SORT_LABELS[sortKey]}
                </span>
              </div>

              <span className="text-[10px] text-slate-500">
                상단 카드에서 모델을 선택하면 이 영역이 함께 변경됩니다.
              </span>
            </div>

            {/* 메트릭 타일 그리드 */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* 총점 */}
              <DetailMetricTile
                title="총점"
                icon={Gauge}
                value={
                  !isNaN(detailModel.avgTotal)
                    ? detailModel.avgTotal.toFixed(1)
                    : "-"
                }
                suffix="/ 100"
                accentClass="bg-violet-600/20 text-violet-100"
              />

              {/* Bug */}
              <DetailMetricTile
                title="Bug"
                icon={AlertTriangle}
                value={
                  !isNaN(detailModel.avgByCategory.bug)
                    ? detailModel.avgByCategory.bug.toFixed(1)
                    : "-"
                }
                accentClass="bg-amber-500/15 text-amber-100"
              />

              {/* Maintainability */}
              <DetailMetricTile
                title="Maintainability"
                icon={Wrench}
                value={
                  !isNaN(detailModel.avgByCategory.maintainability)
                    ? detailModel.avgByCategory.maintainability.toFixed(1)
                    : "-"
                }
                accentClass="bg-sky-500/15 text-sky-100"
              />

              {/* Style */}
              <DetailMetricTile
                title="Style"
                icon={Palette}
                value={
                  !isNaN(detailModel.avgByCategory.style)
                    ? detailModel.avgByCategory.style.toFixed(1)
                    : "-"
                }
                accentClass=" dark:border-white/30 bg-pink-500/15 text-pink-100"
              />

              {/* Security */}
              <DetailMetricTile
                title="Security"
                icon={ShieldCheck}
                value={
                  !isNaN(detailModel.avgByCategory.security)
                    ? detailModel.avgByCategory.security.toFixed(1)
                    : "-"
                }
                accentClass="bg-emerald-500/15 text-emerald-100"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
