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

        // 🔍 이 로그인 요청이 "익스텐션에서 시작된 것"인지 체크
        //  - LoginPage에서 ?from=extension 으로 진입하면
        //    localStorage.setItem("dkmv_login_origin", "extension") 해둔다고 가정
        const fromFlag = window.localStorage.getItem("dkmv_login_origin");
        const fromExtension = fromFlag === "extension";

        if (fromExtension) {
          // 한 번 사용했으니 플래그 제거
          window.localStorage.removeItem("dkmv_login_origin");

          try {
            // 🚪 VS Code URI로 리다이렉트 → extension.ts의 UriHandler가 받음
            const vscodeUrl = new URL("vscode://rockcha.dkmv/auth-callback");
            vscodeUrl.searchParams.set("token", token);
            vscodeUrl.searchParams.set("login", me.login);
            if (me.avatar_url) {
              vscodeUrl.searchParams.set("avatar_url", me.avatar_url);
            }

            window.location.href = vscodeUrl.toString();
            return;
          } catch (err) {
            console.error("VS Code URI 생성 실패", err);
            // 실패하더라도 아래 웹 플로우는 그대로 태운다
          }
        }

        // 💻 여기부터는 "기존 순수 웹 로그인 플로우" 그대로 유지
        if (status === "existing") {
          toast.info("이미 연동된 GitHub 계정입니다.", {
            description: "해당 계정으로 자동 로그인되었어요.",
          });
        } else {
          toast.success("GitHub 계정이 연동되었습니다.", {
            description: "DKMV 계정 생성 후 자동 로그인되었어요.",
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
