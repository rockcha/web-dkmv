// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  // ✅ 순차 등장 애니메이션용
  const [mounted, setMounted] = useState(false);

  // 이미 로그인돼 있으면 /landing으로
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/landing", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // ✅ 페이지 진입 시 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

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
        relative
      m-12
        flex items-center justify-center
        px-4 sm:px-6 lg:px-8
        bg-slate-50 text-slate-900
        dark:bg-slate-950 dark:text-slate-50
      "
    >
      {/* 라이트/다크 공통 그라디언트 배경 */}
      <div
        className="
          pointer-events-none
          absolute inset-0 -z-10 opacity-90
          bg-[radial-gradient(circle_at_top,_#c4b5fd_0,_#f8fafc_55%,_#e2e8f0_100%)]
          dark:bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#020617_55%,_#000_100%)]
        "
      />

      {/* ✅ 1단계: 카드 전체 먼저 */}
      <Card
        className={`
          w-full
          max-w-5xl
          border-slate-200 bg-white/80
          dark:border-slate-800 dark:bg-slate-950/80
          backdrop-blur-xl
          shadow-2xl
          rounded-2xl
          transform
          transition-all duration-500 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
        style={{
          transitionDelay: mounted ? "0ms" : "0ms",
        }}
      >
        {/* ✅ 2단계: 헤더 */}
        <CardHeader
          className={`
            border-b border-slate-200/70 dark:border-slate-800/70
            pb-4 sm:pb-5
            transition-all duration-500 ease-out
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
          `}
          style={{
            transitionDelay: mounted ? "90ms" : "0ms",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            {/* 로고 + 브랜드 영역 */}
            <div className="flex items-center gap-4">
              <div
                className="
                  relative
                  flex items-center justify-center
                  h-16 w-16
                  rounded-2xl
                  overflow-hidden
                  transition-transform duration-300
                  hover:-translate-y-0.5 hover:rotate-3 hover:scale-105
                "
              >
                <img
                  src="/logo.png"
                  alt="DKMV"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400">
                  DKMV
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Don&apos;t Kill My Vibe
                </span>
              </div>
            </div>

            {/* 작은 뱃지 */}
            <div
              className="
                hidden sm:inline-flex items-center gap-1
                px-3.5 py-1.5 text-[11px] font-medium
                text-violet-700 dark:text-violet-200
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span>VS Code Extension · Dashboard</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 lg:px-10 lg:py-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-stretch">
            {/* ✅ 3단계: 왼쪽 일러스트 영역 */}
            <section
              className={`
                hidden lg:flex
                flex-col justify-center space-y-4
                pr-8
                border-r border-slate-200/70 dark:border-slate-800/70
                transition-all duration-500 ease-out
                ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }
              `}
              style={{
                transitionDelay: mounted ? "160ms" : "0ms",
              }}
            >
              <div className="flex justify-center">
                <img
                  src="/images/login_image.png"
                  alt="DKMV 로그인 일러스트"
                  className="w-full mr-8 max-w-xs aspect-square object-contain transform -scale-x-100"
                />
              </div>
            </section>

            {/* ✅ 4단계: 오른쪽 로그인 영역 */}
            <section
              className={`
                flex flex-col justify-center space-y-6 lg:pl-6
                transition-all duration-500 ease-out
                ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }
              `}
              style={{
                transitionDelay: mounted ? "220ms" : "0ms",
              }}
            >
              <header className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  로그인
                </h1>
              </header>

              {/* ✅ 5단계: 폼 요소 */}
              <form
                className={`
                  space-y-4
                  transition-all duration-500 ease-out
                  ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }
                `}
                style={{
                  transitionDelay: mounted ? "260ms" : "0ms",
                }}
                onSubmit={handleSubmit}
              >
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
                    placeholder="Github 계정 아이디를 입력해주세요.. "
                    className={[
                      "w-full rounded-lg px-3.5 py-3 text-sm sm:text-base",
                      "bg-slate-50 text-slate-900 placeholder:text-slate-400",
                      "border focus:outline-none",
                      "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
                      hasError
                        ? "border-red-500/70 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:border-slate-700",
                    ].join(" ")}
                    aria-invalid={hasError}
                  />
                  {hasError && (
                    <p className="mt-1 text-xs text-red-500">{error}</p>
                  )}
                </div>

                {/* 메인 로그인 버튼 */}
                <Button
                  type="submit"
                  className="
                    group
                    w-full
                    h-12 sm:h-[52px]
                    cursor-pointer
                    rounded-lg
                    bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500
                    hover:from-violet-500 hover:via-violet-400 hover:to-indigo-400
                    text-sm sm:text-base font-semibold
                    text-white
                    shadow-md hover:shadow-xl
                    transition-transform transition-shadow duration-200
                    hover:-translate-y-0.5 hover:scale-[1.02]
                    active:translate-y-[1px] active:scale-[0.99]
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                  disabled={isBusy || !githubLogin.trim()}
                >
                  <Github className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  {isBusy ? "로그인 중..." : "GitHub 아이디로 로그인"}
                </Button>
              </form>

              {/* ✅ 6단계: 하단 버튼들 마지막 */}
              <div
                className={`
                  mt-3 flex flex-col sm:flex-row sm:justify-between
                  gap-2 text-xs sm:text-sm
                  transition-all duration-500 ease-out
                  ${
                    mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }
                `}
                style={{
                  transitionDelay: mounted ? "320ms" : "0ms",
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="
                    w-full sm:w-auto
                    cursor-pointer
                    px-4 py-2.5
                    text-slate-800 dark:text-slate-100
                    bg-white/90 dark:bg-slate-900/90
                    hover:bg-slate-100 dark:hover:bg-slate-800
                    transition-colors transition-transform duration-150
                    hover:-translate-y-0.5
                    active:translate-y-[1px]
                  "
                  onClick={() => navigate("/landing")}
                >
                  홈으로
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="
                    w-full sm:w-auto
                    cursor-pointer
                    px-4 py-2.5
                    text-violet-600 dark:text-violet-300
                    bg-transparent
                    hover:bg-violet-50 dark:hover:bg-violet-950/40
                    font-medium
                    transition-colors transition-transform duration-150
                    hover:-translate-y-0.5 hover:shadow-sm
                    active:translate-y-[1px]
                  "
                  onClick={() => navigate("/signup")}
                >
                  처음이신가요?
                </Button>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
