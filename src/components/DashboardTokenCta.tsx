// src/components/DashboardTokenCta.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { mintVscodeToken } from "@/features/auth/authApi";
import { toast } from "sonner";
import { Rocket, ArrowRight, Copy, KeyRound, Check } from "lucide-react";
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

/** ✅ 토큰은 UI에는 짧게(마스킹) 표시하고, 복사는 원본 그대로 */
const maskToken = (value: string, head = 12, tail = 10) => {
  if (!value) return "";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
};

export default function DashboardTokenCta({
  className,
}: DashboardTokenCtaProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [hovered, setHovered] = useState<HoverTarget>(null);

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleMint = async () => {
    if (!isAuthenticated) {
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
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
      toast.error("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOpen(false);
      return;
    }

    if (!isAuthenticated) {
      navigate("/login?from=token-required");
      return;
    }

    setOpen(true);
  };

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

  /** ✅ 토큰 “input 박스” (버튼을 안에 넣기 위해 relative + pr 확보) */
  const tokenBoxClass = [
    "relative w-full max-w-full overflow-hidden", // ✅ 내부 absolute 버튼 기준
    "rounded-2xl border px-3 py-2 pr-11", // ✅ 오른쪽 버튼 공간 확보 (pr-11)
    "bg-slate-50/80 dark:bg-slate-900/60",
    copied
      ? "border-emerald-400/80 ring-2 ring-emerald-300/50 shadow-[0_0_0_3px_rgba(16,185,129,0.18)] dark:border-emerald-400/70 dark:ring-emerald-400/30"
      : "border-slate-200/70 dark:border-slate-700/70",
    "transition-[border-color,box-shadow] duration-200",
  ].join(" ");

  /** ✅ input 안쪽 오른쪽 복사 버튼 (hover + cursor-pointer 확실히) */
  const copyInInputBtnClass = [
    "absolute right-1.5 top-1/2 -translate-y-1/2",
    "h-8 w-8 rounded-xl",
    "cursor-pointer", // ✅ 기본도 pointer
    "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "transition-colors",
  ].join(" ");

  return (
    <div
      className={`
        mt-4 flex w-full max-w-xl flex-col gap-3
        sm:flex-row sm:items-center sm:justify-center
        lg:justify-start
        ${className ?? ""}
      `}
    >
      {/* 시작하기 */}
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
          <Link to="/start" aria-label="DKMV 시작하기">
            <span className="flex items-center gap-2">
              <Rocket className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                시작하기
              </span>
              <ArrowRight className="size-4 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
            </span>
          </Link>
        </Button>
      </div>

      {/* 토큰 발급 */}
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
                <KeyRound className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                  토큰 발급
                </span>
                <ArrowRight className="size-4 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              </span>
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent
          className="
            max-w-lg
            overflow-hidden
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
              확장 설정 화면에 붙여넣을{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-100">
                전용 액세스 토큰
              </span>
              을 발급합니다. 외부 노출에 주의해 주세요.
            </DialogDescription>
          </DialogHeader>

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
              {isLoading ? "발급 중..." : token ? "다시 발급" : "토큰 발급"}
            </Button>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                발급된 토큰
              </label>

              {/* ✅ input(박스) 안 오른쪽에 복사 버튼 */}
              <div className={tokenBoxClass} title={token || undefined}>
                {/* 토큰 텍스트 (오른쪽 버튼 공간 pr-11로 확보됨) */}
                {token ? (
                  <span
                    className="
                      block w-full max-w-full truncate whitespace-nowrap
                      font-mono text-[11px] sm:text-xs
                      text-slate-700 dark:text-slate-200
                    "
                  >
                    {maskToken(token, 12, 10)}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] sm:text-xs">
                    여기에 발급된 토큰이 표시됩니다.
                  </span>
                )}

                {/* 복사 버튼 */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={copyInInputBtnClass}
                  onClick={handleCopy}
                  disabled={!token}
                  aria-label="토큰 복사"
                  title={token ? "복사" : "토큰이 없습니다"}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {token && (
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  토큰은 민감한 값입니다. 저장소/스크린샷/공유에 노출되지 않게
                  주의하세요.
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
