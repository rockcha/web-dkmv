// src/features/auth/AuthMenu.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "./AuthContext";
import { startGithubLoginPopup } from "./authApi";

type AuthMenuProps = {
  className?: string;
};

export function AuthMenu({ className }: AuthMenuProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout, refresh } = useAuth(); // ✅ refresh 추가
  const [open, setOpen] = useState(false);

  const label = isLoading
    ? "확인중..."
    : isAuthenticated
    ? "로그아웃"
    : "로그인";

  // 🔴 로그아웃 동작
  const handleLogout = async () => {
    if (isLoading) return;
    await logout();
    navigate("/landing");
  };

  // 🟢 팝업에서 OAuth 완료 → 메인 창에서 상태 갱신 + /landing 이동
  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.data === "oauth:success") {
        try {
          // 🔥 여기서 /api/me 다시 호출해서 user 채우기
          await refresh();
        } catch (err) {
          console.error("로그인 상태 갱신 실패", err);
        } finally {
          setOpen(false);
          navigate("/landing", { replace: true });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refresh, navigate]);

  // 로그아웃 상태 → Dialog + GitHub 연동 버튼
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={["px-3 text-sm font-medium", className]
              .filter(Boolean)
              .join(" ")}
            disabled={isLoading}
          >
            {label}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>GitHub 연동 로그인</DialogTitle>
            <DialogDescription>
              GitHub 계정을 사용하여 DKMV에 로그인합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <Button
              className="w-full bg-violet-600 hover:bg-violet-500 text-white"
              onClick={() => startGithubLoginPopup("native")}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub로 시작하기
            </Button>

            <p className="text-xs text-slate-500 text-center">
              GitHub 인증 창이 새 창으로 열립니다.
              <br />
              인증이 완료되면 이 화면에서 자동으로 로그인 상태로 전환됩니다.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  console.log(
    "[AuthMenu] 렌더링, isAuthenticated:",
    isAuthenticated,
    "isLoading:",
    isLoading
  );
  // 로그인 상태 → 로그아웃 버튼만
  return (
    <Button
      variant="ghost"
      size="sm"
      className={["px-3 text-sm font-medium", className]
        .filter(Boolean)
        .join(" ")}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {label}
    </Button>
  );
}
