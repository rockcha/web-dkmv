// src/pages/GithubCallbackPage.tsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "@/features/auth/token";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";

export default function GithubCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  // ✅ 이 페이지에서 콜백 로직을 한 번만 실행하기 위한 플래그
  const handledRef = useRef(false);

  useEffect(() => {
    // 이미 한 번 처리했으면 더 이상 실행하지 않음 (StrictMode 대응)
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const status = params.get("status") ?? "new"; // "new" | "existing"

    if (!token) {
      toast.error("GitHub 로그인에 실패했습니다.");
      navigate("/login", { replace: true });
      return;
    }

    // 1) 토큰 저장
    setToken(token);

    // 2) 팝업인지, 전체 페이지인지 분기
    const hasOpener = !!window.opener && !window.opener.closed;

    if (hasOpener) {
      // 🧪 팝업 플로우 (회원가입) → 여기서는 status 계속 사용
      window.opener.postMessage(
        {
          type: "oauth:success",
          status, // ✅ 새 유저인지 여부도 같이 보냄
        },
        window.location.origin
      );
      window.close();
      return;
    }

    // 🎯 일반 플로우 (로그인 페이지에서 전체 리다이렉트)
    (async () => {
      try {
        await refresh();

        // ✅ 로그인 플로우에서는 status와 상관없이 항상 동일한 메시지
        toast.success("GitHub 로그인 완료!");

        navigate("/landing", { replace: true });
      } catch (e) {
        console.error(e);
        toast.error("프로필 정보를 불러오는 데 실패했습니다.");
        navigate("/login", { replace: true });
      }
    })();
  }, [location.search, navigate, refresh]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">
        GitHub 계정으로 로그인 처리 중입니다...
      </p>
    </main>
  );
}
