// src/lib/reviewsApi.ts

export type ReviewItem = {
  review_id: number;
  global_score: number;
  model_score: number;
  efficiency_index?: number;
  summary?: string;
  trigger?: string;
  status?: string;
  created_at?: string;
};

export async function fetchReviews(
  page = 1,
  token?: string
): Promise<ReviewItem[]> {
  const payload = {
    meta: {
      version: "v1" as const,
      ts: new Date().toISOString(), // Swagger: ts
      correlation_id: `web-${Math.random().toString(36).slice(2)}`,
      actor: "web-dashboard",
    },
    request: {
      user_id: 0,
      filters: {
        // language: "python", // 필요하면 여기
      },
      page,
    },
  };

  const res = await fetch("/api/v1/reviews", {
    method: "POST", // 👈 브라우저에는 POST
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => "");

  console.log("[fetchReviews] status:", res.status);
  console.log("[fetchReviews] body:", text);

  if (!res.ok) {
    throw new Error(`fetchReviews failed: ${res.status} ${text}`);
  }

  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error(
      `fetchReviews: JSON parse error: ${(e as Error).message}\nraw=${text}`
    );
  }

  // Swagger 응답 예시: { meta: {...}, response: { items: [...] } }
  const items = data?.response?.items;
  if (!Array.isArray(items)) {
    console.warn("[fetchReviews] unexpected response shape", data);
    return [];
  }
  return items;
}
