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
  github_id?: string; // ✅ 백엔드 /v1/users 응답에 맞춤
  login: string;
  name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refresh: () => Promise<AuthUser | null>; // ✅ 유저 또는 null 반환
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ /api/v1/users/me 호출해서 유저 정보 가져오기
  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const res = await fetch("/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // 토큰 만료 or 잘못된 토큰
        clearToken();
        setUser(null);
        return null;
      }

      if (!res.ok) {
        // 그 외 에러들도 전부 로그인 안 된 상태로 간주
        setUser(null);
        return null;
      }

      const data = (await res.json()) as AuthUser;
      setUser(data);
      return data;
    } catch (e) {
      console.error("현재 로그인 정보 확인 실패", e);
      setUser(null);
      return null;
    }
  }, []);

  // 앱 첫 로드 시 내 정보 확인
  useEffect(() => {
    let isCancelled = false;

    (async () => {
      setIsLoading(true);
      await fetchMe(); // ← 변수 없이 그냥 await만
      if (!isCancelled) {
        setIsLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [fetchMe]);

  // ✅ 외부에서 강제로 내 정보 새로고침할 때 사용
  const refresh = useCallback(async () => {
    setIsLoading(true);
    const me = await fetchMe();
    setIsLoading(false);
    return me; // 성공 시 AuthUser, 실패 시 null
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
