// src/pages/Signup.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";
import { startGithubLoginPopup } from "@/features/auth/authApi";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, refresh } = useAuth();

  // 이미 로그인 돼 있으면 바로 /landing
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/landing", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

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

  return (
    <main
      className="
        min-h-screen
        flex items-center justify-center px-4
        bg-slate-50 text-slate-900
        dark:bg-slate-950 dark:text-slate-50
      "
    >
      {/* 라이트/다크 공통 그라디언트 (로그인 페이지와 톤만 다름, 초록 포인트) */}
      <div
        className="
          absolute inset-0 -z-10 opacity-90
          bg-[radial-gradient(circle_at_top,_#6ee7b7_0,_#f8fafc_55%,_#e2e8f0_100%)]
          dark:bg-[radial-gradient(circle_at_top,_#22c55e_0,_#020617_55%,_#000_100%)]
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
          <CardTitle className="text-2xl font-semibold">계정 생성</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            type="button"
            className="
              w-full cursor-pointer
              bg-emerald-600 hover:bg-emerald-500
            "
            onClick={handleGithubConnect}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub로 계정 만들기
          </Button>

          <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
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
              onClick={() => navigate("/login")}
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
