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
} from "lucide-react";

const STORE_CODE_ENDPOINT = "/api/v1/users/me/store-code";

export default function Settings() {
  const { user, setUserStoreCode } = useAuth();

  const [storeCode, setStoreCode] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // /me 에서 가져온 초기값 세팅
  useEffect(() => {
    if (user) {
      setStoreCode(user.store_code ?? false);
    }
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

    // 낙관적 업데이트
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

      if (!res.ok) {
        throw new Error("failed to save setting");
      }

      setUserStoreCode(checked);
    } catch (e) {
      console.error("[Settings] failed to save setting", e);
      // 실패 시 롤백
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

  // 모드별 색/스타일
  const modeCardClasses = isOn
    ? "border-emerald-500/60 bg-emerald-500/5 hover:border-emerald-500/80"
    : "border-rose-500/60 bg-rose-500/5 hover:border-rose-500/80";

  const modeIconWrapperClasses = isOn
    ? "bg-emerald-500/10 text-emerald-500"
    : "bg-rose-500/10 text-rose-500";

  const modeTitleClasses = isOn ? "text-emerald-600" : "text-rose-600";

  const badgeClasses = isOn
    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-500"
    : "border-rose-500/60 bg-rose-500/10 text-rose-500";

  const switchClasses =
    "cursor-pointer data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500/80";

  return (
    <div className="max-w-2xl py-4 md:py-6">
      {/* 헤더 - 미니멀 */}
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              코드 보관 설정
            </h1>
            <p className="text-xs text-muted-foreground">
              계정 전체에 한 번에 적용돼요.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">
          <History className="h-3 w-3" />
          <span>Playground · VS Code와 공유</span>
        </div>
      </header>

      <Card className="border border-border/70">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              원문 코드 보관 방식
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              리뷰 기록 vs 프라이버시 기준을 고를 수 있어요.
            </p>
          </div>

          {/* 현재 모드 뱃지 (아이콘 + 색상 강조) */}
          <Badge
            variant="outline"
            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] md:inline-flex ${badgeClasses}`}
          >
            {isOn ? (
              <>
                <FileCode2 className="h-3 w-3" />
                <span>코드와 함께 보관</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3" />
                <span>결과만 보관</span>
              </>
            )}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 메인 설정 영역 - 전체 클릭 가능 */}
          <button
            type="button"
            onClick={() => handleModeChange(!isOn)}
            disabled={saving || storeCode === null}
            className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${modeCardClasses}`}
          >
            {/* 왼쪽: 아이콘 중심 레이아웃 */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${modeIconWrapperClasses}`}
              >
                {isOn ? (
                  <FileCode2 className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className={`text-xs font-semibold ${modeTitleClasses}`}>
                  {isOn ? "코드와 리뷰 모두 저장" : "리뷰 결과만 저장"}
                </div>
                <p className="text-xs text-muted-foreground">{hintText}</p>
              </div>
            </div>

            {/* 오른쪽: Switch (버블 방지) */}
            <div
              className="flex flex-col items-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[11px] text-muted-foreground">
                {isOn ? "저장 ON" : "저장 OFF"}
              </span>
              <Switch
                id="store-code"
                checked={isOn}
                disabled={saving || storeCode === null}
                onCheckedChange={handleModeChange}
                className={switchClasses}
              />
            </div>
          </button>

          <Separator className="my-2" />

          {/* 하단 정보 / 로딩 / 에러 */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <div className="inline-flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              <span>이후 생성되는 리뷰부터 이 설정이 적용돼요.</span>
            </div>

            <div className="flex items-center gap-2">
              {saving && (
                <div className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>저장 중…</span>
                </div>
              )}
              {error && (
                <div className="inline-flex items-center gap-1.5 text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
