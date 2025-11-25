// src/pages/Playground.tsx
"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/AuthContext";

const SAMPLES: Record<string, string> = {
  ex1: `// 서비스 레이어 예제 (TS)
export async function getUser(id: string) {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error('Failed');
  return res.json();
}
`,
  ex2: `// 리액트 훅 예제
import { useEffect, useState } from 'react';
export function useWindowSize() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  return w;
}
`,
  ex3: `# 파이썬 스크립트
def calculate_average(nums):
    if not nums:
        return 0
    return sum(nums) / len(nums)
`,
};

// 샘플별 언어/파일 경로 메타 (없으면 기본값 사용)
const SAMPLE_META: Record<string, { language: string; file_path: string }> = {
  ex1: { language: "typescript", file_path: "example-service.ts" },
  ex2: { language: "typescript", file_path: "useWindowSize.ts" },
  ex3: { language: "python", file_path: "example.py" },
};

export default function Playground() {
  const { user } = useAuth(); // 현재 로그인 유저
  const [selected, setSelected] = useState<string>();
  const [code, setCode] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // raw JSON 문자열
  const [requestRaw, setRequestRaw] = useState<string>("");
  const [responseRaw, setResponseRaw] = useState<string>("");

  // 응답 메타 (status, url)
  const [responseInfo, setResponseInfo] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  const onPick = (val: string) => {
    setSelected(val);
    setCode(SAMPLES[val] ?? "");
  };

  const canRun = code.trim().length > 0 && !loading && !!user;

  const run = async () => {
    setError(null);
    setResponseRaw("");
    setRequestRaw("");
    setResponseInfo("");
    setLoading(true);

    if (!user) {
      setError("로그인이 되어 있지 않습니다. 먼저 로그인해 주세요.");
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // 언어/파일 경로 추론
      const meta = SAMPLE_META[selected ?? ""] ?? {
        language: "plaintext",
        file_path: "playground.txt",
      };

      // 👇 리뷰 생성 요청 payload
      const payload = {
        meta: {
          version: "v1",
          ts: new Date().toISOString(),
          correlation_id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : String(Date.now()),
          actor: "web-playground",
          identity: null,
          model: { name: "starcoder-15b" },
          analysis: {
            aspects: ["Bug", "Performance", "Style"],
            total_steps: 6,
          },
          progress: { status: "pending", next_step: 1 },
          result: null,
          audit: null,
        },
        body: {
          // 현재 로그인 유저
          user_id: user.id,
          snippet: {
            code,
            language: meta.language,
            file_path: meta.file_path,
          },
          trigger: "manual",
        },
      };

      // 요청 JSON을 화면에 표시
      setRequestRaw(JSON.stringify(payload, null, 2));

      const url = "/api/v1/reviews/request";

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 필요하면 Authorization 헤더 추가 가능
          // Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });

      const text = await resp.text();
      setResponseInfo(`${resp.status} ${resp.statusText}  •  ${url}`);

      if (!resp.ok) {
        // 에러 응답도 그대로 raw로 보여주기
        setResponseRaw(text || `HTTP ${resp.status}`);
        throw new Error(`HTTP ${resp.status}`);
      }

      // JSON이면 예쁘게, 아니면 그냥 텍스트
      try {
        const parsed = JSON.parse(text);
        setResponseRaw(JSON.stringify(parsed, null, 2));
      } catch {
        setResponseRaw(text);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? String(e));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* 입력 카드 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle>리뷰 생성 요청 Playground</CardTitle>

            <div className="flex items-center gap-2 text-xs md:text-sm">
              {user ? (
                <>
                  <span className="text-muted-foreground">현재 사용자</span>
                  <Badge variant="secondary">
                    id: {user.id} · {user.login ?? "unknown"}
                  </Badge>
                </>
              ) : (
                <Badge variant="destructive">
                  로그인되어 있지 않습니다. (요청 버튼 비활성화)
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            샘플 코드를 선택하거나 직접 코드를 입력한 뒤{" "}
            <code className="rounded bg-slate-900/40 px-1.5 py-0.5 text-xs">
              POST /v1/reviews/request
            </code>{" "}
            로 요청을 보내고, Request / Response Raw JSON 을 확인합니다.
          </p>

          <Select onValueChange={onPick} value={selected}>
            <SelectTrigger>
              <SelectValue placeholder="코드 블록 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ex1">서비스 레이어 예제 (TS)</SelectItem>
              <SelectItem value="ex2">리액트 훅 예제</SelectItem>
              <SelectItem value="ex3">파이썬 스크립트</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            className="min-h-[220px] font-mono text-sm"
            placeholder="여기에 코드를 붙여넣거나 샘플을 선택하세요."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={!canRun} onClick={run}>
              {loading ? "리뷰 생성 중..." : "리뷰 생성 요청 보내기"}
            </Button>
            <Button variant="secondary" disabled={!loading} onClick={stop}>
              중단
            </Button>

            {!user && (
              <span className="text-xs text-red-400">
                * 로그인 후에만 요청을 보낼 수 있습니다.
              </span>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-400">에러: {String(error)}</div>
          )}
        </CardContent>
      </Card>

      {/* Raw Request / Response 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>요청 / 응답 Raw JSON</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Request Body</div>
            <Textarea
              className="min-h-[260px] font-mono text-xs"
              value={requestRaw}
              readOnly
              placeholder="아직 요청을 보내지 않았습니다."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Response Body</div>
              {responseInfo && (
                <span className="text-[11px] text-muted-foreground">
                  {responseInfo}
                </span>
              )}
            </div>
            <Textarea
              className="min-h-[260px] font-mono text-xs"
              value={responseRaw}
              readOnly
              placeholder="응답이 여기에 표시됩니다."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
