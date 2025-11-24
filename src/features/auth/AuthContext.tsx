// src/features/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { logoutGithub } from "./authApi";

export type AuthUser = {
  id: number;
  login: string;
  name?: string | null;
  avatar_url?: string | null;
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

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });

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
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchMe();
      setIsLoading(false);
    })();
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    await fetchMe();
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await logoutGithub();
    } finally {
      setUser(null);
    }
  };

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
