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
  github_id?: string; // ✅ /v1/users/me 에서 내려오는 GitHub numeric ID
  login: string;
  name?: string | null;
  avatar_url?: string | null;
  created_at?: string;

  // ✅ /api/v1/users/me 에서 내려오는 원본 코드 저장 여부 (optional)
  store_code?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;

  // ✅ Settings 페이지에서 store_code 바꿀 때 /me 캐시 업데이트용
  setUserStoreCode: (value: boolean) => void;
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
        clearToken();
        setUser(null);
        return null;
      }

      if (!res.ok) {
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
      await fetchMe();
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
    return me;
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await logoutGithub();
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  // ✅ store_code만 부분적으로 업데이트할 때 사용
  const setUserStoreCode = useCallback((value: boolean) => {
    setUser((prev) => (prev ? { ...prev, store_code: value } : prev));
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    refresh,
    logout,
    setUserStoreCode,
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
