// src/lib/reviewsApi.ts
// ↕ 필요 시 경로만 바꾸면 됨
const LIST_PATH = "/v1/reviews"; // GET 목록
const CREATE_PATH = "/v1/reviews/request"; // POST 생성(요청)

// 조회: limit 쿼리 지원
export async function fetchReviews(limit = 20) {
  const url = new URL(`/api${LIST_PATH}`, location.origin);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`GET ${LIST_PATH} failed: ${res.status}`);
  return res.json() as Promise<any[]>;
}

// 단건 조회: 필요하면 사용
export async function fetchReviewById(reviewId: number | string) {
  const res = await fetch(`/api${LIST_PATH}/${reviewId}`, { method: "GET" });
  if (!res.ok)
    throw new Error(`GET ${LIST_PATH}/${reviewId} failed: ${res.status}`);
  return res.json();
}

// 생성: 백엔드 스키마에 맞는 raw JSON 그대로 보냄
export async function createReviewRaw(payload: unknown) {
  const res = await fetch(`/api${CREATE_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${CREATE_PATH} failed: ${res.status} ${text}`);
  }
  return res.json();
}
