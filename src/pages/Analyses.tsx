// src/pages/Analyses.tsx
"use client";

import * as React from "react";
import { fetchReviews } from "@/lib/reviewsApi";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

// ====== 백엔드 스키마에 맞춘 타입들 ======
type ScoresByCategory = {
  bug: number;
  performance: number;
  maintainability: number;
  style: number;
  docs: number;
  dependency: number;
  security: number;
  testing: number;
};

type IssueSeverity = "HIGH" | "MEDIUM" | "LOW";

type CategoryName =
  | "Bug"
  | "Performance"
  | "Maintainability"
  | "Style"
  | "Docs"
  | "Dependency"
  | "Security"
  | "Testing";

type ReviewDetailItem = {
  issue_id?: string | null;
  issue_category: CategoryName;
  issue_severity: IssueSeverity;
  issue_summary: string;
  issue_details?: string | null;
  issue_line_number?: number | null;
  issue_column_number?: number | null;
};

type ReviewCore = {
  id: number;
  user_id: number;
  model: string;
  trigger: string;
  language?: string | null;

  quality_score: number;
  summary: string | null;

  // (필요하면 score_bug 등도 쓸 수 있지만,
  // 여기서는 scores_by_category를 메인으로 사용)
  score_bug: number;
  score_maintainability: number;
  score_style: number;
  score_security: number;

  status: string;
  created_at: string;
  updated_at: string;
};

type ReviewWithDetails = {
  review: ReviewCore;
  scores_by_category: ScoresByCategory;
  review_details: ReviewDetailItem[];
};

// 카테고리 키→라벨 맵
const CATEGORY_LABELS: Record<keyof ScoresByCategory, string> = {
  bug: "Bug",
  performance: "Performance",
  maintainability: "Maintainability",
  style: "Style",
  docs: "Docs",
  dependency: "Dependency",
  security: "Security",
  testing: "Testing",
};

function severityColor(severity: IssueSeverity) {
  switch (severity) {
    case "HIGH":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "LOW":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    default:
      return "";
  }
}

export default function Analyses() {
  // ===== 서버 데이터 =====
  const [items, setItems] = React.useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [limit, setLimit] = React.useState<number>(20);

  // ===== 필터 =====
  const [q, setQ] = React.useState(""); // summary / issue 검색
  const [minQuality, setMinQuality] = React.useState<string>("__all__");
  const [languageFilter, setLanguageFilter] = React.useState<string>("__all__");

  // 카드마다 이슈를 접었다/폈다 하기 위한 상태
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(
    () => new Set()
  );

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchReviews(limit); // GET /v1/reviews?limit=...
      setItems(Array.isArray(data) ? (data as ReviewWithDetails[]) : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => {
    void load();
  }, [load]);

  // 필터 적용
  const filtered = React.useMemo(() => {
    const mq = minQuality === "__all__" ? null : Number(minQuality);

    return items.filter((item) => {
      const r = item.review;

      if (mq != null && r.quality_score < mq) return false;

      if (languageFilter !== "__all__") {
        const lang = (r.language || "").toLowerCase();
        if (lang !== languageFilter.toLowerCase()) return false;
      }

      if (q.trim()) {
        const summary = (r.summary ?? "").toLowerCase();
        const issuesText = item.review_details
          .map(
            (d) =>
              `${d.issue_summary ?? ""} ${d.issue_details ?? ""} ${
                d.issue_category ?? ""
              }`
          )
          .join(" ")
          .toLowerCase();

        const hay = `${summary} ${issuesText}`;
        if (!hay.includes(q.toLowerCase())) return false;
      }

      return true;
    });
  }, [items, q, minQuality, languageFilter]);

  const allLanguages = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.review.language) {
        set.add(item.review.language);
      }
    });
    return Array.from(set);
  }, [items]);

  return (
    <div className="space-y-6">
      {/* ===== 헤더: limit / 새로고침 ===== */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">분석 기록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            VS Code에서 보낸 코드 리뷰 내역이 여기 쌓입니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">limit</span>
          <Input
            className="w-24"
            type="number"
            min={1}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value || 20))}
          />
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "불러오는 중…" : "새로고침"}
          </Button>
        </div>
      </div>

      {/* ===== 필터 ===== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">필터</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="요약·이슈 내용 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <Select value={minQuality} onValueChange={setMinQuality}>
            <SelectTrigger>
              <SelectValue placeholder="최소 Quality 점수" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Quality 제한 없음</SelectItem>
              {[50, 60, 70, 80, 90].map((v) => (
                <SelectItem key={v} value={String(v)}>
                  Quality ≥ {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={languageFilter}
            onValueChange={setLanguageFilter}
            disabled={allLanguages.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="언어 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">모든 언어</SelectItem>
              {allLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ===== 리스트 ===== */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-medium">내 리뷰</h2>
          <span className="text-sm text-muted-foreground">
            {filtered.length}건
          </span>
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/40">
            <CardContent className="py-3 text-sm text-red-700 dark:text-red-200">
              {error}
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              불러오는 중…
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              아직 분석 기록이 없습니다.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {filtered.map((item) => {
            const r = item.review;
            const scores = item.scores_by_category;
            const details = item.review_details;
            const expanded = expandedIds.has(r.id);

            return (
              <Card
                key={r.id}
                className="border border-slate-200/70 dark:border-slate-800/70"
              >
                {/* 상단 요약 */}
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    <span className="font-semibold">#{r.id}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>
                      Quality{" "}
                      <b>
                        {r.quality_score}
                        /100
                      </b>
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-xs text-muted-foreground">
                      model: {r.model}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-xs text-muted-foreground">
                      trigger: {r.trigger}
                    </span>
                    {r.language && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-xs text-muted-foreground">
                          lang: {r.language}
                        </span>
                      </>
                    )}
                    <Separator orientation="vertical" className="h-4" />
                    <Badge
                      variant="outline"
                      className="text-[11px] uppercase tracking-wide"
                    >
                      {r.status}
                    </Badge>
                  </CardTitle>
                  {r.created_at && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                  {/* 요약 */}
                  {r.summary && (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {r.summary}
                    </p>
                  )}

                  {/* 카테고리별 점수 */}
                  <div className="rounded-lg border border-slate-200/70 dark:border-slate-800/70 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                      Category Scores
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(scores) as [
                          keyof ScoresByCategory,
                          number
                        ][]
                      )
                        .filter(([, value]) => value > 0)
                        .map(([key, value]) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="flex items-center gap-1 text-[11px]"
                          >
                            <span>{CATEGORY_LABELS[key]}</span>
                            <span className="opacity-80">{value}/5</span>
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* 이슈 상세 리스트 */}
                  {details && details.length > 0 && (
                    <div className="rounded-lg border border-slate-200/70 dark:border-slate-800/70 p-3">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                        <span>Issues</span>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(r.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-violet-600 hover:underline dark:text-violet-300"
                        >
                          {expanded ? "접기" : "상세보기"}
                          {expanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {details
                          .slice(0, expanded ? details.length : 3)
                          .map((d, idx) => (
                            <div
                              key={d.issue_id ?? idx}
                              className="rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-900/60"
                            >
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {d.issue_category}
                                </Badge>
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                                    severityColor(d.issue_severity)
                                  )}
                                >
                                  {d.issue_severity}
                                </span>
                                {typeof d.issue_line_number === "number" && (
                                  <span className="text-[10px] text-muted-foreground">
                                    line {d.issue_line_number}
                                    {typeof d.issue_column_number === "number"
                                      ? `, col ${d.issue_column_number}`
                                      : ""}
                                  </span>
                                )}
                              </div>
                              <div className="font-medium">
                                {d.issue_summary}
                              </div>
                              {d.issue_details && (
                                <div className="mt-1 whitespace-pre-wrap text-[11px] text-muted-foreground">
                                  {d.issue_details}
                                </div>
                              )}
                            </div>
                          ))}

                        {details.length > 3 && !expanded && (
                          <div className="pt-1 text-[11px] text-muted-foreground">
                            외 {details.length - 3}개 이슈 더 있음…
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
