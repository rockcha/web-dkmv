// src/components/DashboardTokenCta.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/AuthContext";
import { mintVscodeToken } from "@/features/auth/authApi";
import { toast } from "sonner";
import { Rocket, ArrowRight, Copy, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type HoverTarget = "dashboard" | "token" | null;

type DashboardTokenCtaProps = {
  className?: string;
};

export default function DashboardTokenCta({
  className,
}: DashboardTokenCtaProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [hovered, setHovered] = useState<HoverTarget>(null);

  // 토큰 발급 dialog 상태
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 📏 flex 비율 (hover 시 부드럽게 변경)
  const baseGrow = 1;
  const expandedGrow = 1.35;
  const collapsedGrow = 0.65;

  const dashboardGrow =
    hovered === "dashboard"
      ? expandedGrow
      : hovered === "token"
      ? collapsedGrow
      : baseGrow;

  const tokenGrow =
    hovered === "token"
      ? expandedGrow
      : hovered === "dashboard"
      ? collapsedGrow
      : baseGrow;

  const flexTransition =
    "flex-grow 260ms cubic-bezier(0.22,0.61,0.36,1), transform 260ms cubic-bezier(0.22,0.61,0.36,1)";

  // 🪄 토큰 발급
  const handleMint = async () => {
    if (!isAuthenticated) {
      // 👉 토큰 발급 시도 시 비로그인 → 로그인 페이지로 이동
      navigate("/login?from=token-required");
      return;
    }

    setIsLoading(true);
    setCopied(false);
    try {
      const t = await mintVscodeToken();
      setToken(t);
      toast.success("VS Code용 토큰이 발급되었습니다.", {
        description: "VS Code 확장 설정 화면에 붙여넣어 사용하세요.",
      });
    } catch (e: any) {
      console.error(e);
      toast.error("토큰 발급 중 오류가 발생했습니다.", {
        description: e?.message ?? "잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success("클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
      toast.error("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
    }
  };

  // Dialog 열릴 때 로그인 여부 체크
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOpen(false);
      return;
    }

    if (!isAuthenticated) {
      // 👉 Dialog 열려고 해도 비로그인 상태면 로그인 페이지로 이동
      navigate("/login?from=token-required");
      return;
    }

    setOpen(true);
  };

  // 🎨 공통 버튼 베이스 (색/그림자/hover/텍스트 애니메이션 동일)
  const baseButtonClass = [
    "group relative inline-flex h-16 w-full items-center justify-center overflow-hidden",
    "rounded-2xl border border-violet-500/70",
    "bg-gradient-to-r from-violet-500 via-violet-600 to-fuchsia-500",
    "text-base sm:text-lg font-semibold text-white",
    "shadow-[0_18px_40px_rgba(88,28,135,0.45)]",
    "transition-all duration-300",
    "hover:-translate-y-0.5 hover:scale-[1.02]",
    "hover:shadow-[0_22px_50px_rgba(88,28,135,0.7)]",
    "active:scale-[0.99]",
    "cursor-pointer",
  ].join(" ");

  const dashboardButtonClass =
    baseButtonClass +
    (hovered === "dashboard" ? " " : hovered === "token" ? " opacity-90" : "");

  const tokenButtonClass =
    baseButtonClass +
    (hovered === "token" ? "" : hovered === "dashboard" ? " opacity-90" : "");

  return (
    <div
      className={`
        mt-4 flex w-full max-w-xl flex-col gap-3
        sm:flex-row sm:items-center sm:justify-center
        lg:justify-start
        ${className ?? ""}
      `}
    >
      {/* 대시보드 버튼 래퍼 (flex 비율 애니메이션) */}
      <div
        style={{
          flexGrow: dashboardGrow,
          flexBasis: 0,
          transition: flexTransition,
        }}
        onMouseEnter={() => setHovered("dashboard")}
        onMouseLeave={() =>
          setHovered((prev) => (prev === "dashboard" ? null : prev))
        }
      >
        <Button asChild size="lg" className={dashboardButtonClass}>
          <Link to="/mypage/dashboard" aria-label="DKMV 대시보드 시작하기">
            <span className="flex items-center gap-2">
              <Rocket
                className="
                  size-5
                  transition-transform duration-300
                  group-hover:-translate-y-0.5 group-hover:translate-x-0.5
                "
              />
              <span
                className="
                  transition-transform duration-300
                  group-hover:-translate-y-0.5
                "
              >
                대시보드로
              </span>
              <ArrowRight
                className="
                  size-4 opacity-0 -translate-x-1
                  transition-all duration-300
                  group-hover:opacity-100 group-hover:translate-x-0
                "
              />
            </span>
          </Link>
        </Button>
      </div>

      {/* 토큰 발급 버튼 + Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <div
          style={{
            flexGrow: tokenGrow,
            flexBasis: 0,
            transition: flexTransition,
          }}
          onMouseEnter={() => setHovered("token")}
          onMouseLeave={() =>
            setHovered((prev) => (prev === "token" ? null : prev))
          }
        >
          <DialogTrigger asChild>
            <Button type="button" size="lg" className={tokenButtonClass}>
              <span className="flex items-center gap-2">
                <KeyRound
                  className="
                    size-5
                    transition-transform duration-300
                    group-hover:-translate-y-0.5 group-hover:translate-x-0.5
                  "
                />
                <span
                  className="
                    transition-transform duration-300
                    group-hover:-translate-y-0.5
                  "
                >
                  토큰 발급
                </span>
                <ArrowRight
                  className="
                    size-4 opacity-0 -translate-x-1
                    transition-all duration-300
                    group-hover:opacity-100 group-hover:translate-x-0
                  "
                />
              </span>
            </Button>
          </DialogTrigger>
        </div>

        {/* Dialog 내용 */}
        <DialogContent
          className="
            max-w-lg
            rounded-2xl
            border border-slate-200/80 bg-white/95
            backdrop-blur
            dark:border-slate-700/80 dark:bg-slate-900/95
          "
        >
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10">
                <KeyRound className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              </span>
              <span>VS Code 확장용 토큰 발급</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm leading-relaxed">
              웹에서 GitHub로 로그인한 뒤, VS Code 확장에서 사용할{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-100">
                전용 액세스 토큰
              </span>
              을 발급합니다. 이 토큰은 다른 사람에게 노출되지 않도록 주의해
              주세요.
            </DialogDescription>
          </DialogHeader>

          {!isAuthenticated && (
            <p className="mt-2 text-xs sm:text-sm text-red-500">
              현재 로그인되어 있지 않습니다. 상단 메뉴에서 GitHub 로그인을
              완료한 뒤 다시 시도해 주세요.
            </p>
          )}

          <div className="mt-4 space-y-4">
            <Button
              type="button"
              className="
                w-full h-9 sm:h-10
                cursor-pointer
                text-xs sm:text-sm font-semibold
                bg-violet-600 text-white
                hover:bg-violet-700
                dark:bg-violet-500 dark:hover:bg-violet-600
              "
              onClick={handleMint}
              disabled={isLoading}
            >
              {isLoading ? "토큰 발급 중..." : "VS Code용 토큰 발급하기"}
            </Button>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                발급된 토큰
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={token}
                  readOnly
                  className="
                    text-[11px] sm:text-xs font-mono
                    bg-slate-50/80 dark:bg-slate-900/70
                  "
                  placeholder="여기에 발급된 토큰이 표시됩니다."
                />
                <Button
                  type="button"
                  className="
                    shrink-0
                    cursor-pointer
                    text-[11px] sm:text-xs
                  "
                  onClick={handleCopy}
                  disabled={!token}
                >
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  {copied ? "복사됨" : "복사"}
                </Button>
              </div>
              {token && (
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  이 토큰은{" "}
                  <span className="font-medium">
                    VS Code DKMV 확장 설정 화면
                  </span>
                  에서만 사용하세요. GitHub 토큰처럼 민감한 값이므로
                  저장소/스크린샷 등에 노출되지 않게 주의해 주세요.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer text-xs sm:text-sm"
              onClick={() => setOpen(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
