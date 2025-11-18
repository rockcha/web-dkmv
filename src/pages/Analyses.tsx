// src/pages/Analyses.tsx
"use client";

import * as React from "react";
import { fetchReviews } from "@/lib/reviewsApi";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/auth";

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

type ReviewItem = {
  review_id?: number;
  global_score?: number;
  model_score?: number;
  efficiency_index?: number;
  summary?: string;
  status?: string;
  trigger?: string;
  created_at?: string;
  categories?: { name: string; score: number; comment?: string }[];
};

export default function Analyses() {
  const [items, setItems] = React.useState<ReviewItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const [page, setPage] = React.useState<number>(1);

  const [q, setQ] = React.useState("");
  const [minGlobal, setMinGlobal] = React.useState<string>("__all__");
  const [minModel, setMinModel] = React.useState<string>("__all__");

  const [tokenInput, setTokenInput] = React.useState(getAuthToken() ?? "");
  const saveToken = () => {
    setAuthToken(tokenInput || "");
    alert("토큰 저장됨");
  };
  const removeToken = () => {
    clearAuthToken();
    setTokenInput("");
    alert("토큰 제거됨");
  };

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken() ?? undefined;
      const data = await fetchReviews(page, token);

      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const mg = minGlobal === "__all__" ? null : Number(minGlobal);
    const mm = minModel === "__all__" ? null : Number(minModel);
    return items.filter((r) => {
      if (mg != null && (r.global_score ?? -Infinity) < mg) return false;
      if (mm != null && (r.model_score ?? -Infinity) < mm) return false;

      if (q.trim()) {
        const cats = (r.categories ?? []).map((c) => c.name).join(" ");
        const hay = `${r.summary ?? ""} ${cats}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, q, minGlobal, minModel]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          분석 기록 (실서버)
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

          {/* page + 새로고침 */}
          <div className="flex items-center gap-2 md:ml-4">
            <span className="text-sm text-muted-foreground">page</span>
            <Input
              className="w-24"
              type="number"
              min={1}
              value={page}
              onChange={(e) => setPage(Number(e.target.value || 1))}
            />
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? "불러오는 중…" : "새로고침"}
            </Button>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="검색(요약/카테고리)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <Select value={minGlobal} onValueChange={setMinGlobal}>
          <SelectTrigger>
            <SelectValue placeholder="최소 Global 점수" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Global 제한 없음</SelectItem>
            {[50, 60, 70, 80, 90].map((v) => (
              <SelectItem key={v} value={String(v)}>
                Global ≥ {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={minModel} onValueChange={setMinModel}>
          <SelectTrigger>
            <SelectValue placeholder="최소 Model 점수" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Model 제한 없음</SelectItem>
            {[50, 60, 70, 80, 90].map((v) => (
              <SelectItem key={v} value={String(v)}>
                Model ≥ {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>
            서버 리뷰 목록{" "}
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
              {filtered.length}건
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm">
          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-12 gap-3 pb-2 font-semibold text-slate-700 dark:text-slate-200">
            <div className="col-span-2">ID / 날짜</div>
            <div className="col-span-2">Global / Model</div>
            <div className="col-span-4">요약</div>
            <div className="col-span-4">카테고리</div>
          </div>

          {loading && (
            <div className="py-12 text-center text-slate-500">불러오는 중…</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              데이터가 없습니다.
            </div>
          )}

          {filtered.map((it) => (
            <div
              key={String(it.review_id ?? Math.random())}
              className="grid grid-cols-12 gap-3 border-t border-slate-200 py-3 dark:border-slate-800"
            >
              <div className="col-span-2">
                <div className="font-medium">#{it.review_id ?? "-"}</div>
                <div className="text-xs text-slate-500">
                  {it.created_at
                    ? new Date(it.created_at).toLocaleString()
                    : "-"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="font-semibold text-violet-600 dark:text-violet-400">
                  G {it.global_score ?? "-"}
                </div>
                <div className="text-xs text-slate-500">
                  M {it.model_score ?? "-"}
                </div>
              </div>

              <div className="col-span-4">
                <div className="line-clamp-3 text-slate-700 dark:text-slate-300">
                  {it.summary || (
                    <span className="text-slate-500">요약 없음</span>
                  )}
                </div>
              </div>

              <div className="col-span-4 space-y-1">
                {(it.categories ?? []).slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      {c.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      score: {c.score}
                    </span>
                    {c.comment && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-xs">{c.comment}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
