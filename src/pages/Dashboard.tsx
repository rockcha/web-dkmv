// src/pages/Dashboard.tsx
"use client";

import { useMemo, useState } from "react";

import { useReviews } from "@/lib/useReviews";
import type { CategoryKey } from "@/lib/useReviews";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Bot,
  AlertTriangle,
  Wrench,
  Palette,
  ShieldCheck,
  Gauge,
  ListChecks,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =======================
   그래프 색상 & 메트릭 설정
========================= */

const LINE_COLORS = {
  total: "#8b5cf6", // 보라 - 총점
  bug: "#f97316", // 주황 - Bug
  maintainability: "#22c55e", // 초록 - Maintainability
  style: "#0ea5e9", // 파랑 - Style
  security: "#f43f5e", // 빨강 - Security
} as const;

type MetricKey = "total" | CategoryKey;

const METRIC_CONFIG: Record<
  MetricKey,
  {
    key: MetricKey;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
  }
> = {
  total: {
    key: "total",
    label: "총점",
    icon: Gauge,
    color: LINE_COLORS.total,
  },
  bug: {
    key: "bug",
    label: "Bug",
    icon: AlertTriangle,
    color: LINE_COLORS.bug,
  },
  maintainability: {
    key: "maintainability",
    label: "Maintainability",
    icon: Wrench,
    color: LINE_COLORS.maintainability,
  },
  style: {
    key: "style",
    label: "Style",
    icon: Palette,
    color: LINE_COLORS.style,
  },
  security: {
    key: "security",
    label: "Security",
    icon: ShieldCheck,
    color: LINE_COLORS.security,
  },
} as const;

/* =======================
   Util
========================= */

function formatAudit(audit: string) {
  const d = new Date(audit);
  if (Number.isNaN(d.getTime())) return audit;

  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =======================
   Custom Tooltip Component
========================= */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-lg">
      <div className="mb-1 text-[11px] text-slate-300">날짜: {item.date}</div>
      <div className="space-y-0.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-[11px]">
              {p.name}:{" "}
              <span className="font-mono font-semibold">{p.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =======================
   Dashboard Page
========================= */
export default function Dashboard() {
  const {
    myReviews,
    error,
    isInitialLoading,
    isAuthenticated,
    authLoading,
    reload: load,
  } = useReviews();

  // 🔹 그래프에서 어떤 메트릭을 볼지 선택 (총점 / 유형별)
  const [activeMetric, setActiveMetric] = useState<MetricKey>("total");

  /* ------------ 상단 카드용 통계 ------------ */

  /** 전체 평균 점수 (quality_score) */
  const avgScore = useMemo(() => {
    if (!myReviews.length) return null;
    const scores = myReviews.map((r) => r.quality_score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg);
  }, [myReviews]);

  /** 총 리뷰 수 */
  const totalReviews = myReviews.length;

  /** 향상률: 가장 예전 리뷰 vs 가장 최근 리뷰 */
  const improveRate = useMemo(() => {
    if (myReviews.length < 2) return "-";

    const sorted = [...myReviews].sort(
      (a, b) => new Date(a.audit).getTime() - new Date(b.audit).getTime()
    );

    const first = sorted[0]?.quality_score ?? 0; // 가장 옛날
    const last = sorted[sorted.length - 1]?.quality_score ?? 0; // 가장 최근

    if (first === 0) return "-";

    const diff = last - first;
    const rate = ((diff / first) * 100).toFixed(1);
    return `${diff >= 0 ? "+" : ""}${rate}%`;
  }, [myReviews]);

  /* ------------ 점수 추이 그래프 데이터 (총점 + 유형별 점수) ------------ */

  const trendData = useMemo(() => {
    if (!myReviews.length) return [];

    const sorted = [...myReviews].sort(
      (a, b) => new Date(a.audit).getTime() - new Date(b.audit).getTime()
    );

    return sorted.map((item, index) => ({
      index: index + 1, // X축: 리뷰 순서
      date: formatAudit(item.audit),
      total: item.quality_score,
      bug: item.scores_by_category.bug,
      maintainability: item.scores_by_category.maintainability,
      style: item.scores_by_category.style,
      security: item.scores_by_category.security,
    }));
  }, [myReviews]);

  /* ------------ 로그인 안 된 경우 ------------ */

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
              GitHub로 로그인하면 내 코드 리뷰 통계를 대시보드에서 확인할 수
              있어요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMetricConfig = METRIC_CONFIG[activeMetric];

  return (
    <div className="space-y-6">
      {/* 에러 표시 */}
      {error && (
        <Card className="border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40">
          <CardContent className="flex items-center justify-between gap-4 p-4 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <p className="text-red-700 dark:text-red-200">
                대시보드 데이터를 불러오는 중 오류가 발생했습니다.
                <br />
                <span className="text-xs opacity-80">({error})</span>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => load()}
              className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/30"
            >
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 상단 카드 영역 */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        {/* 평균 점수 */}
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-violet-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
              <Gauge className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-semibold text-violet-600 dark:text-violet-400">
                  {avgScore !== null ? avgScore : "-"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  최근 내 코드 리뷰의 평균 품질 점수
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* 총 리뷰 수 */}
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-500/5 via-transparent to-slate-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 리뷰 수</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500/10">
              <ListChecks className="h-4 w-4 text-slate-600 dark:text-slate-200" />
            </div>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
                  {totalReviews}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  GitHub 계정으로 요청한 전체 코드 리뷰 수
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* 향상률 */}
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-emerald-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">향상률</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    improveRate === "-"
                      ? "text-slate-400"
                      : improveRate.startsWith("+")
                      ? "text-emerald-500"
                      : "text-rose-500"
                  )}
                >
                  {improveRate}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  첫 리뷰와 가장 최근 리뷰 사이의 총점 변화율
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 점수 추이 그래프 (토글로 하나씩 보기) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>점수 추이 (총점 & 유형별)</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              선택한 지표 기준으로 리뷰 순서에 따른 점수 변화를 보여줘요.
            </p>
          </div>

          {/* 🔹 메트릭 토글 버튼 그룹 */}
          <div className="flex flex-wrap justify-end gap-2">
            {(
              Object.values(METRIC_CONFIG) as Array<
                (typeof METRIC_CONFIG)[MetricKey]
              >
            ).map(({ key, label, icon: Icon, color }) => {
              const isActive = activeMetric === key;
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveMetric(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border text-xs cursor-pointer",
                    !isActive &&
                      "bg-background/60 text-slate-500 dark:text-slate-300",
                    isActive && "shadow-sm"
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${color}40`,
                          borderColor: `${color}60`,
                          color: "white",
                        }
                      : undefined
                  }
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </Button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="h-72 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent">
          {isInitialLoading ? (
            <div className="flex h-full items-center justify-center">
              <Skeleton className="h-40 w-full" />
            </div>
          ) : trendData.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-slate-400">
              아직 리뷰 데이터가 없습니다.
            </div>
          ) : (
            <div className="h-full min-w-[900px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart
                  data={trendData}
                  margin={{ top: 20, right: 24, left: 8, bottom: 0 }}
                >
                  <XAxis
                    dataKey="index"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(v) => `#${v}`}
                  />
                  <YAxis
                    domain={[0, "dataMax + 5"]}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* 🔹 선택한 메트릭만 하나 보여줌 */}
                  <Line
                    type="monotone"
                    dataKey={activeMetricConfig.key}
                    name={activeMetricConfig.label}
                    stroke={activeMetricConfig.color}
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
