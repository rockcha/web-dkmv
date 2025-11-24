// src/pages/GithubCallbackPage.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "@/features/auth/token";

export default function GithubCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      // 토큰 없으면 실패 → 로그인 화면으로
      navigate("/login", { replace: true });
      return;
    }

    // 1) JWT 토큰 로컬에 저장
    setToken(token);

    // 2) 팝업인 경우: 부모창에 알려주고 닫기
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: "oauth:success" }, window.origin);
      window.close();
      return;
    }

    // 3) 일반 로그인(전체 페이지)인 경우: 바로 /landing 이동
    navigate("/landing", { replace: true });
  }, [location.search, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <p className="text-sm text-slate-400">GitHub 로그인 처리 중입니다...</p>
    </main>
  );
}
