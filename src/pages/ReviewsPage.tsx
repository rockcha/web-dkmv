import * as React from "react";
import { fetchReviews, createReviewRaw } from "@/lib/reviewsApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type ReviewItem = {
  review_id?: number;
  global_score?: number;
  model_score?: number;
  categories?: { name: string; score: number; comment?: string }[];
  summary?: string;
  created_at?: string; // 있으면 표시
};

export default function ReviewsPage() {
  const [limit, setLimit] = React.useState<number>(20);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [items, setItems] = React.useState<ReviewItem[]>([]);

  // 생성용 Raw JSON (스키마에 맞춰 자유롭게 수정)
  const [payload, setPayload] = React.useState<string>(
    JSON.stringify(
      {
        // ⬇ 백엔드가 요구하는 필드에 맞춰 수정하세요
        global_score: 85,
        model_score: 87,
        categories: [
          { name: "readability", score: 4, comment: "코드 가독성 양호" },
          { name: "maintainability", score: 4, comment: "구조가 단순" },
        ],
        summary: "샘플 리뷰 요약",
      },
      null,
      2
    )
  );
  const [posting, setPosting] = React.useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchReviews(limit);
      setItems(data ?? []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      await load(); // 저장 후 목록 리프레시
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reviews (임시)</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="limit" className="text-sm">
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
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "불러오는 중…" : "새로고침"}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">리뷰 생성 (Raw JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="space-y-3">
            <Label className="text-sm">Payload (JSON)</Label>
            <Textarea
              className="min-h-[180px] font-mono text-sm"
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
              * 백엔드 스키마 그대로 보냅니다. 필요한 필드를 JSON으로 자유롭게
              편집하세요.
            </p>
          </form>
        </CardContent>
      </Card>

      <section>
        <div className="flex items-center justify-between mb-2">
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
          {items.map((r) => (
            <Card
              key={String(r.review_id ?? Math.random())}
              className="border border-slate-200/70 dark:border-slate-800/70"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex flex-wrap items-center gap-3">
                  <span className="font-semibold">#{r.review_id}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>
                    Global: <b>{r.global_score ?? "-"}</b>
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>
                    Model: <b>{r.model_score ?? "-"}</b>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {r.summary && (
                  <p className="whitespace-pre-wrap">{r.summary}</p>
                )}
                {Array.isArray(r.categories) && r.categories.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <div className="font-medium mb-2">Categories</div>
                    <ul className="space-y-1">
                      {r.categories.map((c, i) => (
                        <li
                          key={i}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                            {c.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            score: {c.score}
                          </span>
                          {c.comment && (
                            <span className="text-xs">— {c.comment}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {r.created_at && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
