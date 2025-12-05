// src/api/users.ts
import { api } from "@/api/client";

export type RawUser = {
  id: number;
  github_id: string | null;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

export async function fetchUsers(): Promise<RawUser[]> {
  // Swagger 기준: 응답이 그냥 배열
  const json = await api.get<RawUser[]>("/v1/users");
  return json ?? [];
}
