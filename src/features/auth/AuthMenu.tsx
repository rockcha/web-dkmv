// src/features/auth/AuthMenu.tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AuthMenuProps = {
  className?: string;
};

export function AuthMenu({ className }: AuthMenuProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("로그아웃 되었습니다.", {
        description: "언제든 다시 바이브 체크하러 오세요!",
      });
      // 🔁 URL만 /landing으로 이동 (새로고침 제거)
      navigate("/landing", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("로그아웃 중 문제가 발생했습니다.", {
        description: "잠시 후 다시 시도해주세요.",
      });
    }
  };

  // 🔵 비로그인 상태 → 빈 계정 아이콘 + Tooltip("로그인")
  if (!isAuthenticated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={[
                "cursor-pointer", // ✅ 항상 pointer
                className,
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={isLoading}
              onClick={() => {
                if (isLoading) return;
                toast.info("로그인이 필요합니다.", {
                  description: "로그인 페이지로 이동합니다.",
                });
                navigate("/login");
              }}
            >
              <User className="h-5 w-5 text-slate-600 dark:text-slate-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>로그인</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 🔴 로그인 상태 → GitHub 아바타 + Tooltip("로그아웃")
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`
              h-9 w-9
              rounded-full
              border border-slate-300 dark:border-slate-700
              overflow-hidden
              hover:ring-2 hover:ring-violet-500/60
              disabled:opacity-60
              transition-all
              cursor-pointer  /* ✅ 여기도 pointer 고정 */
              ${className ?? ""}
            `}
          >
            <img
              src={user?.avatar_url || "/images/default-avatar.png"}
              alt={user?.login || "user avatar"}
              className="w-full h-full object-cover"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>로그아웃</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
