// src/pages/Settings.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/AuthContext";
import { getToken } from "@/features/auth/token";
import {
  Shield,
  FileCode2,
  EyeOff,
  Loader2,
  AlertCircle,
  History,
  Info,
  Sparkles,
} from "lucide-react";

const STORE_CODE_ENDPOINT = "/api/v1/users/me/store-code";

export default function Settings() {
  const { user, setUserStoreCode } = useAuth();

  const [storeCode, setStoreCode] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setStoreCode(user.store_code ?? false);
  }, [user]);

  const handleToggle = async (checked: boolean) => {
    if (storeCode === null) return;

    const token = getToken();
    if (!token) {
      setError("로그인 정보가 유효하지 않아요. 다시 로그인해 주세요.");
      return;
    }

    setSaving(true);
    setError(null);

    // optimistic
    setStoreCode(checked);

    try {
      const res = await fetch(STORE_CODE_ENDPOINT, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ store_code: checked }),
      });

      if (res.status === 401) {
        setError("로그인 세션이 만료됐어요. 다시 로그인해 주세요.");
        throw new Error("unauthorized");
      }
      if (!res.ok) throw new Error("failed to save setting");

      setUserStoreCode(checked);
    } catch (e) {
      console.error("[Settings] failed to save setting", e);
      setStoreCode((prev) => (prev === null ? prev : !checked));
      setError("설정을 저장하지 못했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const isOn = !!storeCode;

  const handleModeChange = (next: boolean) => {
    if (saving || storeCode === null) return;
    handleToggle(next);
  };

  const hintText = isOn
    ? "새 리뷰부터 코드와 함께 저장돼요."
    : "새 리뷰부터 결과만 가볍게 남겨요.";

  // ✅ 톤을 더 선명하게
  const tone = isOn ? "emerald" : "rose";

  const badgeClasses = isOn
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
    : "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300";

  const switchClasses =
    "cursor-pointer data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500/80";

  return (
    <div className="w-full">
      {/* ✅ 부모 폭을 꽉 먹되, 너무 길면 가독성 떨어져서 max만 걸기 */}
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <header className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border bg-background/80">
              <div className="pointer-events-none absolute inset-0 rounded-2xl blur-xl opacity-50 bg-violet-500/10" />
              <Shield className="h-5 w-5 text-muted-foreground relative" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg md:text-xl font-semibold tracking-tight">
                코드 보관 설정
              </h1>
              <p className="text-sm text-muted-foreground">
                리뷰 기록과 프라이버시 기준을 한 번에 선택해요.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`rounded-full px-2.5 py-1 text-[11px] ${badgeClasses}`}
                >
                  {isOn ? (
                    <span className="inline-flex items-center gap-1.5">
                      <FileCode2 className="h-3 w-3" />
                      코드와 함께 보관
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <EyeOff className="h-3 w-3" />
                      결과만 보관
                    </span>
                  )}
                </Badge>

                <div className="hidden md:inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                  <History className="h-3 w-3" />
                  <span>Playground · VS Code와 공유</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Card */}
        <Card className="relative overflow-hidden border border-border/70 bg-background/70 backdrop-blur">
          {/* ✅ 은은한 톤 글로우 */}
          <div
            className={[
              "pointer-events-none absolute -top-24 left-1/2 h-56 w-[44rem] -translate-x-1/2 rounded-full blur-3xl",
              tone === "emerald" ? "bg-emerald-500/10" : "bg-rose-500/10",
            ].join(" ")}
          />

          <CardHeader className="relative pb-4">
            <CardTitle className="text-base md:text-lg font-semibold">
              원문 코드 보관 방식
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              이 설정은 “이후 생성되는 리뷰”부터 적용돼요.
            </p>
          </CardHeader>

          <CardContent className="relative space-y-4">
            {/* ✅ 토글 영역을 더 “가시적으로” */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleModeChange(!isOn)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleModeChange(!isOn);
              }}
              aria-disabled={saving || storeCode === null}
              className={[
                "group w-full rounded-2xl border p-4 md:p-5",
                "transition-all duration-200",
                "hover:shadow-lg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                saving || storeCode === null
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer",
                isOn
                  ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60 hover:shadow-emerald-500/10"
                  : "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60 hover:shadow-rose-500/10",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left */}
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div
                    className={[
                      "shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center",
                      isOn
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-300",
                    ].join(" ")}
                  >
                    {isOn ? (
                      <FileCode2 className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm md:text-base font-semibold">
                        {isOn ? "코드와 리뷰 모두 저장" : "리뷰 결과만 저장"}
                      </div>
                      <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        {isOn ? "분석 기록 강화" : "프라이버시 우선"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {hintText}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div
                  className="flex items-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="hidden sm:flex flex-col items-end leading-none">
                    <span className="text-[11px] text-muted-foreground">
                      {isOn ? "저장 ON" : "저장 OFF"}
                    </span>
                    <span className="mt-1 text-[11px] text-muted-foreground">
                      클릭/스위치로 변경
                    </span>
                  </div>

                  <Switch
                    id="store-code"
                    checked={isOn}
                    disabled={saving || storeCode === null}
                    onCheckedChange={handleModeChange}
                    className={switchClasses}
                  />
                </div>
              </div>

              {/* ✅ 하단 서브 포인트(가시성) */}
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <div className="rounded-xl border bg-background/60 px-3 py-2 text-[12px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    저장 시
                  </span>{" "}
                  리뷰 재현/비교가 쉬워져요.
                </div>
                <div className="rounded-xl border bg-background/60 px-3 py-2 text-[12px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    미저장 시
                  </span>{" "}
                  민감 코드 노출을 줄여요.
                </div>
              </div>
            </div>

            <Separator />

            {/* Footer line: info + saving + error */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground">
              <div className="inline-flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>이후 생성되는 리뷰부터 이 설정이 적용돼요.</span>
              </div>

              <div className="flex items-center gap-2">
                {saving && (
                  <div className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>저장 중…</span>
                  </div>
                )}
                {error && (
                  <div className="inline-flex items-center gap-1.5 text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
