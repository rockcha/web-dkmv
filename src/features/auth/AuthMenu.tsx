// src/features/auth/AuthMenu.tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "sonner"; //

type AuthMenuProps = {
  className?: string;
};

export function AuthMenu({ className }: AuthMenuProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAuth();

  const label = isLoading
    ? "확인중..."
    : isAuthenticated
    ? "로그아웃"
    : "로그인";

  const handleClick = async () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // 🔵 로그인되지 않은 경우: /login 이동 + 토스트
      toast("로그인이 필요합니다.", {
        description: "로그인 페이지로 이동합니다.",
      });
      navigate("/login");
      return;
    }

    // 🔴 로그인된 경우: 로그아웃 + 토스트 + /landing
    try {
      await logout();
      toast.success("로그아웃 되었습니다.", {
        description: "언제든 다시 바이브 체크하러 오세요!",
      });
      navigate("/landing", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("로그아웃 중 문제가 발생했습니다.", {
        description: "잠시 후 다시 시도해주세요.",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={[
        "px-3 text-sm font-medium cursor-pointer", // ✅ cursor-pointer 추가
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isLoading}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
