// src/pages/Analyses.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { useReviews } from "@/lib/useReviews";
import type { CategoryKey, ReviewItem } from "@/lib/useReviews";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Dialog } from "@/components/ui/dialog";

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
  LayoutGrid,
  X,
} from "lucide-react";

/* ===========================================================
   🔹 타입 / 뷰 모드
=========================================================== */

type ViewMode = "detailed" | "compact";

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
   🔹 공통 Brand Header (Dashboard 링+글로우 스타일로 통일)
=========================================================== */

// ✅ 헤더: 배경 단색/그라데이션 제거, 텍스트/아이콘만 강조
const brandHeader =
  "relative px-5 pt-5 pb-4 border-b border-slate-200/70 dark:border-white/10";

// ✅ 아이콘 링 + 은은 글로우 (Dashboard와 동일 톤)
const iconWrap =
  "relative grid place-items-center h-11 w-11 rounded-2xl " +
  "ring-1 ring-purple-500/25 dark:ring-purple-300/25 " +
  "bg-purple-500/5 dark:bg-purple-300/10 " +
  "shadow-[0_0_0_6px_rgba(139,92,246,0.08)] dark:shadow-[0_0_0_6px_rgba(196,181,253,0.10)]";

const iconGlyph = "h-6 w-6 text-purple-700 dark:text-purple-200";

// ✅ 핵심지표 카드(4개) 스타일 통일용
const statCard =
  "flex flex-col gap-3 rounded-xl border bg-background/60 p-3 " +
  "border-purple-500/15 dark:border-purple-300/15 " +
  "shadow-[0_0_0_1px_rgba(139,92,246,0.14)] dark:shadow-[0_0_0_1px_rgba(196,181,253,0.16)]";

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

/* 작은 구분선 */
function SectionDivider() {
  return (
    <div className="my-3 h-px bg-slate-200 dark:bg-slate-700/80" aria-hidden />
  );
}

/* 카테고리 섹션 공통 뷰 */
function CategorySection({ item }: { item: ReviewItem }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        유형별 점수 및 코멘트
      </div>
      <div className="space-y-2">
        {CATEGORY_KEYS.map((key) => {
          const Icon = CATEGORY_ICONS[key];
          const score = item.scores_by_category[key];
          const comment = item.comments[key];

          const hasData = typeof score === "number" || !!comment;
          if (!hasData) return null;

          return (
            <div
              key={key}
              className="rounded-lg bg-background/80 px-3 py-2 text-[11px] shadow-[0_0_0_1px_rgba(148,163,184,0.35)] dark:shadow-[0_0_0_1px_rgba(148,163,184,0.45)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10">
                    <Icon className="h-3 w-3 text-purple-600 dark:text-purple-300" />
                  </div>
                  <span className="text-[11px] font-medium">
                    {CATEGORY_LABELS[key]}
                  </span>
                </div>

                {typeof score === "number" && (
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] leading-none"
                  >
                    {score}/100
                  </Badge>
                )}
              </div>

              {comment && (
                <p className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
                  {comment}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===========================================================
   🔹 Detail Dialog (클릭 안먹힘/모션 튐 해결 + 보라 테두리)
=========================================================== */

function ReviewDetailDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: ReviewItem | null;
}) {
  if (!item) return null;

  const tone = qualityTone(item.quality_score);
  const hasCode = typeof item.code === "string" && item.code.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* ✅ Overlay: z-50 */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "duration-200"
          )}
        />

        {/* ✅ Content: overlay보다 위(z-[60]) + pointer-events 보장
            ✅ 모션: slide-left 제거(튐 방지), fade+zoom+top 살짝
            ✅ 테두리: 은은 보라
        */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[60] w-[96vw] max-w-5xl -translate-x-1/2 -translate-y-1/2",
            "pointer-events-auto",
            "rounded-2xl bg-background",
            "border border-purple-500/20 dark:border-purple-300/20",
            "shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(139,92,246,0.18)]",
            "focus-visible:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2",
            "duration-200"
          )}
        >
          {/* ✅ Close: z 더 높게 + cursor-pointer 확실히 */}
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 z-[70]",
              "inline-flex h-9 w-9 items-center justify-center rounded-full",
              "bg-white/70 hover:bg-white",
              "dark:bg-white/10 dark:hover:bg-white/15",
              "ring-1 ring-slate-200/70 dark:ring-white/10",
              "transition cursor-pointer pointer-events-auto"
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4 text-slate-700 dark:text-white/80 cursor-pointer" />
          </DialogPrimitive.Close>

          <div className={cn(brandHeader, "px-6 pt-6 pb-5")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={cn(iconWrap, "h-11 w-11")}>
                  <Gauge className="h-6 w-6 text-purple-700 dark:text-purple-200" />
                </div>

                <div className="min-w-0">
                  <DialogPrimitive.Title className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                    리뷰 상세
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-1 text-xs text-slate-600 dark:text-white/70">
                    {formatAudit(item.audit)}
                  </DialogPrimitive.Description>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-semibold text-slate-900 dark:text-white">
                        {item.quality_score}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /100
                      </span>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        tone.className
                      )}
                    >
                      {tone.label}
                    </span>

                    {item.model ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-white">
                        <Bot className="h-3.5 w-3.5" />
                        {item.model}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-[74vh] overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                원본 코드
              </div>
              {hasCode ? (
                <pre className="max-h-[420px] overflow-auto rounded-xl bg-slate-950/90 px-4 py-3 text-[11px] leading-relaxed text-slate-50 dark:bg-black">
                  <code className="whitespace-pre">{item.code}</code>
                </pre>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  원본 코드가 없습니다.
                </p>
              )}
            </div>

            <SectionDivider />

            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                리뷰 요약
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-100">
                {item.summary}
              </p>
            </div>

            <SectionDivider />

            <CategorySection item={item} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

/* ===========================================================
   🔹 Summary Card (detailed 모드에서 기본 노출)
=========================================================== */

function ReviewSummaryCard({
  item,
  onClick,
}: {
  item: ReviewItem;
  onClick: () => void;
}) {
  const tone = qualityTone(item.quality_score);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left cursor-pointer",
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        "dark:border-white/15 dark:bg-slate-900/40",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
      )}
    >
      <div className={cn(brandHeader, "rounded-t-2xl")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn(iconWrap, "h-10 w-10")}>
              <Gauge className="h-5 w-5 text-purple-700 dark:text-purple-200" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-1">
                <span className="font-mono text-2xl font-semibold text-slate-900 dark:text-white">
                  {item.quality_score}
                </span>
                <span className="text-xs text-muted-foreground">/100</span>
                <span
                  className={cn(
                    "ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    tone.className
                  )}
                >
                  {tone.label}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3 text-purple-600 dark:text-purple-300" />
                <span>{formatAudit(item.audit)}</span>
              </div>
            </div>
          </div>

          {item.model ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-white">
              <Bot className="h-3.5 w-3.5" />
              {item.model}
            </span>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="text-xs text-muted-foreground">
          클릭해서 상세 내용을 확인하세요.
        </p>
      </div>
    </button>
  );
}

/* ===========================================================
   🔹 메인 컴포넌트
=========================================================== */

export default function Analyses() {
  const {
    myReviews,
    error,
    isInitialLoading,
    isAuthenticated,
    authLoading,
    reload: load,
  } = useReviews();

  const [sortBy, setSortBy] = React.useState<"latest" | "score">("latest");
  const [modelFilter, setModelFilter] = React.useState<string>("__all__");
  const [viewMode, setViewMode] = React.useState<ViewMode>("detailed");

  // ✅ 상세 다이얼로그 상태
  const [openDetail, setOpenDetail] = React.useState(false);
  const [selected, setSelected] = React.useState<ReviewItem | null>(null);

  /* ------------------------ 파생 데이터 ------------------------ */

  const allModels = React.useMemo(() => {
    const set = new Set<string>();
    myReviews.forEach((r) => r.model && set.add(r.model));
    return Array.from(set);
  }, [myReviews]);

  const filtered = React.useMemo(() => {
    let arr: ReviewItem[] = [...myReviews];

    if (modelFilter !== "__all__") {
      arr = arr.filter((r) => r.model === modelFilter);
    }

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

  /* ===========================================================
     🔹 로그인 안 된 경우
  ============================================================ */

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
    <div className="pb-20 space-y-6">
      {/* ✅ 상단: 타이틀 + 필터/정렬 */}
      <Card className="overflow-hidden pt-0 dark:border-white/50">
        <BrandHeader
          icon={Bot}
          title="리뷰 요약"
          subtitle="내가 받은 AI 리뷰를 한 번에 모아서 보고, 필터/정렬할 수 있어요."
          right={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* 정렬 */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDownWideNarrow className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                <span className="hidden sm:inline">정렬</span>
              </div>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as "latest" | "score")}
              >
                <SelectTrigger className="w-[130px] bg-white/70 dark:bg-white/5 cursor-pointer">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="score">점수순</SelectItem>
                </SelectContent>
              </Select>

              {/* 모델 선택 */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bot className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                <span className="hidden sm:inline">모델</span>
              </div>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="w-[150px] bg-white/70 dark:bg-white/5 cursor-pointer">
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
          }
        />
        <CardContent className="pt-4">{/* 헤더에서 컨트롤 처리 */}</CardContent>
      </Card>

      {/* ✅ 상단 요약 */}
      {stats && (
        <Card className="overflow-hidden pt-0 dark:border-white/50">
          <BrandHeader
            icon={Gauge}
            title="핵심 지표"
            subtitle="전체 리뷰 기준 요약 통계입니다."
          />
          <CardContent className="grid gap-4 md:grid-cols-4 pt-4">
            {/* 총 리뷰 수 */}
            <div className={statCard}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                  <ListChecks className="h-4 w-4 text-purple-600 dark:text-purple-300" />
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
            <div className={statCard}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                  <Gauge className="h-4 w-4 text-purple-600 dark:text-purple-300" />
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
            <div className={statCard}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                  <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-300" />
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
            <div className={statCard}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                  <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-300" />
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

      {/* ✅ 리스트 */}
      <Card className="overflow-hidden pt-0 dark:border-white/50">
        <BrandHeader
          icon={ListChecks}
          title="리뷰 목록"
          subtitle="자세히 보기 / 요약 모아보기를 선택할 수 있어요."
          right={
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                보기 방식
              </span>
              <div className="inline-flex items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm dark:bg-white/5">
                <Button
                  size="sm"
                  variant={viewMode === "detailed" ? "default" : "ghost"}
                  className={cn(
                    "h-8 gap-1 rounded-full px-3 text-xs cursor-pointer",
                    viewMode === "detailed" &&
                      "bg-purple-600 text-white hover:bg-purple-700"
                  )}
                  onClick={() => setViewMode("detailed")}
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  <span>자세히</span>
                </Button>

                <Button
                  size="sm"
                  variant={viewMode === "compact" ? "default" : "ghost"}
                  className={cn(
                    "h-8 gap-1 rounded-full px-3 text-xs cursor-pointer",
                    viewMode === "compact" &&
                      "bg-purple-600 text-white hover:bg-purple-700"
                  )}
                  onClick={() => setViewMode("compact")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>요약</span>
                </Button>
              </div>
            </div>
          }
        />

        <CardContent className="pt-4">
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
                  className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/30 cursor-pointer"
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
                <Card key={idx} className="pt-0 overflow-hidden">
                  <div className={brandHeader}>
                    <div className="flex items-center gap-3">
                      <div className={cn(iconWrap, "h-10 w-10")}>
                        <div className="h-4 w-4 rounded bg-purple-500/20" />
                      </div>
                      <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                    </div>
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-20 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isInitialLoading && filtered.length === 0 && (
            <Card className="border-dashed pt-0 overflow-hidden">
              <BrandHeader
                icon={Bot}
                title="데이터 없음"
                subtitle="아직 내가 받은 리뷰가 없습니다."
              />
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
                <div className={cn(iconWrap, "h-12 w-12 rounded-full")}>
                  <Bot className="h-6 w-6 text-purple-600 dark:text-purple-200" />
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

          {!isInitialLoading && filtered.length > 0 && (
            <>
              <div
                className={cn(
                  "mt-2 grid gap-4",
                  viewMode === "detailed"
                    ? "md:grid-cols-2"
                    : "sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {filtered.map((item) => {
                  const hasCode =
                    typeof item.code === "string" &&
                    item.code.trim().length > 0;

                  if (viewMode === "detailed") {
                    return (
                      <ReviewSummaryCard
                        key={item.review_id}
                        item={item}
                        onClick={() => {
                          setSelected(item);
                          setOpenDetail(true);
                        }}
                      />
                    );
                  }

                  const tone = qualityTone(item.quality_score);

                  return (
                    <Card
                      key={item.review_id}
                      className={cn(
                        "overflow-hidden pt-0 border border-slate-200 bg-white shadow-sm",
                        "dark:border-slate-800 dark:bg-slate-900/40"
                      )}
                    >
                      <div className={brandHeader}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className={cn(iconWrap, "h-10 w-10")}>
                              <Gauge className="h-5 w-5 text-purple-700 dark:text-purple-200" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-baseline gap-1">
                                <span className="font-mono text-xl font-semibold text-slate-900 dark:text-white">
                                  {item.quality_score}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
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

                              <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="h-3 w-3 text-purple-600 dark:text-purple-300" />
                                <span>{formatAudit(item.audit)}</span>
                              </div>
                            </div>
                          </div>

                          {item.model && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-white">
                              <Bot className="h-3.5 w-3.5" />
                              {item.model}
                            </span>
                          )}
                        </div>
                      </div>

                      <CardContent className="mt-1 max-h-72 space-y-3 overflow-y-auto p-3 text-xs">
                        <div>
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            원본 코드
                          </div>
                          {hasCode ? (
                            <pre className="max-h-40 overflow-auto rounded-md bg-slate-950/90 px-2 py-1.5 text-[10px] leading-relaxed text-slate-50 dark:bg-black">
                              <code className="whitespace-pre">
                                {item.code}
                              </code>
                            </pre>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">
                              원본 코드가 없습니다.
                            </p>
                          )}
                        </div>

                        <SectionDivider />

                        <div>
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            리뷰 요약
                          </div>
                          <p className="line-clamp-3 leading-relaxed text-slate-800 dark:text-slate-100">
                            {item.summary}
                          </p>
                        </div>

                        <SectionDivider />

                        <CategorySection item={item} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* ✅ 상세 다이얼로그 (한 번만 렌더) */}
              <ReviewDetailDialog
                open={openDetail}
                onOpenChange={(v) => {
                  setOpenDetail(v);
                  if (!v) setSelected(null);
                }}
                item={selected}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
