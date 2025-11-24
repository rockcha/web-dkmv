// src/pages/Signup.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, UserPlus } from "lucide-react";
import { startGithubLoginPopup } from "@/features/auth/authApi";
import { useAuth } from "@/features/auth/AuthContext";

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
        // AuthContext가 localStorage에 저장된 토큰으로 /me 다시 호출
        await refresh();
        navigate("/landing", { replace: true });
      } catch (err) {
        console.error("GitHub 연동 이후 상태 갱신 실패", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refresh, navigate]);

  const handleGithubConnect = () => {
    if (isLoading) return;
    startGithubLoginPopup("signup");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e_0,_#020617_55%,_#000_100%)] opacity-90" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-950/80 backdrop-blur">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <UserPlus className="h-4 w-4 text-emerald-300" />
            </span>
            <span>DKMV 계정 생성</span>
          </CardTitle>
          <p className="text-sm text-slate-400">
            DKMV 계정을 생성한 뒤 GitHub 계정을 연동하면,
            <br />
            코드 분석 결과를 안전하게 저장하고 조회할 수 있어요.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* TODO: 여기에 닉네임/이메일 같은 추가 입력 폼 넣을 수 있음 */}

          <Button
            type="button"
            className="w-full bg-emerald-600 hover:bg-emerald-500"
            onClick={handleGithubConnect}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub 계정 연동하기
          </Button>

          <p className="text-xs leading-relaxed text-slate-500 text-center">
            버튼을 누르면 GitHub 인증 팝업이 열립니다.
            <br />
            연동이 완료되면 이 창은 자동으로 /landing 으로 이동합니다.
          </p>

          <div className="mt-4 flex justify-between text-xs text-slate-500">
            <button
              type="button"
              className="underline-offset-2 hover:underline"
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
