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
  const qs = new URLSearchParams({ page: String(page) }).toString();
  const url = `/api/reviews?${qs}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

  const items = data?.response?.items;
  if (!Array.isArray(items)) {
    console.warn("[fetchReviews] unexpected response shape", data);
    return [];
  }
  return items;
}
