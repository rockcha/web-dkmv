// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";
import { mintDebugTokenByUserId } from "@/features/auth/authApi";
import { setToken } from "@/features/auth/token";
import type { AuthUser } from "@/features/auth/AuthContext";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, refresh } = useAuth();

  const [githubLogin, setGithubLogin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 로그인돼 있으면 /landing으로
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/landing", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubLogin.trim() || isLoading || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/users");
      if (!res.ok) {
        throw new Error("유저 목록 조회 실패");
      }

      const users = (await res.json()) as AuthUser[];

      const matched = users.find(
        (u) => u.login.toLowerCase() === githubLogin.trim().toLowerCase()
      );

      if (!matched) {
        const msg = "등록되지 않은 GitHub 아이디입니다.";
        setError(msg);
        toast.error(msg, {
          description: "DKMV에 등록된 GitHub 계정인지 다시 확인해주세요.",
        });
        return;
      }

      const token = await mintDebugTokenByUserId(matched.id);

      setToken(token);
      await refresh();

      toast.success("로그인되었습니다.", {
        description: `${matched.login} 님, 환영합니다.`,
      });
      navigate("/landing", { replace: true });
    } catch (err) {
      console.error(err);
      const msg =
        "로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setError(msg);
      toast.error("로그인 중 오류가 발생했습니다.", {
        description: "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isLoading || isSubmitting;
  const hasError = !!error;

  return (
    <main
      className="
        min-h-screen
        flex items-center justify-center px-4
        bg-slate-50 text-slate-900
        dark:bg-slate-950 dark:text-slate-50
      "
    >
      {/* 라이트/다크 공통 그라디언트 (라이트/다크 색만 다르게) */}
      <div
        className="
          absolute inset-0 -z-10 opacity-90
          bg-[radial-gradient(circle_at_top,_#c4b5fd_0,_#f8fafc_55%,_#e2e8f0_100%)]
          dark:bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#020617_55%,_#000_100%)]
        "
      />

      <Card
        className="
          w-full max-w-md
          border-slate-200 bg-white/80
          dark:border-slate-800 dark:bg-slate-950/80
          backdrop-blur
        "
      >
        <CardHeader className="space-y-4 text-center">
          {/* 로고 + 브랜드명 */}
          <div className="flex flex-col items-center gap-2">
            <img
              src="/logo.png"
              alt="DKMV"
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-contain"
            />
            <span className="text-[11px] tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
              Don&apos;t Kill My Vibe
            </span>
          </div>
          {/* 페이지 타이틀 */}
          <CardTitle className="text-2xl font-semibold">로그인</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                GitHub 아이디
              </label>
              <input
                type="text"
                value={githubLogin}
                onChange={(e) => {
                  setGithubLogin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="아이디를 입력하세요."
                className={[
                  "w-full rounded-md px-3 py-2 text-sm",
                  "bg-slate-50 text-slate-900 placeholder:text-slate-400",
                  "border focus:outline-none",
                  "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
                  hasError
                    ? "border-red-500/70 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:border-slate-700",
                ].join(" ")}
                aria-invalid={hasError}
              />
              {hasError && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 cursor-pointer"
              disabled={isBusy || !githubLogin.trim()}
            >
              <Github className="mr-2 h-4 w-4" />
              {isBusy ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-4 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              className="underline-offset-2 hover:underline cursor-pointer"
              onClick={() => navigate("/")}
            >
              홈으로 돌아가기
            </button>
            <button
              type="button"
              className="underline-offset-2 hover:underline cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              계정 생성
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
