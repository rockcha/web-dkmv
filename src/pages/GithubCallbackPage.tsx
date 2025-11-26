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
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const status = params.get("status") ?? "new"; // "new" | "existing"
    const source = params.get("source") ?? params.get("from") ?? "web";
    const isExtensionFlow = source === "extension";

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
      window.opener.postMessage(
        {
          type: "oauth:success",
          status,
        },
        window.location.origin
      );
      window.close();
      return;
    }

    // 🎯 일반 플로우 (로그인 페이지에서 전체 리다이렉트)
    (async () => {
      try {
        const me = await refresh();

        if (!me) {
          toast.error("프로필 정보를 불러오는 데 실패했습니다.");
          navigate("/login", { replace: true });
          return;
        }

        const displayName =
          (me.name && me.name.trim().length > 0 ? me.name : me.login) ||
          "사용자";

        if (isExtensionFlow) {
          // 익스텐션 웹 플로우용 메시지
          toast.success(`환영합니다, ${displayName} 님!`, {
            description:
              "이제 VS Code로 돌아가 DKMV 확장 프로그램에서 코드를 리뷰할 수 있어요.",
          });
        } else {
          // 기본 웹 로그인 플로우용 메시지
          toast.success(`환영합니다, ${displayName} 님!`, {
            description: "오늘도 코드 바이브 체크해볼까요?",
          });
        }

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
