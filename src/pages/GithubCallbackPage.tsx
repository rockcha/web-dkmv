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

  // ✅ 이 페이지에서 콜백 로직을 한 번만 실행하기 위한 플래그 (StrictMode 대응)
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const status = params.get("status") ?? "new"; // "new" | "existing"
    // (선택) 익스텐션 웹 플로우용 파라미터 (백엔드에서 붙여줄 수 있음)
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
      // 🧪 팝업 플로우 (회원가입)
      // - 토큰은 이미 같은 origin 로컬스토리지에 저장됨
      // - 상태(status)만 부모창에 알려주고 닫기
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
        const me = await refresh();

        // ✅ 실제로 /api/v1/users/me 에서 유저 정보 못 받아오면 실패로 처리
        if (!me) {
          toast.error("프로필 정보를 불러오는 데 실패했습니다.");
          navigate("/login", { replace: true });
          return;
        }

        if (isExtensionFlow) {
          // 익스텐션이 띄운 웹에서 로그인 완료된 경우 (선택적 메시지)
          toast.success("로그인이 완료되었습니다.", {
            description:
              "이제 VS Code로 돌아가 DKMV 확장 프로그램에서 코드를 리뷰할 수 있어요.",
          });
        } else {
          // 기본 웹 로그인 플로우
          toast.success("GitHub 로그인 완료!");
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
