// src/pages/Signup.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Github } from "lucide-react";
import { startGithubLoginPopup } from "@/features/auth/authApi";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, refresh } = useAuth();

  // ✅ 순차 등장 애니메이션용
  const [mounted, setMounted] = useState(false);

  // 이미 로그인 돼 있으면 바로 /landing
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

  // 팝업에서 postMessage로 보내주는 oauth:success 처리
  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "oauth:success") return;

      try {
        await refresh();
        toast.success("GitHub 계정이 연동되었습니다.", {
          description: "DKMV 계정 생성이 완료되었습니다.",
        });
        navigate("/landing", { replace: true });
      } catch (err) {
        console.error("GitHub 연동 이후 상태 갱신 실패", err);
        toast.error("연동 상태를 불러오지 못했습니다.", {
          description: "잠시 후 다시 시도해주세요.",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refresh, navigate]);

  const handleGithubConnect = () => {
    if (isLoading) return;

    const popup = startGithubLoginPopup("signup");

    if (!popup || popup.closed) {
      toast.error("팝업을 열 수 없습니다.", {
        description: "브라우저 팝업 차단 설정을 확인해주세요.",
      });
      return;
    }

    toast("GitHub 인증을 진행합니다.", {
      description: "열린 팝업에서 GitHub 로그인을 완료해주세요.",
    });
  };

  const isBusy = isLoading;

  return (
    <main
      className="
        relative
    mt-6
        flex items-center justify-center
        px-4 sm:px-6 lg:px-8
        bg-slate-50 text-slate-900
        dark:bg-slate-950 dark:text-slate-50
      "
    >
      {/* 라이트/다크 공통 그라디언트 (회원가입은 초록톤 포인트) */}
      <div
        className="
          pointer-events-none
          absolute inset-0 -z-10 opacity-90
          bg-[radial-gradient(circle_at_top,_#6ee7b7_0,_#f8fafc_55%,_#e2e8f0_100%)]
          dark:bg-[radial-gradient(circle_at_top,_#22c55e_0,_#020617_55%,_#000_100%)]
        "
      />

      {/* ✅ 1단계: 카드 전체가 먼저 부드럽게 */}
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
        {/* ✅ 2단계: 헤더 살짝 늦게 */}
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
            {/* 로고 + 브랜드 영역 (로그인과 동일 구도) */}
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
                rounded-full
                px-3.5 py-1.5 text-[11px] font-medium
                text-emerald-700 dark:text-emerald-200
                bg-emerald-50/80 dark:bg-emerald-900/40
                border border-emerald-200/60 dark:border-emerald-800/70
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>GitHub 계정으로 DKMV 시작하기</span>
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
                  alt="DKMV Signup Illustration"
                  className="w-full mr-8 max-w-xs aspect-square object-contain"
                />
              </div>
            </section>

            {/* ✅ 4단계: 오른쪽 폼 영역 */}
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
                  계정 생성
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  GitHub 계정을 연동해 DKMV를 시작해보세요.
                </p>
              </header>

              <div
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
              >
                {/* 메인 GitHub 계정 생성 버튼 */}
                <Button
                  type="button"
                  className="
                    group
                    w-full
                    h-12 sm:h-[52px]
                    cursor-pointer
                    rounded-lg
                    bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500
                    hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400
                    text-sm sm:text-base font-semibold
                    text-white
                    shadow-md hover:shadow-xl
                    transition-transform transition-shadow duration-200
                    hover:-translate-y-0.5 hover:scale-[1.02]
                    active:translate-y-[1px] active:scale-[0.99]
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                  onClick={handleGithubConnect}
                  disabled={isBusy}
                >
                  <Github className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  {isBusy ? "GitHub 연동 중..." : "GitHub로 계정 만들기"}
                </Button>
              </div>

              {/* ✅ 5단계: 하단 버튼들 제일 마지막 */}
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
                    text-emerald-600 dark:text-emerald-300
                    bg-transparent
                    hover:bg-emerald-50 dark:hover:bg-emerald-950/40
                    font-medium
                    transition-colors transition-transform duration-150
                    hover:-translate-y-0.5 hover:shadow-sm
                    active:translate-y-[1px]
                  "
                  onClick={() => navigate("/login")}
                >
                  이미 계정이 있으신가요? 로그인
                </Button>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
