// src/lib/reviewsApi.ts

// 🔹 백엔드 BASE URL
//   - 로컬: 없으면 getOrigin() 사용 (지금처럼 3000에서 프록시 쓸 때)
//   - Vercel: VITE_REVIEW_API_BASE_URL 에 예: "http://18.205.229.159:8000"
const API_BASE = import.meta.env.VITE_REVIEW_API_BASE_URL ?? getOrigin();

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
  const url = new URL("/v1/reviews", API_BASE);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    // credentials: "include", // 쿠키 쓰면 주석 해제
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`GET /v1/reviews -> ${res.status}: ${text.slice(0, 120)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    // 🔥 여기서 지금 뜨던 "<!DOCTYPE ..." 같은 경우를 잡아줌
    throw new Error(
      `GET /v1/reviews 응답이 JSON이 아닙니다. preview: ${text
        .slice(0, 120)
        .replace(/\s+/g, " ")}`
    );
  }
}

/**
 * 단일 코드 리뷰 실행
 * POST /api/v1/review
 * ➜ Playground / 디버그 용
 */
export async function createReviewRaw(payload: unknown) {
  const url = new URL("/api/v1/review", API_BASE);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    // credentials: "include",
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(
      `POST /api/v1/review -> ${res.status}: ${text.slice(0, 120)}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `POST /api/v1/review 응답이 JSON이 아닙니다. preview: ${text
        .slice(0, 120)
        .replace(/\s+/g, " ")}`
    );
  }
}
