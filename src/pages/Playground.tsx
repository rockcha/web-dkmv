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
  ex1: `# 리스트 원소 두 배 만들기 (Python)
arr = [1, 12, 3, 4, -5]
arr2 = [e * 2 for e in arr]

print(arr2)
print(arr)
`,
  ex2: `# 평균 계산 함수 예제
def calculate_average(nums):
    if not nums:
        return 0
    return sum(nums) / len(nums)

print(calculate_average([1, 2, 3, 4]))
`,
  ex3: `# 간단한 팩토리얼 함수
def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
`,
};

// 모델 선택용 옵션 (필수는 아니지만 meta.model에 같이 넣어 줌)
const MODEL_OPTIONS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "starcoder-15b", label: "StarCoder 15B" },
  { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
];

export default function Playground() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string>();
  const [code, setCode] = useState<string>("");

  const [modelId, setModelId] = useState<string>(MODEL_OPTIONS[0].id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [requestRaw, setRequestRaw] = useState<string>("");
  const [responseRaw, setResponseRaw] = useState<string>("");
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
      // ✅ 네가 보여준 예시 Request 구조 그대로 맞춘 payload
      const nowIso = new Date().toISOString();

      const payload = {
        meta: {
          id: null, // 예시에는 0 이었지만, null도 허용 타입( integer | null )
          version: "v1",
          actor: "web-playground",
          identity: {}, // additionalProp1 대신 빈 객체
          model: {
            // 예시에는 { "additionalProp1": {} } 였지만
            // 같은 "object" 타입이므로 이렇게 name만 둬도 스키마상 OK
            name: modelId,
          },
          analysis: {},
          result: {
            result_ref: "",
            error_message: "",
          },
          audit: {
            created_at: nowIso,
            updated_at: nowIso,
          },
        },
        body: {
          snippet: {
            code,
            // ✅ language는 항상 python으로 고정
            language: "python",
          },
          trigger: "manual", // enum 기본값
        },
      };

      setRequestRaw(JSON.stringify(payload, null, 2));

      const url = "/api/v1/reviews/request";

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });

      const text = await resp.text();
      setResponseInfo(`${resp.status} ${resp.statusText}  •  ${url}`);

      if (!resp.ok) {
        setResponseRaw(text || `HTTP ${resp.status}`);
        throw new Error(`HTTP ${resp.status}`);
      }

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

          {/* 샘플 코드 / 모델 선택 */}
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Select onValueChange={onPick} value={selected}>
                <SelectTrigger>
                  <SelectValue placeholder="코드 블록 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ex1">배열 두 배 만들기</SelectItem>
                  <SelectItem value="ex2">평균 계산 함수</SelectItem>
                  <SelectItem value="ex3">팩토리얼 함수</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 md:max-w-xs">
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Textarea
            className="min-h-[220px] font-mono text-sm"
            placeholder="여기에 코드를 붙여넣거나 샘플을 선택하세요. (language는 항상 python으로 전송)"
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
