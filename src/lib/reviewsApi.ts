// src/lib/reviewsApi.ts

// 프론트 origin 기준 (Vercel: https://web-dkmv.vercel.app)
const API_BASE = getOrigin();

function getOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export async function fetchReviews(limit = 50) {
  const url = new URL("/v1/reviews", API_BASE); // ✅ 이제 이게 vercel rewrite 타고 백엔드로 감
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`GET /v1/reviews -> ${res.status}: ${text.slice(0, 120)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `GET /v1/reviews 응답이 JSON이 아닙니다. preview: ${text
        .slice(0, 120)
        .replace(/\s+/g, " ")}`
    );
  }
}

export async function createReviewRaw(payload: unknown) {
  const url = new URL("/api/v1/review", API_BASE); // ✅ 이건 /api rewrite 타서 백엔드로

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
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
