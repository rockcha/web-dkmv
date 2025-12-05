// src/api/reviewStats.ts

// ─────────────────────────────
// 타입 정의
// ─────────────────────────────

export type ModelStatsApiItem = {
  model: string | null;
  review_count: number;
  avg_total: number | null;
  avg_bug: number | null;
  avg_maintainability: number | null;
  avg_style: number | null;
  avg_security: number | null;
};

export type ModelStatsApiResponse = {
  data: ModelStatsApiItem[];
};

export type ModelStatsQuery = {
  from?: string | null;
  to?: string | null;
};

// ─────────────────────────────
// 날짜 유틸 & 프리셋
// ─────────────────────────────

/**
 * 날짜를 YYYY-MM-DD 형태로 포맷
 */
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 기간 프리셋
 * - 이번주 / 이번달 / 이번년도
 */
export const datePreset = {
  thisWeek(): { from: string; to: string } {
    const now = new Date();
    const day = now.getDay() || 7; // 일요일(0)을 7로
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: toDateStr(monday), to: toDateStr(sunday) };
  },
  thisMonth(): { from: string; to: string } {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toDateStr(first), to: toDateStr(last) };
  },
  thisYear(): { from: string; to: string } {
    const now = new Date();
    const first = new Date(now.getFullYear(), 0, 1);
    const last = new Date(now.getFullYear(), 11, 31);
    return { from: toDateStr(first), to: toDateStr(last) };
  },
};

// ─────────────────────────────
// API Base 설정
// ─────────────────────────────

/**
 * API base 결정 로직
 *
 * - 로컬(dev): 기본값 "/api" 사용 → Vite proxy를 통해
 *   http://18.205.229.159:8000/v1/... 으로 전달됨.
 * - 배포(prod): VITE_API_BASE_URL 이 있으면 그 값을 사용.
 *   (ex. "https://web-dkmv.vercel.app/api" 또는 "https://api.dkmv.app")
 */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

// 기본은 "/api" 로 두고, env가 있으면 그걸 사용
const API_BASE = (RAW_BASE && RAW_BASE.replace(/\/+$/, "")) || "/api";

// ─────────────────────────────
// API 함수
// ─────────────────────────────

export async function fetchModelStats(
  params: ModelStatsQuery = {}
): Promise<ModelStatsApiItem[]> {
  const search = new URLSearchParams();

  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);

  const qs = search.toString();
  const url = API_BASE + "/v1/reviews/stats/by-model" + (qs ? `?${qs}` : "");

  // 디버깅용 로그
  console.log("[fetchModelStats] url:", url);

  const res = await fetch(url, {
    credentials: "include", // 쿠키 기반 인증이면 유지, 아니면 빼도 됨
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`모델 통계 불러오기 실패: ${res.status}`);
  }

  const json = (await res.json()) as ModelStatsApiResponse;
  return json.data ?? [];
}
