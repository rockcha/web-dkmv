// src/api/reviewStats.ts

import { api } from "./client";

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

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const datePreset = {
  thisWeek(): { from: string; to: string } {
    const now = new Date();
    const day = now.getDay() || 7;
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
// 실제 API 함수
// ─────────────────────────────

export async function fetchModelStats(
  params: ModelStatsQuery = {}
): Promise<ModelStatsApiItem[]> {
  const json = await api.get<ModelStatsApiResponse>(
    "/v1/reviews/stats/by-model",
    {
      query: {
        from: params.from ?? undefined,
        to: params.to ?? undefined,
      },
    }
  );

  return json.data ?? [];
}
