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
import { Skeleton } from "@/components/ui/skeleton";

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
  X,
  Sparkles,
} from "lucide-react";

/* ===========================================================
   🔹 타입
=========================================================== */

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
   🔹 Skeleton (Dark 개선: Purple 톤)
=========================================================== */

const SKELETON_BASE =
  "bg-slate-200/70 dark:bg-purple-300/15 ring-1 ring-slate-200/50 dark:ring-purple-300/15";

function PurpleSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn(SKELETON_BASE, className)} />;
}

/* ===========================================================
   🔹 공통 Brand Header
=========================================================== */

const brandHeader =
  "relative px-5 pt-5 pb-4 border-b border-slate-200/70 dark:border-white/10";

const iconWrap =
  "relative grid place-items-center h-11 w-11 rounded-2xl " +
  "ring-1 ring-purple-500/25 dark:ring-purple-300/25 " +
  "bg-purple-500/5 dark:bg-purple-300/10 " +
  "shadow-[0_0_0_6px_rgba(139,92,246,0.08)] dark:shadow-[0_0_0_6px_rgba(196,181,253,0.10)]";

const iconGlyph = "h-6 w-6 text-purple-700 dark:text-purple-200";

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

function SectionDivider() {
  return (
    <div className="my-3 h-px bg-slate-200 dark:bg-slate-700/80" aria-hidden />
  );
}

/* 카테고리 섹션 */
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
              className={cn(
                "rounded-lg bg-background/80 px-3 py-2 text-[11px]",
                "shadow-[0_0_0_1px_rgba(148,163,184,0.35)] dark:shadow-[0_0_0_1px_rgba(148,163,184,0.45)]",
                "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.28)] dark:hover:shadow-[0_0_0_1px_rgba(196,181,253,0.28)]",
                "transition"
              )}
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
   🔹 Detail Dialog (보라 테두리/글로우 강화 + 프레임 예쁘게)
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
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/85 backdrop-blur-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "duration-200"
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[60] w-[96vw] max-w-5xl -translate-x-1/2 -translate-y-1/2",
            "pointer-events-auto",
            "rounded-3xl bg-background",
            "border border-purple-500/35 dark:border-purple-300/30",
            "shadow-[0_28px_90px_rgba(0,0,0,0.65)]",
            "ring-1 ring-purple-500/25 dark:ring-purple-300/20",
            "before:pointer-events-none before:content-[''] before:absolute before:inset-0 before:rounded-3xl",
            "before:shadow-[0_0_0_2px_rgba(139,92,246,0.20),0_0_40px_rgba(139,92,246,0.22)]",
            "dark:before:shadow-[0_0_0_2px_rgba(196,181,253,0.16),0_0_44px_rgba(196,181,253,0.20)]",
            "focus-visible:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2",
            "duration-200"
          )}
        >
          {/* Close */}
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 z-[70]",
              "inline-flex h-10 w-10 items-center justify-center rounded-full",
              "bg-white/80 hover:bg-white",
              "dark:bg-white/10 dark:hover:bg-white/15",
              "ring-1 ring-slate-200/70 dark:ring-white/10",
              "transition cursor-pointer pointer-events-auto",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70"
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4 text-slate-700 dark:text-white/80 cursor-pointer" />
          </DialogPrimitive.Close>

          {/* 헤더 */}
          <div
            className={cn(
              "relative px-6 pt-6 pb-5 border-b",
              "border-purple-500/20 dark:border-purple-300/15",
              "rounded-t-3xl",
              "bg-gradient-to-b from-purple-500/10 to-transparent dark:from-purple-300/10",
              "overflow-hidden"
            )}
          >
            <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-[520px] -translate-x-1/2 rounded-full bg-purple-500/15 blur-3xl dark:bg-purple-300/10" />
            <div className="pointer-events-none absolute -bottom-16 right-[-60px] h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-400/10" />

            <div className="flex items-start justify-between gap-3 relative">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "relative grid place-items-center h-12 w-12 rounded-2xl",
                    "bg-purple-500/10 dark:bg-purple-300/10",
                    "ring-1 ring-purple-500/30 dark:ring-purple-300/25",
                    "shadow-[0_0_0_8px_rgba(139,92,246,0.10)] dark:shadow-[0_0_0_8px_rgba(196,181,253,0.10)]"
                  )}
                >
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
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/12 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-white">
                        <Bot className="h-3.5 w-3.5" />
                        {item.model}
                      </span>
                    ) : null}

                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-white/10 dark:text-white/80">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI 분석
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[74vh] overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                원본 코드
              </div>
              {hasCode ? (
                <pre
                  className={cn(
                    "max-h-[420px] overflow-auto rounded-2xl px-4 py-3",
                    "bg-slate-950/95 text-slate-50 dark:bg-black",
                    "shadow-[0_0_0_1px_rgba(139,92,246,0.22)] dark:shadow-[0_0_0_1px_rgba(196,181,253,0.18)]"
                  )}
                >
                  <code className="whitespace-pre text-[11px] leading-relaxed">
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
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                리뷰 요약
              </div>
              <div
                className={cn(
                  "rounded-2xl p-4 bg-background/70",
                  "shadow-[0_0_0_1px_rgba(148,163,184,0.35)] dark:shadow-[0_0_0_1px_rgba(148,163,184,0.45)]"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-100 text-sm">
                  {item.summary}
                </p>
              </div>
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
   🔹 Summary Card (항상 이걸로만 렌더)
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
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/12",
        "hover:shadow-[0_18px_50px_rgba(139,92,246,0.10)]",
        "hover:border-purple-500/25 dark:hover:border-purple-300/20",
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
   🔹 Loading Card Skeleton (Analyses 전용)
=========================================================== */

function ReviewCardSkeleton() {
  return (
    <Card className="pt-0 overflow-hidden dark:border-white/15">
      <div className={brandHeader}>
        <div className="flex items-center gap-3">
          <div className={cn(iconWrap, "h-10 w-10")}>
            <PurpleSkeleton className="h-4 w-4 rounded-md" />
          </div>

          {/* 제목 라인: 기존 w-40 + h-6 이 애매해서 살짝 정리 */}
          <div className="min-w-0 flex-1">
            <PurpleSkeleton className="h-5 w-44 rounded-lg" />
            <div className="mt-2 flex items-center gap-2">
              <PurpleSkeleton className="h-3 w-24 rounded-md" />
              <PurpleSkeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>

          {/* 우측 모델 뱃지 자리 느낌 */}
          <PurpleSkeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        <PurpleSkeleton className="h-3 w-full rounded-md" />
        <PurpleSkeleton className="h-3 w-5/6 rounded-md" />
        <PurpleSkeleton className="h-3 w-2/3 rounded-md" />
        {/* summary 영역: 기존 h-20은 카드 높이 대비 조금 작아서 살짝 키움 */}
        <PurpleSkeleton className="h-24 w-full rounded-xl" />
      </CardContent>
    </Card>
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

  // ✅ 상세 다이얼로그 상태
  const [openDetail, setOpenDetail] = React.useState(false);
  const [selected, setSelected] = React.useState<ReviewItem | null>(null);

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
      {/* 상단: 타이틀 + 필터/정렬 */}
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
        <CardContent className="pt-4" />
      </Card>

      {/* 상단 요약 */}
      {stats && (
        <Card className="overflow-hidden pt-0 dark:border-white/50">
          <BrandHeader
            icon={Gauge}
            title="핵심 지표"
            subtitle="전체 리뷰 기준 요약 통계입니다."
          />
          <CardContent className="grid gap-4 md:grid-cols-4 pt-4">
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

      {/* 리스트 (항상 자세히 보기) */}
      <Card className="overflow-hidden pt-0 dark:border-white/50">
        <BrandHeader
          icon={ListChecks}
          title="리뷰 목록"
          subtitle="카드를 클릭하면 상세 다이얼로그가 열립니다."
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

          {/* ✅ 로딩 스켈레톤: 다크에서도 퍼플톤으로 또렷하게 */}
          {isInitialLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <ReviewCardSkeleton key={idx} />
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
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                {filtered.map((item) => (
                  <ReviewSummaryCard
                    key={item.review_id}
                    item={item}
                    onClick={() => {
                      setSelected(item);
                      setOpenDetail(true);
                    }}
                  />
                ))}
              </div>

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
