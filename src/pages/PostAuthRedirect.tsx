// src/pages/PostAuthRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PostAuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // 팝업창에서 부모 창으로 "로그인 됐다" 신호 보내기
    if (window.opener) {
      window.opener.postMessage("oauth:success", "*");
      window.close();
    } else {
      navigate("/landing", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
      로그인 처리 중입니다…
    </div>
  );
}
