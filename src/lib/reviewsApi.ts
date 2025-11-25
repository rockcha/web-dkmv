// src/lib/reviewsApi.ts

// ===== 경로 상수 =====

// 1) 목록용: 구 DB 라우터 (GET /v1/reviews?limit=...)
const LIST_BASE = "/v1";
const LIST_PATH = "/reviews";

// 2) 단일 리뷰 실행용: 새 review-api (POST /api/v1/review)
const REVIEW_API_BASE = "/api";
const REVIEW_API_PATH = "/v1/review";

// 공통: 브라우저/SSR 양쪽에서 base URL 계산
function getOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

/**
 * 리뷰 목록 조회
 * GET /v1/reviews?limit=...
 * ➜ Analyses 페이지에서 사용
 */
export async function fetchReviews(limit = 50) {
  const base = getOrigin();
  const url = new URL(`${LIST_BASE}${LIST_PATH}`, base);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    method: "GET",
    // 🔓 목록은 인증 없이도 열어둘거면 헤더 없음
    // credentials: "include", // 쿠키 인증 쓰면 주석 해제
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`GET ${LIST_PATH} -> ${res.status}: ${t}`);
  }

  return res.json();
}

/**
 * 단일 코드 리뷰 실행
 * POST /api/v1/review
 * ➜ 필요하면 Playground 나 디버그 용도에서 사용
 */
export async function createReviewRaw(payload: unknown) {
  const base = getOrigin();
  const url = new URL(`${REVIEW_API_BASE}${REVIEW_API_PATH}`, base);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization 필요하면 여기서 붙이면 됨
      // ...authHeader(),
    },
    body: JSON.stringify(payload),
    // credentials: "include",
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`POST ${REVIEW_API_PATH} -> ${res.status}: ${t}`);
  }

  return res.json();
}
