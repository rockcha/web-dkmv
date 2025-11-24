// src/features/auth/AuthMenu.tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type AuthMenuProps = {
  className?: string;
};

export function AuthMenu({ className }: AuthMenuProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // 버튼 라벨
  const label = isLoading
    ? "확인중..."
    : isAuthenticated
    ? "로그아웃"
    : "로그인";

  const handleClick = async () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // 🔵 로그인되지 않은 경우: /login 으로 이동
      navigate("/login");
      return;
    }

    // 🔴 로그인된 경우: 로그아웃 → /landing
    await logout();
    navigate("/landing", { replace: true });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={["px-3 text-sm font-medium", className]
        .filter(Boolean)
        .join(" ")}
      disabled={isLoading}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
