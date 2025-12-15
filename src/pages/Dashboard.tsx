// src/pages/Dashboard.tsx
"use client";

import React, { useMemo, useState } from "react";

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
  total: "#8b5cf6",
  bug: "#f97316",
  maintainability: "#22c55e",
  style: "#0ea5e9",
  security: "#f43f5e",
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
  total: { key: "total", label: "총점", icon: Gauge, color: LINE_COLORS.total },
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
   Skeleton (Dark 개선: Purple 톤)
========================= */

const SKELETON_BASE =
  "bg-slate-200/70 dark:bg-purple-300/15 ring-1 ring-slate-200/50 dark:ring-purple-300/15";

function DashSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn(SKELETON_BASE, className)} />;
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
   Brand Header (미니 링 + 글로우)
========================= */

// ✅ 카드 헤더 공통 스타일 (배경 제거)
const brandHeader =
  "relative px-5 pt-5 pb-4 border-b border-slate-200/70 dark:border-white/10";

// ✅ 아이콘 링 + 은은 글로우
const iconWrap =
  "relative grid place-items-center h-11 w-11 rounded-2xl " +
  "ring-1 ring-purple-500/25 dark:ring-purple-300/25 " +
  "bg-purple-500/5 dark:bg-purple-300/10 " +
  "shadow-[0_0_0_6px_rgba(139,92,246,0.08)] dark:shadow-[0_0_0_6px_rgba(196,181,253,0.10)]";

const iconGlyph = "h-6 w-6 text-purple-700 dark:text-purple-200";

function MetricHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle?: string;
}) {
  return (
    <CardHeader className={brandHeader}>
      <div className="flex items-center gap-3">
        <div className={iconWrap}>
          <Icon className={iconGlyph} />
        </div>

        <div className="min-w-0">
          <CardTitle className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </CardTitle>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-600 dark:text-white/70 line-clamp-1">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </CardHeader>
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

  const [activeMetric, setActiveMetric] = useState<MetricKey>("total");

  const avgScore = useMemo(() => {
    if (!myReviews.length) return null;
    const scores = myReviews.map((r) => r.quality_score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg);
  }, [myReviews]);

  const totalReviews = myReviews.length;

  const improveRate = useMemo(() => {
    if (myReviews.length < 2) return "-";

    const sorted = [...myReviews].sort(
      (a, b) => new Date(a.audit).getTime() - new Date(b.audit).getTime()
    );

    const first = sorted[0]?.quality_score ?? 0;
    const last = sorted[sorted.length - 1]?.quality_score ?? 0;

    if (first === 0) return "-";

    const diff = last - first;
    const rate = ((diff / first) * 100).toFixed(1);
    return `${diff >= 0 ? "+" : ""}${rate}%`;
  }, [myReviews]);

  const trendData = useMemo(() => {
    if (!myReviews.length) return [];

    const sorted = [...myReviews].sort(
      (a, b) => new Date(a.audit).getTime() - new Date(b.audit).getTime()
    );

    return sorted.map((item, index) => ({
      index: index + 1,
      date: formatAudit(item.audit),
      total: item.quality_score,
      bug: item.scores_by_category.bug,
      maintainability: item.scores_by_category.maintainability,
      style: item.scores_by_category.style,
      security: item.scores_by_category.security,
    }));
  }, [myReviews]);

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md border-dashed">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <div className={cn(iconWrap, "h-10 w-10 rounded-full")}>
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-200" />
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
    <div className="space-y-6 mt-6">
      {error && (
        <Card className="border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40 ">
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

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        {/* 평균 점수 */}
        <Card className="relative overflow-hidden dark:border-white/50 pt-0">
          <MetricHeader
            icon={Gauge}
            title="평균 점수"
            subtitle="최근 내 코드 리뷰 평균"
          />
          <CardContent>
            {isInitialLoading ? (
              <DashSkeleton className="h-9 w-24 rounded-lg" />
            ) : (
              <>
                <div className="text-3xl font-semibold text-purple-600 dark:text-purple-300">
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
        <Card className="relative overflow-hidden dark:border-white/50 pt-0">
          <MetricHeader
            icon={ListChecks}
            title="총 리뷰 수"
            subtitle="요청한 전체 코드 리뷰"
          />
          <CardContent>
            {isInitialLoading ? (
              <DashSkeleton className="h-9 w-24 rounded-lg" />
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
        <Card className="relative overflow-hidden dark:border-white/50 pt-0">
          <MetricHeader
            icon={TrendingUp}
            title="향상률"
            subtitle="첫 리뷰 대비 최근 변화"
          />
          <CardContent>
            {isInitialLoading ? (
              // 기존 h-8 w-24가 텍스트(작은 한 줄) 느낌이 안 맞아서 살짝 낮춤
              <DashSkeleton className="h-7 w-28 rounded-lg" />
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

      {/* 점수 추이 그래프 */}
      <Card className="dark:border-white/50 overflow-hidden pt-0">
        <div className={brandHeader}>
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={iconWrap}>
                <Bot className={iconGlyph} />
              </div>

              <div className="min-w-0">
                <div className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                  유형별 점수 변화
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-white/70">
                  선택한 지표 기준으로 리뷰 순서에 따른 점수 변화를 보여줘요.
                </p>
              </div>
            </div>

            {/* ✅ 토글 버튼 섹션: 다크에서도 비활성 가독성 보장 */}
            <div className="rounded-xl bg-white/95 px-2 py-2 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-950/40 dark:ring-white/10">
              <div className="flex flex-wrap justify-end gap-2">
                {(
                  Object.values(METRIC_CONFIG) as Array<
                    (typeof METRIC_CONFIG)[MetricKey]
                  >
                ).map(({ key, label, icon: Icon, color }) => {
                  const isActive = activeMetric === key;
                  const activeBg = color;

                  // ✅ 비활성: 라이트/다크 각각 가독성 확보
                  const inactiveBgLight = `${color}22`;
                  const inactiveTextLight = "#0f172a"; // slate-900
                  const inactiveBorderLight = "rgba(15,23,42,0.18)";

                  const inactiveBgDark = `${color}33`;
                  const inactiveTextDark = "#E2E8F0"; // slate-200
                  const inactiveBorderDark = "rgba(226,232,240,0.22)";

                  return (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveMetric(key)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all border shadow-sm",
                        "dark:shadow-none",
                        isActive
                          ? "scale-[1.02]"
                          : "opacity-95 hover:opacity-100 hover:scale-[1.01]",
                        !isActive && "dark:text-slate-100"
                      )}
                      style={
                        isActive
                          ? {
                              backgroundColor: activeBg,
                              borderColor: activeBg,
                              color: "#ffffff",
                            }
                          : {
                              backgroundColor:
                                typeof window !== "undefined" &&
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? inactiveBgDark
                                  : inactiveBgLight,
                              borderColor:
                                typeof window !== "undefined" &&
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? inactiveBorderDark
                                  : inactiveBorderLight,
                              color:
                                typeof window !== "undefined" &&
                                document.documentElement.classList.contains(
                                  "dark"
                                )
                                  ? inactiveTextDark
                                  : inactiveTextLight,
                            }
                      }
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{
                          color: isActive
                            ? "#ffffff"
                            : typeof window !== "undefined" &&
                              document.documentElement.classList.contains(
                                "dark"
                              )
                            ? inactiveTextDark
                            : inactiveTextLight,
                        }}
                      />
                      <span className="tracking-tight">{label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <CardContent className="h-72 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent">
          {isInitialLoading ? (
            <div className="flex h-full items-center justify-center">
              {/* h-40가 살짝 작아 보여서 컨테이너( h-72 )에 맞게 키움 */}
              <DashSkeleton className="h-52 w-full rounded-xl" />
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
