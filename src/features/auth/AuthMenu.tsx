// src/features/auth/AuthMenu.tsx
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { User, LogOut, Github } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

  /* ===========================================================
     ✅ DKMV Dialog Theme (Analyses 톤)
  ============================================================ */

  const dialogContentClass = cn(
    "z-50 w-[92vw] max-w-md rounded-3xl p-0 overflow-hidden",
    // ✅ 배경: 라이트/다크
    "bg-white text-slate-900",
    "dark:bg-slate-950/90 dark:text-white",
    // ✅ 프레임: 보라 + 글로우
    "border border-purple-500/30 dark:border-purple-300/20",
    "shadow-[0_28px_90px_rgba(0,0,0,0.55)]",
    "ring-1 ring-purple-500/20 dark:ring-purple-300/15",
    // ✅ 바깥 글로우
    "before:pointer-events-none before:content-[''] before:absolute before:inset-0 before:rounded-3xl",
    "before:shadow-[0_0_0_2px_rgba(139,92,246,0.18),0_0_40px_rgba(139,92,246,0.18)]",
    "dark:before:shadow-[0_0_0_2px_rgba(196,181,253,0.14),0_0_44px_rgba(196,181,253,0.16)]"
  );

  const dialogHeaderWrap = cn(
    "relative px-6 pt-6 pb-5 border-b",
    "border-purple-500/20 dark:border-purple-300/15",
    "bg-gradient-to-b from-purple-500/10 to-transparent dark:from-purple-300/10"
  );

  const headerGlowA =
    "pointer-events-none absolute -top-10 left-1/2 h-32 w-[420px] -translate-x-1/2 rounded-full bg-purple-500/15 blur-3xl dark:bg-purple-300/10";
  const headerGlowB =
    "pointer-events-none absolute -bottom-16 right-[-60px] h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-400/10";

  const headerIconWrap = cn(
    "relative grid place-items-center h-11 w-11 rounded-2xl",
    "bg-purple-500/10 dark:bg-purple-300/10",
    "ring-1 ring-purple-500/25 dark:ring-purple-300/20",
    "shadow-[0_0_0_8px_rgba(139,92,246,0.10)] dark:shadow-[0_0_0_8px_rgba(196,181,253,0.10)]"
  );

  const headerIconGlyph = "h-5 w-5 text-purple-700 dark:text-purple-200";

  const footerWrap = "px-6 pb-6 pt-4";

  const cancelBtnClass = cn(
    "cursor-pointer rounded-full",
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    "dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
    "transition"
  );

  const primaryBtnClass = cn(
    "cursor-pointer rounded-full",
    "bg-purple-600 text-white hover:bg-purple-500 active:bg-purple-700",
    "shadow-[0_10px_30px_rgba(139,92,246,0.18)] hover:shadow-[0_14px_38px_rgba(139,92,246,0.22)]",
    "transition hover:-translate-y-[1px]"
  );

  /* ===========================================================
     🔵 비로그인 상태 → 계정 아이콘 + 로그인 다이얼로그
  ============================================================ */

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
                  className={cn(
                    "cursor-pointer",
                    "transition-transform duration-150 ease-out",
                    "hover:scale-110 active:scale-95",
                    className
                  )}
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

        <AlertDialogContent className={dialogContentClass}>
          {/* Header */}
          <div className={dialogHeaderWrap}>
            <div className={headerGlowA} />
            <div className={headerGlowB} />

            <AlertDialogHeader className="relative">
              <div className="flex items-start gap-3">
                <div className={headerIconWrap}>
                  <Github className={headerIconGlyph} />
                </div>

                <div className="min-w-0">
                  <AlertDialogTitle className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                    로그인 하시겠습니까?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="mt-1 text-sm text-slate-600 dark:text-white/70">
                    GitHub로 로그인하면 DKMV 대시보드와 분석 기록을 확인하실 수
                    있어요.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
          </div>

          {/* Footer */}
          <div className={footerWrap}>
            <AlertDialogFooter className="gap-2 sm:gap-3">
              <AlertDialogCancel asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cancelBtnClass}
                >
                  취소
                </Button>
              </AlertDialogCancel>

              <AlertDialogAction asChild>
                <Button
                  type="button"
                  className={primaryBtnClass}
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
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  /* ===========================================================
     🔴 로그인 상태 → 아바타 + 로그아웃 다이얼로그
  ============================================================ */

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <button
                disabled={isLoading}
                className={cn(
                  "h-12 w-12 rounded-full overflow-hidden cursor-pointer",
                  "border border-slate-300 dark:border-slate-700",
                  "transition-all disabled:opacity-60",
                  "hover:ring-2 hover:ring-purple-500/60",
                  "hover:shadow-[0_12px_40px_rgba(139,92,246,0.10)]",
                  className ?? ""
                )}
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

      <AlertDialogContent className={dialogContentClass}>
        {/* Header */}
        <div className={dialogHeaderWrap}>
          <div className={headerGlowA} />
          <div className={headerGlowB} />

          <AlertDialogHeader className="relative">
            <div className="flex items-start gap-3">
              <div className={headerIconWrap}>
                <LogOut className={headerIconGlyph} />
              </div>

              <div className="min-w-0">
                <AlertDialogTitle className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  로그아웃 하시겠습니까?
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-sm text-slate-600 dark:text-white/70">
                  다시 로그인하기 전까지는 DKMV 분석 결과와 대시보드에 접근할 수
                  없습니다.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
        </div>

        {/* Footer */}
        <div className={footerWrap}>
          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel asChild>
              <Button
                type="button"
                variant="outline"
                className={cancelBtnClass}
              >
                취소
              </Button>
            </AlertDialogCancel>

            <AlertDialogAction asChild>
              <Button
                type="button"
                className={primaryBtnClass}
                onClick={handleLogout}
              >
                확인
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
