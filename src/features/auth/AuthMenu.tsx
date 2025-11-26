// src/features/auth/AuthMenu.tsx
import { useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AuthMenuProps = {
  className?: string;
};

export function AuthMenu({ className }: AuthMenuProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  // ✅ 로그인 성공 시 웰컴 토스트
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const key = `dkmv_welcomed_${(user as any).id ?? user.login}`;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");

    const displayName = (user as any).name?.trim() || user.login || "사용자";

    toast.success(`환영합니다, ${displayName} 님!`, {
      description: "오늘도 코드 바이브 체크해볼까요?",
    });
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
      if (user) {
        const key = `dkmv_welcomed_${(user as any).id ?? user.login}`;
        sessionStorage.removeItem(key);
      }

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

  const primaryDialogButtonClass = `
    cursor-pointer
    bg-violet-600 text-white
    hover:bg-violet-500 hover:text-white
    active:bg-violet-700
    transition-all
    hover:-translate-y-[2px]
    border-none
    shadow-sm
  `;

  // 🔵 비로그인 상태 → 계정 아이콘 + AlertDialog("로그인 하시겠습니까?")
  if (!isAuthenticated) {
    return (
      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={[
                    "cursor-pointer",
                    "transition-transform duration-150 ease-out",
                    "hover:scale-110 active:scale-95",
                    className,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={isLoading}
                >
                  <User className="h-5 w-5 text-slate-600 dark:text-slate-200" />
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>로그인</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialogContent
          className="
            bg-white text-slate-900
            border border-slate-200
            shadow-xl
          "
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-semibold">
              로그인 하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 mt-1">
              GitHub 계정으로 로그인하면 DKMV 대시보드와 분석 기록을 확인하실 수
              있어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel asChild>
              <Button type="button" className={primaryDialogButtonClass}>
                취소
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                className={primaryDialogButtonClass}
                onClick={() => {
                  if (isLoading) return;
                  toast.info("로그인 페이지로 이동합니다.", {
                    description: "GitHub로 편하게 로그인해보세요.",
                  });
                  navigate("/login");
                }}
              >
                확인
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // 🔴 로그인 상태 → GitHub 아바타 + AlertDialog("로그아웃 하시겠습니까?")
  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <button
                disabled={isLoading}
                className={`
                  h-9 w-9
                  rounded-full
                  border border-slate-300 dark:border-slate-700
                  overflow-hidden
                  hover:ring-2 hover:ring-violet-500/60
                  disabled:opacity-60
                  transition-all
                  cursor-pointer
                  ${className ?? ""}
                `}
              >
                <img
                  src={user?.avatar_url || "/images/default-avatar.png"}
                  alt={user?.login || "user avatar"}
                  className="w-full h-full object-cover"
                />
              </button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>로그아웃</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent
        className="
          bg-white text-slate-900
          border border-slate-200
          shadow-xl
        "
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 font-semibold">
            로그아웃 하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 mt-1">
            다시 로그인하기 전까지는 DKMV 분석 결과와 대시보드에 접근할 수
            없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-3">
          <AlertDialogCancel asChild>
            <Button type="button" className={primaryDialogButtonClass}>
              취소
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              className={primaryDialogButtonClass}
              onClick={handleLogout}
            >
              확인
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
