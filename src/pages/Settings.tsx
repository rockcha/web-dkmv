// src/pages/Settings.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { getToken } from "@/features/auth/token";
import {
  Shield,
  FileCode2,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

const STORE_CODE_ENDPOINT = "/api/v1/users/me/store-code";

type Mode = "allow" | "deny";

export default function Settings() {
  const { user, setUserStoreCode } = useAuth();

  const [storeCode, setStoreCode] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setStoreCode(user.store_code ?? false);
  }, [user]);

  const mode: Mode = useMemo(() => (storeCode ? "allow" : "deny"), [storeCode]);

  const disabled = saving || storeCode === null;

  const save = async (next: boolean) => {
    if (storeCode === null) return;

    const token = getToken();
    if (!token) {
      setError("로그인 정보가 유효하지 않아요. 다시 로그인해 주세요.");
      return;
    }

    setSaving(true);
    setError(null);

    // optimistic
    setStoreCode(next);

    try {
      const res = await fetch(STORE_CODE_ENDPOINT, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ store_code: next }),
      });

      if (res.status === 401) {
        setError("로그인 세션이 만료됐어요. 다시 로그인해 주세요.");
        throw new Error("unauthorized");
      }
      if (!res.ok) throw new Error("failed to save setting");

      setUserStoreCode(next);
    } catch (e) {
      console.error("[Settings] failed to save setting", e);
      // rollback
      setStoreCode((prev) => (prev === null ? prev : !next));
      setError("설정을 저장하지 못했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const choose = (nextMode: Mode) => {
    if (disabled) return;
    if (nextMode === "allow") save(true);
    else save(false);
  };

  return (
    <div className="w-full">
      {/* ✅ 중앙정렬 제거: mx-auto / max-w 제거, 왼쪽 정렬 */}
      <div className="w-full px-4 md:px-6 py-8 md:py-12">
        <Card className="border border-border/70 bg-background/70 backdrop-blur overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border bg-background/80">
                  <div className="pointer-events-none absolute inset-0 rounded-2xl blur-xl opacity-40 bg-violet-500/10" />
                  <Shield className="h-5 w-5 text-muted-foreground relative" />
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-base md:text-lg font-semibold">
                    원본 코드 저장
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    새 리뷰부터 적용
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className={[
                  "rounded-full px-2.5 py-1 text-[11px]",
                  mode === "allow"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "border-border/60 bg-background/60 text-muted-foreground",
                ].join(" ")}
              >
                {mode === "allow" ? "허용" : "허용 안 함"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Separator />

            <div className="grid gap-3 md:grid-cols-2">
              {/* Allow */}
              <button
                type="button"
                disabled={disabled}
                onClick={() => choose("allow")}
                className={[
                  "group w-full rounded-2xl border p-4 md:p-5 text-left",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                  disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                  mode === "allow"
                    ? "border-emerald-500/50 bg-emerald-500/8 shadow-sm"
                    : "border-border/60 bg-background/60 hover:bg-background/80",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={[
                        "shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center border",
                        mode === "allow"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                          : "border-border/60 bg-background/60 text-muted-foreground",
                      ].join(" ")}
                    >
                      <FileCode2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-semibold">
                          허용
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        리뷰 재현/비교에 유리
                      </p>
                    </div>
                  </div>

                  {saving && mode === "allow" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : mode === "allow" ? (
                    <Check className="h-5 w-5 text-emerald-500" />
                  ) : null}
                </div>
              </button>

              {/* Deny */}
              <button
                type="button"
                disabled={disabled}
                onClick={() => choose("deny")}
                className={[
                  "group w-full rounded-2xl border p-4 md:p-5 text-left",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                  disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                  mode === "deny"
                    ? "border-foreground/15 bg-foreground/4 shadow-sm"
                    : "border-border/60 bg-background/60 hover:bg-background/80",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={[
                        "shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center border",
                        mode === "deny"
                          ? "border-foreground/15 bg-foreground/5 text-foreground/80"
                          : "border-border/60 bg-background/60 text-muted-foreground",
                      ].join(" ")}
                    >
                      <EyeOff className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-semibold">
                          허용 안 함
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        민감 코드 노출 최소화
                      </p>
                    </div>
                  </div>

                  {saving && mode === "deny" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : mode === "deny" ? (
                    <Check className="h-5 w-5 text-foreground/70" />
                  ) : null}
                </div>
              </button>
            </div>

            {error && (
              <div className="pt-1 text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* optional: saving 상태만 조용히 표시 */}
            <div className="pt-1 flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                disabled
              >
                {saving ? "저장 중" : " "}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
