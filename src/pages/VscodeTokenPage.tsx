// src/pages/VscodeTokenPage.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/AuthContext";
import { mintVscodeToken } from "@/features/auth/authApi";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export default function VscodeTokenPage() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMint = async () => {
    if (!isAuthenticated) {
      toast.error("먼저 GitHub로 로그인해주세요.");
      return;
    }
    setIsLoading(true);
    setCopied(false);
    try {
      const t = await mintVscodeToken();
      setToken(t);
      toast.success("VS Code용 토큰이 발급되었습니다.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "토큰 발급 중 오류가 발생했습니다.");
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
      toast.error("복사에 실패했습니다. 직접 선택해서 복사해주세요.");
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
        <CardHeader className="pb-4 border-b border-slate-200/70 dark:border-slate-800/70">
          <h1 className="text-xl sm:text-2xl font-semibold">
            VS Code 확장용 토큰 발급
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            웹에서 GitHub로 로그인한 뒤, VS Code 확장에서 사용할 전용 토큰을
            발급합니다. 이 토큰은 비공개로 안전하게 보관해주세요.
          </p>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {!isAuthenticated && (
            <p className="text-sm text-red-500">
              현재 로그인되어 있지 않습니다. 먼저 상단 메뉴에서 GitHub 로그인을
              완료해주세요.
            </p>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              className="w-full h-11 text-sm font-semibold"
              onClick={handleMint}
              disabled={isLoading || !isAuthenticated}
            >
              {isLoading ? "토큰 발급 중..." : "VS Code용 토큰 발급하기"}
            </Button>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                발급된 토큰
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={token}
                  readOnly
                  className="text-xs font-mono"
                  placeholder="여기에 발급된 토큰이 표시됩니다."
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleCopy}
                  disabled={!token}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? "복사됨" : "복사"}
                </Button>
              </div>
              {token && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  이 토큰은 VS Code 확장에서만 사용되며, 노출되지 않도록
                  주의해주세요.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
