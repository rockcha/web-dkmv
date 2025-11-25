// src/pages/ReviewsPage.tsx
import * as React from "react";
import { fetchReviews, createReviewRaw } from "@/lib/reviewsApi";
import { setAuthToken, getAuthToken, clearAuthToken } from "@/lib/auth";

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  summary: string;

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

export default function ReviewsPage() {
  // ---- state
  const [limit, setLimit] = React.useState<number>(20);
  const [loading, setLoading] = React.useState(false);
  const [posting, setPosting] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [items, setItems] = React.useState<ReviewWithDetails[]>([]);
  const [tokenInput, setTokenInput] = React.useState(getAuthToken() ?? "");

  // 초기 예시 payload (Raw JSON) – 백엔드 스펙에 맞게 자유롭게 수정해서 사용
  const [payload, setPayload] = React.useState<string>(
    JSON.stringify(
      {
        // 예: ReviewResultRequest.record 형태 또는 LLMQualityResponse 형태 등
        // 실제 백엔드 스펙에 맞게 수정해서 사용하면 됩니다.
        quality_score: 85,
        review_summary: "샘플 리뷰 요약입니다.",
        scores_by_category: {
          bug: 3,
          performance: 4,
          maintainability: 4,
          style: 5,
          docs: 3,
          dependency: 4,
          security: 4,
          testing: 3,
        },
        review_details: {
          bug: "중요한 버그는 발견되지 않았습니다.",
          performance: "루프 최적화 여지가 약간 있습니다.",
        },
      },
      null,
      2
    )
  );

  // ---- actions
  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchReviews(limit);
      // 백엔드에서 ReviewWithDetails[] 내려온다고 가정
      setItems(Array.isArray(data) ? (data as ReviewWithDetails[]) : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => {
    // 첫 진입 시 목록 로드
    void load();
  }, [load]);

  const saveToken = () => {
    setAuthToken(tokenInput || "");
    alert("토큰 저장됨");
  };
  const removeToken = () => {
    clearAuthToken();
    setTokenInput("");
    alert("토큰 제거됨");
  };

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    let body: unknown;
    try {
      body = JSON.parse(payload);
    } catch {
      setError("JSON 파싱 실패: 유효한 JSON인지 확인하세요.");
      return;
    }

    try {
      setPosting(true);
      setError("");
      await createReviewRaw(body);
      await load(); // 저장 후 목록 다시 불러오기
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setPosting(false);
    }
  }

  // ---- UI
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      {/* 헤더 */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reviews (임시 / v2 스키마)
        </h1>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* 토큰 입력 */}
          <div className="flex items-center gap-2">
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Bearer 토큰"
              className="w-[340px]"
            />
            <Button variant="secondary" onClick={saveToken}>
              저장
            </Button>
            <Button variant="outline" onClick={removeToken}>
              삭제
            </Button>
          </div>

          {/* limit + 새로고침 */}
          <div className="flex items-center gap-2 md:ml-4">
            <Label htmlFor="limit" className="text-sm text-muted-foreground">
              limit
            </Label>
            <Input
              id="limit"
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
      </header>

      {/* 생성 폼 (Raw JSON) */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">리뷰 생성 (Raw JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Payload (JSON)
            </Label>
            <Textarea
              className="min-h-[200px] font-mono text-sm"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={posting}>
                {posting ? "저장 중…" : "리뷰 저장"}
              </Button>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              * 백엔드 스키마(예: ReviewResultRequest, LLMQualityResponse 등)에
              맞춰 JSON을 직접 작성해서 전송하는 영역입니다.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* 목록 */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-medium">리뷰 목록</h2>
          <span className="text-sm text-muted-foreground">
            {items.length}개
          </span>
        </div>

        {loading && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              불러오는 중…
            </CardContent>
          </Card>
        )}

        {!loading && items.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              데이터가 없습니다.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {items.map((item) => {
            const r = item.review;
            const scores = item.scores_by_category;
            const details = item.review_details;

            return (
              <Card
                key={r.id}
                className="border border-slate-200/70 dark:border-slate-800/70"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    <span className="font-semibold">#{r.id}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>
                      Quality:{" "}
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

                  {/* 카테고리별 점수 (ScoresByCategory) */}
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
                      <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                        Issues
                      </div>
                      <div className="space-y-2">
                        {details.map((d, idx) => (
                          <div
                            key={d.issue_id ?? idx}
                            className="rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-900/60"
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">
                                {d.issue_category}
                              </Badge>
                              <span
                                className={[
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                                  severityColor(d.issue_severity),
                                ].join(" ")}
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
                            <div className="font-medium">{d.issue_summary}</div>
                            {d.issue_details && (
                              <div className="mt-1 text-[11px] text-muted-foreground whitespace-pre-wrap">
                                {d.issue_details}
                              </div>
                            )}
                          </div>
                        ))}
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
