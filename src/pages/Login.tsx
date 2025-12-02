// src/pages/Login.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Github, Loader2 } from "lucide-react";
import {
  startGithubLogin,
  startGithubLoginPopup,
} from "@/features/auth/authApi";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refresh } = useAuth();

  // ✅ extension 플로우인지 여부 (예: /login?from=extension)
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get("from");
  const isExtensionFlow = from === "extension";

  // ✅ 순차 등장 애니메이션용
  const [mounted, setMounted] = useState(false);

  // ✅ 현재 어떤 인증 액션 중인지
  const [authAction, setAuthAction] = useState<"idle" | "login" | "connect">(
    "idle"
  );
  const isActionLoading = authAction !== "idle" || isLoading;

  // ✅ oauth:success 한 번만 처리 (React StrictMode 이펙트 2번 방지)
  const handledRef = useRef(false);

  // 이미 로그인돼 있으면 /landing으로
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/landing", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // 페이지 진입 시 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  // 🎯 실제 GitHub OAuth 로그인 (전체 페이지 리다이렉트)
  const handleGithubLogin = () => {
    if (isActionLoading) return;

    const state = isExtensionFlow ? "extension" : "web";
    setAuthAction("login");
    startGithubLogin(state); // 여기서 전체 페이지 리다이렉트
  };

  // 🎯 "처음이신가요? 계정 연동하기" → signup 팝업 플로우 실행 (웹에서만 사용)
  const handleGithubConnect = () => {
    if (isActionLoading) return;

    setAuthAction("connect");
    const popup = startGithubLoginPopup("signup");

    if (!popup || popup.closed) {
      setAuthAction("idle");
      toast.error("팝업을 열 수 없습니다.", {
        description: "브라우저 팝업 차단 설정을 확인해주세요.",
      });
      return;
    }

    toast("GitHub 인증을 진행합니다.", {
      description: "열린 팝업에서 GitHub 로그인을 완료해주세요.",
    });
  };

  // 팝업에서 postMessage로 보내주는 oauth:success 처리 (웹 signup 플로우)
  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "oauth:success") return;

      // ✅ 이미 처리했다면 무시 (StrictMode 대응)
      if (handledRef.current) return;
      handledRef.current = true;

      const status = (e.data as { status?: string }).status ?? "new";

      try {
        await refresh();

        if (status === "existing") {
          toast.info("이미 연동된 GitHub 계정입니다.", {
            description: "해당 계정으로 자동 로그인되었어요.",
          });
        } else {
          toast.success("GitHub 계정이 연동되었습니다.", {
            description: "DKMV 계정 생성 후 자동 로그인되었어요.",
          });
        }

        setAuthAction("idle");
        navigate("/landing", { replace: true });
      } catch (err) {
        console.error("GitHub 연동 이후 상태 갱신 실패", err);
        setAuthAction("idle");
        toast.error("연동 상태를 불러오지 못했습니다.", {
          description: "잠시 후 다시 시도해주세요.",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refresh, navigate]);

  return (
    <main
      className="
        relative
        m-12
        flex items-center justify-center
        px-4 sm:px-6 lg:px-8
        text-slate-900
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

      {/* 카드 */}
      <Card
        className={` 
          w-full
          max-w-5xl
          border-none shadow-none
          bg-white/80
          dark:bg-slate-950/80
          backdrop-blur-xl
          rounded-2xl
          transform
          transition-all duration-500 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
        style={{
          transitionDelay: mounted ? "0ms" : "0ms",
        }}
      >
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
              ></div>
              <div className="flex flex-col gap-1">
                <span className="text-xs tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400">
                  DKMV
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Don&apos;t Kill My Vibe
                </span>
                {isExtensionFlow && (
                  <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    VS Code 확장에서 DKMV 리뷰를 사용하기 위해 GitHub로
                    로그인합니다.
                  </span>
                )}
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
            {/* 왼쪽 일러스트 영역 */}
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
                  className="w-full mr-8 max-w-xs aspect-square object-contain "
                />
              </div>
            </section>

            {/* 오른쪽 로그인 영역 */}
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

              {/* 🎯 실제 GitHub OAuth 로그인 버튼 */}
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
                <Button
                  type="button"
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
                  onClick={handleGithubLogin}
                  disabled={isActionLoading}
                >
                  {authAction === "login" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      GitHub로 로그인 중...
                    </>
                  ) : (
                    <>
                      <Github className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                      GitHub로 로그인하기
                    </>
                  )}
                </Button>
              </div>

              {/* 하단 보조 버튼들 */}
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
                  disabled={isActionLoading}
                >
                  홈으로
                </Button>

                {/* 🔁 Signup의 연동하기 버튼 역할 (웹에서만 노출) */}
                {!isExtensionFlow && (
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
                    onClick={handleGithubConnect}
                    disabled={isActionLoading}
                  >
                    {authAction === "connect" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        GitHub 계정 연동 중...
                      </>
                    ) : (
                      "처음이신가요? 계정 연동하기"
                    )}
                  </Button>
                )}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
