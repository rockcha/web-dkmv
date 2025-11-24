// src/features/auth/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { logoutGithub } from "./authApi";
import { getToken, clearToken } from "./token";

export type AuthUser = {
  id: number;
  github_id?: string; // ✅ 추가: 백엔드 /v1/users 응답에 맞춤
  login: string;
  name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch("/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        clearToken();
        setUser(null);
        return;
      }

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = (await res.json()) as AuthUser;
      setUser(data);
    } catch (e) {
      console.error("현재 로그인 정보 확인 실패", e);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      setIsLoading(true);
      await fetchMe();
      if (!isCancelled) {
        setIsLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [fetchMe]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchMe();
    setIsLoading(false);
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await logoutGithub();
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
