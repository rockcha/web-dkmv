// src/api/userStats.ts
import { api } from "@/api/client";

export type UserStatsApiItem = {
  user_id: number;
  github_id: string | null;
  review_count: number;
  avg_total: number | null;
  avg_bug: number | null;
  avg_maintainability: number | null;
  avg_style: number | null;
  avg_security: number | null;
};

export type UserStatsApiResponse = {
  data: UserStatsApiItem[];
};

export async function fetchUserStats(): Promise<UserStatsApiItem[]> {
  const json = await api.get<UserStatsApiResponse>("/v1/reviews/stats/by-user");

  return json.data ?? [];
}
