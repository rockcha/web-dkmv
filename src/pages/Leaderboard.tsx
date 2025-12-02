// src/pages/Leaderboard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  Medal,
  Trophy,
  Github,
  TrendingUp,
  ArrowUpRight,
  User2,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* =======================
   타입 정의
   - API 응답용 (RawUser)
   - 화면에서 쓸 확장 타입 (LeaderboardUser)
========================= */

// Swagger 응답 그대로
type RawUser = {
  id: number;
  github_id: string;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

// 화면용 타입 (더미 점수/향상률/리뷰수 포함)
type LeaderboardUser = RawUser & {
  global_score: number; // 전체 점수 (0~100 정도)
  improvement_rate: number; // 향상률 (%)
  review_count: number; // 리뷰 요청 수
};

type RankedUser = LeaderboardUser & { rank: number };

// ⚠️ 실제 프로젝트에서 사용 중인 API BASE 로 교체/정리해줘
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://18.205.229.159:8000";

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();

  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------- 데이터 로딩 ----------------- */

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        setError(null);

        // ✅ 실제 엔드포인트: /v1/users
        const res = await fetch(`${API_BASE}/v1/users`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = (await res.json()) as RawUser[];

        if (cancelled) return;

        // ⚠️ 서버에 아직 점수/향상률이 없어서
        //    id 기반으로 "항상 동일한 더미 값"을 만들어서 UI용 데이터 구성
        const enriched: LeaderboardUser[] = json.map((u, idx) => {
          const base = u.id ?? idx + 1;

          // 60~99 사이 점수
          const global_score = 60 + ((base * 7) % 40);

          // -3.0 ~ +13.0% 사이 (대부분 +)
          const improvement_rate = (((base * 13) % 160) - 30) / 10;

          // 5 ~ 44개 리뷰 수
          const review_count = 5 + ((base * 5) % 40);

          return {
            ...u,
            global_score,
            improvement_rate,
            review_count,
          };
        });

        setData(enriched);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to load leaderboard:", err);
          setError(err?.message ?? "랭킹 정보를 불러오지 못했어요.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------- 정렬 / 랭크 계산 ----------------- */

  const rankedByScore: RankedUser[] = useMemo(() => {
    if (!data.length) return [];
    return [...data]
      .sort((a, b) => b.global_score - a.global_score)
      .map((u, idx) => ({ ...u, rank: idx + 1 }));
  }, [data]);

  const rankedByImprovement: RankedUser[] = useMemo(() => {
    if (!data.length) return [];
    return [...data]
      .sort((a, b) => b.improvement_rate - a.improvement_rate)
      .map((u, idx) => ({ ...u, rank: idx + 1 }));
  }, [data]);

  /* ----------------- 내 순위 / 주변 ----------------- */

  const myRankByScore = useMemo(() => {
    if (!user || !rankedByScore.length) return null;
    return (
      rankedByScore.find(
        (u) => u.github_id === user.github_id || u.login === user.login
      ) ?? null
    );
  }, [rankedByScore, user]);

  const myAroundByScore = useMemo(() => {
    if (!myRankByScore || !rankedByScore.length) return [];
    const idx = rankedByScore.findIndex((u) => u.id === myRankByScore.id);
    const start = Math.max(0, idx - 2);
    return rankedByScore.slice(start, start + 5);
  }, [myRankByScore, rankedByScore]);

  /* ----------------- UI 헬퍼 ----------------- */

  const badgeForRank = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black">
          <Trophy className="h-3 w-3" />
          1위
        </Badge>
      );
    }
    if (rank === 2 || rank === 3) {
      return (
        <Badge className="gap-1 bg-violet-600/90 text-white">
          <Medal className="h-3 w-3" />
          TOP 3
        </Badge>
      );
    }
    if (rank <= 10) {
      return (
        <Badge
          variant="outline"
          className="border-violet-500/60 text-violet-300"
        >
          TOP 10
        </Badge>
      );
    }
    return null;
  };

  const renderGithubAvatar = (u: RawUser | LeaderboardUser, size = 32) => {
    const src =
      u.avatar_url || `https://github.com/${u.login}.png?size=${size}`;

    return (
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-900">
        <img
          src={src}
          alt={u.login}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  };

  const formatName = (u: RawUser | LeaderboardUser) =>
    u.name?.trim() ? u.name : u.login;

  /* ----------------- 렌더링 ----------------- */

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            글로벌 코드 품질 점수와 향상률 기준으로 유저 랭킹을 확인할 수
            있어요.
            <span className="ml-1 opacity-60">(현재는 더미 점수 기반 UI)</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Github className="h-3.5 w-3.5" />
          <span>GitHub OAuth 기반 유저 랭킹</span>
        </div>
      </div>

      {/* 내 순위 카드 */}
      <Card className="border-violet-500/40 bg-gradient-to-br from-violet-600/20 via-slate-950 to-violet-900/40 shadow-sm shadow-violet-500/40">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
              <User2 className="h-5 w-5 text-violet-200" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-sm">내 순위</CardTitle>
              <p className="text-[11px] text-slate-300">
                GitHub 계정으로 로그인하면 내 랭킹이 여기 표시됩니다.
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            myRankByScore ? (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {badgeForRank(myRankByScore.rank)}

                <div className="flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 border border-slate-700/80">
                  {renderGithubAvatar(myRankByScore)}
                  <div className="flex flex-col">
                    <span className="truncate text-[12px] font-semibold text-slate-50">
                      {formatName(myRankByScore)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      @{myRankByScore.login}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 rounded-full bg-slate-900/60 px-3 py-1 border border-violet-500/40">
                  <span className="text-[11px] text-slate-300">Global</span>
                  <span className="text-lg font-bold tracking-tight tabular-nums text-violet-100">
                    {myRankByScore.global_score.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-400">점</span>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-emerald-900/40 px-3 py-1 border border-emerald-500/40">
                  <TrendingUp className="h-3 w-3 text-emerald-300" />
                  <span className="text-[11px] text-emerald-200">
                    {myRankByScore.improvement_rate >= 0 ? "+" : ""}
                    {myRankByScore.improvement_rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-full border border-dashed border-slate-600 px-3 py-1 text-[11px] text-slate-300">
                아직 랭킹에 집계되지 않았어요. 리뷰를 조금 더 요청해 보세요.
              </div>
            )
          ) : (
            <div className="rounded-full border border-dashed border-slate-600 px-3 py-1 text-[11px] text-slate-300">
              로그인하면 내 순위를 확인할 수 있어요.
            </div>
          )}
        </CardHeader>

        {/* 내 주변 랭킹 */}
        {isAuthenticated && myAroundByScore.length > 0 && (
          <CardContent className="border-t border-slate-800/80 pt-3">
            <p className="mb-2 text-[11px] text-slate-400">내 주변 유저들</p>
            <div className="space-y-1.5 text-xs">
              {myAroundByScore.map((u) => {
                const isMe = myRankByScore && u.id === myRankByScore.id;
                return (
                  <div
                    key={u.id}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-2 py-1.5",
                      isMe
                        ? "border-violet-500/70 bg-violet-950/70"
                        : "border-slate-800/80 bg-slate-950/60"
                    )}
                  >
                    <div className="flex w-10 items-center justify-center text-[11px] font-semibold text-slate-300">
                      {u.rank}위
                    </div>
                    {renderGithubAvatar(u, 28)}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[12px] text-slate-100">
                        {formatName(u)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        @{u.login}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] text-slate-400">점수</span>
                      <span className="text-sm font-semibold tabular-nums text-slate-50">
                        {u.global_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 메인 랭킹 탭 */}
      <Tabs defaultValue="score" className="space-y-4">
        <TabsList className="w-full justify-start gap-1 bg-slate-900/80">
          <TabsTrigger
            value="score"
            className="flex items-center gap-1 text-xs"
          >
            <Medal className="h-3 w-3" />
            Global Score
          </TabsTrigger>
          <TabsTrigger
            value="improvement"
            className="flex items-center gap-1 text-xs"
          >
            <TrendingUp className="h-3 w-3" />
            향상률
          </TabsTrigger>
        </TabsList>

        {/* Global Score 탭 */}
        <TabsContent value="score">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Medal className="h-4 w-4 text-yellow-400" />
                Global Score 랭킹
              </CardTitle>
              <span className="text-[11px] text-slate-400">
                상위 50명까지 표시됩니다.
              </span>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex items-center justify-between rounded-md border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                  <span>랭킹 데이터를 불러오는 중 오류가 발생했어요.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/60 text-red-200 hover:bg-red-900/40"
                    onClick={() => window.location.reload()}
                  >
                    새로고침
                  </Button>
                </div>
              ) : !rankedByScore.length ? (
                <div className="rounded-md border border-dashed border-slate-700 px-4 py-6 text-center text-xs text-slate-400">
                  아직 랭킹 데이터가 없습니다.
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {rankedByScore.slice(0, 50).map((u) => {
                    const isMe =
                      isAuthenticated &&
                      (u.github_id === user?.github_id ||
                        u.login === user?.login);
                    const badge = badgeForRank(u.rank);

                    return (
                      <div
                        key={u.id}
                        className={cn(
                          "flex items-center gap-3 rounded-md border px-2 py-1.5 transition-colors",
                          isMe
                            ? "border-violet-500/70 bg-violet-950/80"
                            : "border-slate-800 bg-slate-950 hover:border-violet-500/40 hover:bg-slate-900"
                        )}
                      >
                        {/* 순위 */}
                        <div className="flex w-10 flex-col items-center justify-center">
                          <span
                            className={cn(
                              "text-[11px] font-semibold",
                              u.rank <= 3 ? "text-yellow-300" : "text-slate-300"
                            )}
                          >
                            {u.rank}위
                          </span>
                          {badge && (
                            <div className="mt-0.5 text-[9px]">{badge}</div>
                          )}
                        </div>

                        {/* 아바타 */}
                        {renderGithubAvatar(u, 32)}

                        {/* 이름 / 아이디 */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[12px] text-slate-50">
                              {formatName(u)}
                            </span>
                            <a
                              href={`https://github.com/${u.login}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-slate-300 hover:text-white"
                              title="GitHub 프로필 열기"
                            >
                              <Github className="h-3 w-3" />
                            </a>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            @{u.login} · 리뷰 {u.review_count}개
                          </span>
                        </div>

                        {/* 점수 */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-[11px] text-slate-400">
                            점수
                          </span>
                          <span className="text-sm font-semibold tabular-nums text-slate-50">
                            {u.global_score.toFixed(1)}
                          </span>
                        </div>

                        {/* 향상률 미니 */}
                        <div className="ml-2 flex items-center gap-1 rounded-full bg-emerald-950/60 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/40">
                          <TrendingUp className="h-3 w-3" />
                          <span>
                            {u.improvement_rate >= 0 ? "+" : ""}
                            {u.improvement_rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 향상률 탭 */}
        <TabsContent value="improvement">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                향상률 랭킹
              </CardTitle>
              <span className="text-[11px] text-slate-400">
                최근 기준 Global Score 향상률 상위 50명입니다.
              </span>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex items-center justify-between rounded-md border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                  <span>랭킹 데이터를 불러오는 중 오류가 발생했어요.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/60 text-red-200 hover:bg-red-900/40"
                    onClick={() => window.location.reload()}
                  >
                    새로고침
                  </Button>
                </div>
              ) : !rankedByImprovement.length ? (
                <div className="rounded-md border border-dashed border-slate-700 px-4 py-6 text-center text-xs text-slate-400">
                  아직 향상률 데이터가 없습니다.
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {rankedByImprovement.slice(0, 50).map((u) => {
                    const isMe =
                      isAuthenticated &&
                      (u.github_id === user?.github_id ||
                        u.login === user?.login);

                    return (
                      <div
                        key={u.id}
                        className={cn(
                          "flex items-center gap-3 rounded-md border px-2 py-1.5 transition-colors",
                          isMe
                            ? "border-emerald-500/70 bg-emerald-950/80"
                            : "border-slate-800 bg-slate-950 hover:border-emerald-500/40 hover:bg-slate-900"
                        )}
                      >
                        {/* 순위 */}
                        <div className="flex w-10 flex-col items-center justify-center">
                          <span
                            className={cn(
                              "text-[11px] font-semibold",
                              u.rank <= 3
                                ? "text-emerald-300"
                                : "text-slate-300"
                            )}
                          >
                            {u.rank}위
                          </span>
                        </div>

                        {/* 아바타 */}
                        {renderGithubAvatar(u, 32)}

                        {/* 이름 / 아이디 */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[12px] text-slate-50">
                              {formatName(u)}
                            </span>
                            <a
                              href={`https://github.com/${u.login}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-slate-300 hover:text-white"
                              title="GitHub 프로필 열기"
                            >
                              <Github className="h-3 w-3" />
                            </a>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            @{u.login} · 리뷰 {u.review_count}개
                          </span>
                        </div>

                        {/* 향상률 */}
                        <div className="flex items-center gap-1 rounded-full bg-emerald-900/70 px-2 py-0.5 text-[11px] text-emerald-100 border border-emerald-500/60">
                          <TrendingUp className="h-3 w-3" />
                          <span>
                            {u.improvement_rate >= 0 ? "+" : ""}
                            {u.improvement_rate.toFixed(1)}%
                          </span>
                        </div>

                        {/* 현재 점수 미니 */}
                        <div className="ml-2 flex items-baseline gap-1">
                          <span className="text-[11px] text-slate-400">
                            점수
                          </span>
                          <span className="text-sm font-semibold tabular-nums text-slate-50">
                            {u.global_score.toFixed(1)}
                          </span>
                        </div>

                        <ArrowUpRight className="ml-1 h-3 w-3 text-slate-500" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
