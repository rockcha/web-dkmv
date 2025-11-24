// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, LogIn } from "lucide-react";
import { mintDebugTokenByUserId } from "@/features/auth/authApi";

import { setToken } from "@/features/auth/token";
import type { AuthUser } from "@/features/auth/AuthContext";
import { useAuth } from "@/features/auth/AuthContext";

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
      // 1) 전체 유저 목록 조회
      const res = await fetch("/api/v1/users"); // 프록시를 /api로 태운다고 가정
      if (!res.ok) {
        throw new Error("유저 목록 조회 실패");
      }

      const users = (await res.json()) as AuthUser[];

      // 2) 입력한 GitHub login과 일치하는 유저 찾기
      const matched = users.find(
        (u) => u.login.toLowerCase() === githubLogin.trim().toLowerCase()
      );

      if (!matched) {
        // 3-a) 유저가 없으면 /signup으로 이동
        // 필요하면 state로 login 넘겨줘도 됨
        navigate("/signup", {
          replace: false,
          state: { githubLogin: githubLogin.trim() },
        });
        return;
      }

      // 3-b) 유저가 있으면 디버그 토큰 발급
      const token = await mintDebugTokenByUserId(matched.id);

      // 4) 토큰 저장 후 /me 새로고침
      setToken(token);
      await refresh();

      // 5) 로그인 완료 후 /landing 이동
      navigate("/landing", { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        "로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isLoading || isSubmitting;

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
            DKMV는 GitHub 계정 정보를 기반으로 동작합니다.
            <br />
            사용 중인 GitHub 아이디를 입력해서 로그인해주세요.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                GitHub 아이디
              </label>
              <input
                type="text"
                value={githubLogin}
                onChange={(e) => setGithubLogin(e.target.value)}
                placeholder="예: suajeon, octocat"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500"
              disabled={isBusy || !githubLogin.trim()}
            >
              <Github className="mr-2 h-4 w-4" />
              {isBusy ? "로그인 처리 중..." : "GitHub 아이디로 로그인"}
            </Button>
          </form>

          <p className="text-xs leading-relaxed text-slate-500">
            입력하신 GitHub 아이디로 이미 등록된 계정이 있다면,
            <br />
            해당 계정으로 바로 로그인 처리됩니다.
            <br />
            계정이 없다면, 회원가입 페이지로 이동합니다.
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
              직접 계정 생성하기
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
