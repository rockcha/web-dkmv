// src/components/VscodeTokenButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/AuthContext";
import { mintVscodeToken } from "@/features/auth/authApi";
import { toast } from "sonner";
import { Copy, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type CTAHover = "dashboard" | "token" | null;

type VscodeTokenButtonProps = {
  hoveredCTA?: CTAHover;
  // setState 콜백도 받을 수 있도록 타입 열어줌
  setHoveredCTA?: (value: CTAHover | ((prev: CTAHover) => CTAHover)) => void;
};

export default function VscodeTokenButton({
  hoveredCTA,
  setHoveredCTA,
}: VscodeTokenButtonProps) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMint = async () => {
    if (!isAuthenticated) {
      // 안전망 (원래는 Dialog 자체가 안 열리게 막음)
      toast.info("로그인이 필요합니다.", {
        description: "먼저 GitHub로 로그인한 뒤 토큰을 발급해 주세요.",
      });
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
      toast.info("로그인이 필요합니다.", {
        description: "먼저 GitHub로 로그인한 뒤 토큰을 발급해 주세요.",
      });
      // ❌ open 상태는 그대로 false 유지
      return;
    }

    setOpen(true);
  };

  // 🔮 대시보드 버튼과 톤 맞추면서 약간 더 라이트한 느낌
  const triggerClass =
    "cursor-pointer inline-flex h-16 w-full max-w-xs items-center justify-center " +
    "rounded-2xl border border-violet-300/80 " +
    "bg-gradient-to-r from-white via-violet-50 to-violet-100 " +
    "text-sm sm:text-base font-semibold text-violet-700 " +
    "shadow-[0_14px_30px_rgba(88,28,135,0.18)] " +
    "transition-all duration-300 " +
    "hover:-translate-y-0.5 hover:scale-[1.02] " +
    "hover:shadow-[0_18px_40px_rgba(88,28,135,0.32)] " +
    "hover:border-violet-500 " +
    "dark:border-violet-700/70 dark:bg-slate-950/90 " +
    "dark:text-violet-200 dark:hover:bg-violet-950/80" +
    (hoveredCTA === "dashboard"
      ? " ring-2 ring-violet-400/70 dark:ring-violet-500/80 scale-[1.01]"
      : "");

  const handleTriggerMouseEnter = () => {
    if (setHoveredCTA) setHoveredCTA("token");
  };

  const handleTriggerMouseLeave = () => {
    if (setHoveredCTA) {
      setHoveredCTA((prev) => (prev === "token" ? null : prev));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* 👉 Landing CTA 옆에서 쓰는 메인 트리거 버튼 */}
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={triggerClass}
          onMouseEnter={handleTriggerMouseEnter}
          onMouseLeave={handleTriggerMouseLeave}
        >
          <span className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>VS Code 토큰 발급</span>
          </span>
        </Button>
      </DialogTrigger>

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

        {/* 🔴 비로그인 안내 (추가 안내용, 실제로는 Dialog가 안 열리도록 막아둠) */}
        {!isAuthenticated && (
          <p className="mt-2 text-xs sm:text-sm text-red-500">
            현재 로그인되어 있지 않습니다. 상단 메뉴에서 GitHub 로그인을 완료한
            뒤 다시 시도해 주세요.
          </p>
        )}

        <div className="mt-4 space-y-4">
          {/* 발급 버튼 */}
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
            disabled={isLoading || !isAuthenticated}
          >
            {isLoading ? "토큰 발급 중..." : "VS Code용 토큰 발급하기"}
          </Button>

          {/* 토큰 표시 영역 */}
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
                variant="outline"
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
                <span className="font-medium">VS Code DKMV 확장 설정 화면</span>
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
  );
}
