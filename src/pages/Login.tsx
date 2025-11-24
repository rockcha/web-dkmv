// src/pages/Login.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, LogIn } from "lucide-react";
import { startGithubLogin } from "@/features/auth/authApi";
import { useAuth } from "@/features/auth/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // 이미 로그인돼 있으면 /landing으로
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/landing", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleGithubStart = () => {
    if (isLoading) return;
    // ✅ 로그인 전용 state
    startGithubLogin("web-login");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#020617_55%,_#000_100%)] opacity-90" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-950/80 backdrop-blur">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20">
              <LogIn className="h-4 w-4 text-violet-300" />
            </span>
            <span>DKMV 로그인</span>
          </CardTitle>
          <p className="text-sm text-slate-400">
            DKMV는 GitHub 계정과 연동해서만 로그인할 수 있어요.
            <br />
            아래 버튼을 눌러 GitHub 인증을 진행해주세요.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            type="button"
            className="w-full bg-violet-600 hover:bg-violet-500"
            onClick={handleGithubStart}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub로 시작하기
          </Button>

          <p className="text-xs leading-relaxed text-slate-500">
            계정이 없다면 아래에서 먼저 DKMV 계정을 생성하고,
            <br />
            이후 GitHub 계정을 연동할 수 있어요.
          </p>

          <div className="mt-4 flex justify-between text-xs text-slate-500">
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => navigate("/")}
            >
              홈으로 돌아가기
            </button>
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => navigate("/signup")}
            >
              계정 생성하기
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
