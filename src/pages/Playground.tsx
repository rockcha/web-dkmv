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
  const { user } = useAuth(); // user_id 넣어주기
  const [selected, setSelected] = useState<string>();
  const [code, setCode] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // raw JSON 문자열
  const [requestRaw, setRequestRaw] = useState<string>("");
  const [responseRaw, setResponseRaw] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  const onPick = (val: string) => {
    setSelected(val);
    setCode(SAMPLES[val] ?? "");
  };

  const canRun = code.trim().length > 0 && !loading;

  const run = async () => {
    setError(null);
    setResponseRaw("");
    setRequestRaw("");
    setLoading(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // 언어/파일 경로 추론
      const meta = SAMPLE_META[selected ?? ""] ?? {
        language: "plaintext",
        file_path: "playground.txt",
      };

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
          // 현재 로그인 유저를 그대로 사용 (없으면 0)
          user_id: user?.id ?? 0,
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

      const resp = await fetch("/api/v1/reviews/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 토큰 인증이 필요하면 여기에서 Authorization 헤더 추가
          // Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });

      const text = await resp.text();

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
          <CardTitle>리뷰 생성 요청 (Playground)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            샘플 코드를 선택하거나 직접 코드를 입력한 뒤,{" "}
            <b>/v1/reviews/request</b> 로 요청을 보내 raw 응답을 확인합니다.
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

          <div className="flex items-center gap-2">
            <Button disabled={!canRun} onClick={run}>
              {loading ? "리뷰 생성 중..." : "리뷰 생성 요청 보내기"}
            </Button>
            <Button variant="secondary" disabled={!loading} onClick={stop}>
              중단
            </Button>
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
            <div className="text-sm font-medium">Response Body</div>
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
