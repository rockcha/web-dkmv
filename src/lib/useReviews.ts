// src/features/reviews/useReviews.ts
"use client";

import * as React from "react";
import { fetchReviews } from "@/lib/reviewsApi";
import { useAuth } from "@/features/auth/AuthContext";

/* ===========================================================
   🔹 타입 정의 (여기서 공통으로 관리)
=========================================================== */

export type CategoryKey = "bug" | "maintainability" | "style" | "security";

export type ScoresByCategory = Record<CategoryKey, number>;

export type CommentsByCategory = Partial<Record<CategoryKey, string>> &
  Record<string, string>;

/** 리뷰 한 건 */
export type ReviewItem = {
  review_id: number;
  github_id: string | null;
  model: string;
  trigger: string | null;
  language: string | null;
  quality_score: number;
  summary: string;
  /** 카테고리별 점수 */
  scores_by_category: ScoresByCategory;
  /** 카테고리별 코멘트 */
  comments: CommentsByCategory;
  /** 리뷰 시각 (ISO 문자열) */
  audit: string;
  /** 🔹 원본 코드 (없을 수도 있으므로 optional) */
  code?: string | null;
};

export type ReviewListResponse = {
  meta: unknown;
  body: ReviewItem[];
};

type UseReviewsOptions = {
  /** 자동으로 load 할지 여부 (기본값: true) */
  autoLoad?: boolean;
};

/* ===========================================================
   🔹 순수 함수 버전 (훅 안 쓰고도 재사용 가능)
=========================================================== */

export async function getAllReviews(): Promise<ReviewItem[]> {
  const res = (await fetchReviews()) as ReviewListResponse;
  return Array.isArray(res.body) ? res.body : [];
}

export async function getMyReviews(
  githubId: string | null | undefined
): Promise<ReviewItem[]> {
  if (!githubId) return [];
  const all = await getAllReviews();
  return all.filter((r) => r.github_id === githubId);
}

/* ===========================================================
   🔹 훅 버전 (페이지/컴포넌트에서 쓰기 좋게)
=========================================================== */

export function useReviews(options: UseReviewsOptions = {}) {
  const { autoLoad = true } = options;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [allReviews, setAllReviews] = React.useState<ReviewItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = (await fetchReviews()) as ReviewListResponse;
      setAllReviews(Array.isArray(res.body) ? res.body : []);
    } catch (e: unknown) {
      // 🔹 any 대신 unknown 사용해서 eslint(no-explicit-any)도 해결
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!autoLoad) return;
    void load();
  }, [autoLoad, load]);

  const myGithubId = user?.github_id ?? null;

  const myReviews = React.useMemo(() => {
    if (!myGithubId) return [];
    return allReviews.filter((r) => r.github_id === myGithubId);
  }, [allReviews, myGithubId]);

  const isInitialLoading = authLoading || loading;

  return {
    /** 원본 전체 리뷰 */
    allReviews,
    /** 내 github_id 기준으로 필터링 된 리뷰 */
    myReviews,
    /** 로딩/에러 상태 */
    loading,
    error,
    /** auth 상태도 같이 리턴 */
    user,
    isAuthenticated,
    authLoading,
    isInitialLoading,
    /** 다시 불러오기 */
    reload: load,
  };
}
