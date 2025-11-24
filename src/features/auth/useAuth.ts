// src/features/auth/useAuth.ts
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";

export type AuthUser = {
  id: string;
  name: string;
  avatar_url?: string | null;
};

type UseAuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function useAuth(): UseAuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      try {
        // ★ 여기 엔드포인트는 실제 백엔드에 맞게 수정해줘
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const data = (await res.json()) as AuthUser;
        if (!cancelled) {
          setUser(data);
        }
      } catch (e) {
        console.error("현재 로그인 정보 확인 실패", e);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchMe();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}
