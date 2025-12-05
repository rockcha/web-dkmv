// src/pages/Leaderboard.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Github } from "lucide-react";

import { fetchUserStats, type UserStatsApiItem } from "@/api/userStats";
import { fetchUsers, type RawUser } from "@/api/users";

/* =======================
   메트릭 설정
======================= */

type MetricKey = "total" | "bug" | "maintainability" | "style" | "security";

const METRIC_CONFIG: Record<
  MetricKey,
  {
    key: MetricKey;
    label: string;
    shortLabel: string;
    description: string;
  }
> = {
  total: {
    key: "total",
    label: "총점",
    shortLabel: "총점",
    description: "전체 코드 품질 평균 점수",
  },
  bug: {
    key: "bug",
    label: "Bug",
    shortLabel: "Bug",
    description: "버그 탐지 및 안정성 점수",
  },
  maintainability: {
    key: "maintainability",
    label: "Maintainability",
    shortLabel: "Maint.",
    description: "유지보수 용이성 점수",
  },
  style: {
    key: "style",
    label: "Style",
    shortLabel: "Style",
    description: "코드 스타일/일관성 점수",
  },
  security: {
    key: "security",
    label: "Security",
    shortLabel: "Sec.",
    description: "보안 관련 점수",
  },
};

/* =======================
   타입 & 유틸
======================= */

type UserWithStats = {
  id: number;
  github_id: string | null;
  login: string;
  avatar_url: string | null;
  // 집계 데이터
  review_count: number;
  avg_total: number | null;
  avg_bug: number | null;
  avg_maintainability: number | null;
  avg_style: number | null;
  avg_security: number | null;
};

type RankedUser = UserWithStats & {
  rank: number;
  compositeScore: number; // 선택한 메트릭 평균
};

function getMetricValue(u: UserWithStats, metric: MetricKey): number | null {
  switch (metric) {
    case "total":
      return u.avg_total;
    case "bug":
      return u.avg_bug;
    case "maintainability":
      return u.avg_maintainability;
    case "style":
      return u.avg_style;
    case "security":
      return u.avg_security;
    default:
      return null;
  }
}

function calcCompositeScore(u: UserWithStats, metrics: MetricKey[]): number {
  const values = metrics
    .map((m) => getMetricValue(u, m))
    .filter((v): v is number => typeof v === "number");

  if (!values.length) return NaN;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

function formatLogin(u: UserWithStats) {
  return u.login;
}

function buildAvatarUrl(u: UserWithStats, size = 48) {
  if (u.avatar_url && u.avatar_url !== "string") return u.avatar_url;
  if (u.login) {
    return `https://github.com/${u.login}.png?size=${size}`;
  }
  return "";
}

/* =======================
   컴포넌트
======================= */

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();

  const [stats, setStats] = useState<UserStatsApiItem[]>([]);
  const [users, setUsers] = useState<RawUser[]>([]);

  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    "total",
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 리스트에서 내 row를 찾기 위한 ref
  const myRowRef = useRef<HTMLDivElement | null>(null);

  /* ------------ 데이터 로딩 ------------ */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const [statsRes, usersRes] = await Promise.all([
          fetchUserStats(),
          fetchUsers(),
        ]);

        if (cancelled) return;

        setStats(statsRes);
        setUsers(usersRes);
      } catch (e: any) {
        if (!cancelled) {
          console.error("Failed to load leaderboard:", e);
          setError(
            e?.message ?? "랭킹 데이터를 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------ stats + users join ------------ */

  const joinedUsers: UserWithStats[] = useMemo(() => {
    if (!stats.length || !users.length) return [];

    // github_id 기준으로 조인
    const byGithubId = new Map<string | null, RawUser>();
    for (const u of users) {
      byGithubId.set(u.github_id, u);
    }

    return stats
      .map<UserWithStats | null>((s) => {
        const u = byGithubId.get(s.github_id ?? null);
        if (!u) return null; // 혹시 없는 경우 스킵

        return {
          id: u.id,
          github_id: u.github_id,
          login: u.login,
          avatar_url: u.avatar_url,
          review_count: s.review_count,
          avg_total: s.avg_total,
          avg_bug: s.avg_bug,
          avg_maintainability: s.avg_maintainability,
          avg_style: s.avg_style,
          avg_security: s.avg_security,
        };
      })
      .filter((u): u is UserWithStats => u !== null)
      .sort((a, b) => a.id - b.id); // 기본 정렬은 id
  }, [stats, users]);

  /* ------------ 선택한 메트릭 기반 랭킹 계산 ------------ */

  const rankedUsers: RankedUser[] = useMemo(() => {
    if (!joinedUsers.length) return [];

    const metrics: MetricKey[] = selectedMetrics.length
      ? selectedMetrics
      : (["total"] as MetricKey[]);

    const withScore: RankedUser[] = joinedUsers.map((u) => {
      const compositeScore = calcCompositeScore(u, metrics);
      return {
        ...u,
        compositeScore,
        rank: 0, // 이후에 채움
      };
    });

    withScore.sort((a, b) => {
      const av = isNaN(a.compositeScore) ? -Infinity : a.compositeScore;
      const bv = isNaN(b.compositeScore) ? -Infinity : b.compositeScore;
      return bv - av;
    });

    return withScore.map((u, idx) => ({ ...u, rank: idx + 1 }));
  }, [joinedUsers, selectedMetrics]);

  /* ------------ 내 순위 ------------ */

  const myRank = useMemo(() => {
    if (!isAuthenticated || !user || !rankedUsers.length) return null;

    return (
      rankedUsers.find(
        (u) =>
          (u.github_id && u.github_id === user.github_id) ||
          (u.login && u.login === user.login)
      ) ?? null
    );
  }, [rankedUsers, user, isAuthenticated]);

  /* ------------ 핸들러 ------------ */

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) => {
      const exists = prev.includes(key);
      if (exists) {
        if (prev.length === 1) return prev; // 최소 1개 유지
        return prev.filter((m) => m !== key);
      }
      return [...prev, key];
    });
  };

  const handleScrollToMe = () => {
    if (myRowRef.current) {
      myRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const hasData = !!rankedUsers.length && !isLoading && !error;

  /* ------------ 렌더링 ------------ */

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mt-1 text-xs text-slate-400">
            원하는 유형을 선택해서 유저들의 평균 점수 랭킹을 살펴보세요.
          </p>
        </div>
      </div>

      {/* 내 순위 카드 */}
      <Card className="border-violet-500/40 bg-slate-950/90 shadow-sm shadow-violet-500/30">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {isAuthenticated && myRank ? (
            <>
              {(() => {
                const rankEmoji =
                  myRank.rank === 1
                    ? "👑"
                    : myRank.rank === 2
                    ? "🥈"
                    : myRank.rank === 3
                    ? "🥉"
                    : null;

                return (
                  <>
                    {/* 아바타 + 이름 + 나의 순위 */}
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-slate-900",
                          myRank.rank === 1
                            ? "border-amber-300/80 shadow-[0_0_18px_rgba(251,191,36,0.65)]"
                            : myRank.rank === 2 || myRank.rank === 3
                            ? "border-violet-400/80"
                            : "border-violet-400/60"
                        )}
                      >
                        {buildAvatarUrl(myRank) ? (
                          <img
                            src={buildAvatarUrl(myRank, 96)}
                            alt={myRank.login}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Github className="h-6 w-6 text-slate-200" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-300">
                          {formatLogin(myRank)}
                        </span>

                        {/* 나의 순위: [보라색 큰 숫자] [이모지] */}
                        <div className="mt-1 flex flex-wrap items-baseline gap-2">
                          <span className="text-lg sm:text-xl font-semibold text-slate-50">
                            나의 순위:
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-violet-300">
                              {myRank.rank}위
                            </span>
                            {rankEmoji && (
                              <span className="text-2xl sm:text-3xl leading-none">
                                {rankEmoji}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 점수 + 내 위치로 버튼 */}
                    <div className="flex flex-col items-stretch gap-2 sm:items-end">
                      <div className="inline-flex items-baseline gap-1 rounded-full border border-violet-500/50 bg-slate-950/90 px-3 py-1.5">
                        <span className="text-[11px] text-slate-300">
                          평균 점수
                        </span>
                        <span className="text-lg font-bold tracking-tight tabular-nums text-violet-100">
                          {isNaN(myRank.compositeScore)
                            ? "-"
                            : myRank.compositeScore.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          / 100
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-violet-500/70 bg-slate-950/80 text-xs text-violet-100 hover:bg-violet-900/60"
                        onClick={handleScrollToMe}
                      >
                        내 위치로
                      </Button>
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-slate-600 bg-slate-900/80">
                  <Github className="h-5 w-5 text-slate-300" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-base text-slate-50">
                    내 순위
                  </CardTitle>
                  <p className="text-[11px] text-slate-400">
                    GitHub로 로그인하고 리뷰를 남기면 나의 순위를 확인할 수
                    있어요.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        {/* 메트릭 선택 버튼들 */}
        <CardContent className="border-t border-slate-800/80 pt-3">
          <div className="flex flex-wrap gap-2">
            {(
              Object.values(METRIC_CONFIG) as Array<
                (typeof METRIC_CONFIG)[MetricKey]
              >
            ).map(({ key, label }) => {
              const active = selectedMetrics.includes(key);
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => toggleMetric(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border text-xs transition-all duration-150 cursor-pointer",
                    active
                      ? "border-violet-500 bg-gradient-to-r from-violet-600 via-violet-500 to-violet-400 text-white shadow-sm shadow-violet-500/40 hover:shadow-md hover:shadow-violet-500/50 hover:brightness-110"
                      : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-violet-400 hover:bg-violet-500/10 hover:text-violet-100"
                  )}
                >
                  <span>{label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 랭킹 리스트 */}
      <Card className="border-violet-500/40 bg-slate-950/90 shadow-sm shadow-violet-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="text-slate-50">유저 랭킹</span>
            {hasData && (
              <span className="text-[11px] text-slate-400">
                총 {rankedUsers.length}명
              </span>
            )}
          </CardTitle>
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
              <span>{error}</span>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/60 text-red-200 hover:bg-red-900/40"
                onClick={() => window.location.reload()}
              >
                새로고침
              </Button>
            </div>
          ) : !rankedUsers.length ? (
            <div className="rounded-md border border-dashed border-slate-700 px-4 py-6 text-center text-xs text-slate-400">
              아직 랭킹 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-1.5 text-xs">
              {rankedUsers.map((u) => {
                const isMe =
                  isAuthenticated &&
                  ((user?.github_id && u.github_id === user.github_id) ||
                    (user?.login && u.login === user.login));

                const rowScore = isNaN(u.compositeScore)
                  ? "-"
                  : u.compositeScore.toFixed(1);

                const rankBadge =
                  u.rank === 1
                    ? "👑"
                    : u.rank === 2
                    ? "🥈"
                    : u.rank === 3
                    ? "🥉"
                    : null;

                return (
                  <div
                    key={u.id}
                    ref={isMe ? myRowRef : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-2 py-1.5 transition-colors",
                      isMe
                        ? "border-violet-500/80 bg-violet-950/80"
                        : "border-slate-800 bg-slate-950 hover:border-violet-500/40 hover:bg-slate-900"
                    )}
                  >
                    {/* 순위 */}
                    <div className="flex w-12 flex-col items-center justify-center">
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          u.rank <= 3 ? "text-yellow-300" : "text-slate-300"
                        )}
                      >
                        {u.rank}위
                      </span>
                      {rankBadge && (
                        <span className="text-[13px] leading-none">
                          {rankBadge}
                        </span>
                      )}
                    </div>

                    {/* 아바타 */}
                    <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-900">
                      {buildAvatarUrl(u) ? (
                        <img
                          src={buildAvatarUrl(u, 64)}
                          alt={u.login}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Github className="h-4 w-4 text-slate-400" />
                      )}
                    </div>

                    {/* 이름 */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[12px] text-slate-50">
                        {formatLogin(u)}
                      </span>
                      {/* 리뷰 개수 텍스트 제거 */}
                    </div>

                    {/* 점수 */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] text-slate-400">Score</span>
                      <span className="text-sm font-semibold tabular-nums text-slate-50">
                        {rowScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
