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

// 모델 선택용 옵션 (meta.model에 넣어줄 값 — string)
const MODEL_OPTIONS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "starcoder-15b", label: "StarCoder 15B" },
  { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
];

type Phase =
  | "idle"
  | "requesting" // 리뷰 생성 중 (POST)
  | "requested" // 리뷰 생성 완료
  | "fetching" // 서버에서 데이터 조회 중 (GET)
  | "fetched" // 조회 완료
  | "error";

export default function Playground() {
  const { user } = useAuth();

  const [selected, setSelected] = useState<string>();
  const [code, setCode] = useState<string>("");
  const [modelId, setModelId] = useState<string>(MODEL_OPTIONS[0].id);

  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastReviewId, setLastReviewId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  // POST body (ReviewRequest)
  const [requestRaw, setRequestRaw] = useState<string>("");

  // GET 응답 (실제 리뷰 RAW)
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
    setLastReviewId(null);
    setPhase("requesting");
    setLoading(true);

    if (!user) {
      setError("로그인이 되어 있지 않습니다. 먼저 로그인해 주세요.");
      setLoading(false);
      setPhase("error");
      return;
    }

    if (!user.github_id) {
      // 이 경우는 거의 없겠지만, 방어적으로 한 번 더 체크
      setError(
        "현재 사용자 github_id를 찾을 수 없습니다. 다시 로그인 후 시도해 주세요."
      );
      setLoading(false);
      setPhase("error");
      return;
    }

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const nowIso = new Date().toISOString();

      // 🔹 최신 Swagger 기준 ReviewRequest payload
      const payload = {
        meta: {
          // ✅ 백엔드 스펙: github_id string (깃허브 numeric ID)
          github_id: user.github_id,

          review_id: null as number | null,
          version: "v1",
          actor: "web-playground",

          // ✅ language / trigger는 meta에
          language: "python",
          trigger: "manual",

          code_fingerprint: null as string | null,
          model: modelId,

          // ✅ 아직 결과 없으니 null
          result: null as {
            result_ref: string | null;
            error_message: string | null;
          } | null,

          // ✅ string(date-time) 하나
          audit: nowIso as string,
        },
        body: {
          snippet: {
            // ✅ snippet은 code만 필요
            code,
          },
        },
      };

      setRequestRaw(JSON.stringify(payload, null, 2));

      // 1) 리뷰 생성 요청 (POST /v1/reviews/request)
      const postUrl = "/api/v1/reviews/request";

      const postResp = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });

      const postText = await postResp.text();
      if (!postResp.ok) {
        setResponseInfo(
          `${postResp.status} ${postResp.statusText} • ${postUrl}`
        );
        setResponseRaw(postText || `HTTP ${postResp.status}`);
        throw new Error(`리뷰 생성 실패 (HTTP ${postResp.status})`);
      }

      let reviewId: number | null = null;

      try {
        const parsed = JSON.parse(postText);
        // 🔸 ReviewRequestResponse: { meta, body: { review_id } } 가정
        reviewId = parsed?.body?.review_id ?? null;
        const status = parsed?.body?.status;
        setResponseInfo(
          `${postResp.status} ${
            postResp.statusText
          } • ${postUrl} • review_id: ${reviewId ?? "?"} • status: ${
            status ?? "unknown"
          }`
        );
      } catch {
        // JSON 아니면 그냥 info만 유지
      }

      if (reviewId == null) {
        throw new Error("리뷰 생성 응답에서 review_id를 찾을 수 없습니다.");
      }

      setPhase("requested");
      setLastReviewId(reviewId);

      // 2) 리뷰 상세 조회 (GET /v1/reviews/{review_id})
      setPhase("fetching");

      const getUrl = `/api/v1/reviews/${reviewId}`;
      const getResp = await fetch(getUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: ac.signal,
      });

      const getText = await getResp.text();
      const info = `${getResp.status} ${getResp.statusText} • ${getUrl}`;
      setResponseInfo(info);

      if (!getResp.ok) {
        setResponseRaw(getText || `HTTP ${getResp.status}`);
        throw new Error(`리뷰 조회 실패 (HTTP ${getResp.status})`);
      }

      try {
        const parsedGet = JSON.parse(getText);
        // 🔸 서버에서 넘겨주는 리뷰 JSON 그대로 보여줌
        setResponseRaw(JSON.stringify(parsedGet, null, 2));
      } catch {
        setResponseRaw(getText);
      }

      setPhase("fetched");
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? String(e));
        setPhase("error");
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
    setPhase("idle");
  };

  const primaryLabel =
    phase === "requesting"
      ? "리뷰 생성 중..."
      : phase === "fetching"
      ? "서버에서 데이터 조회 중..."
      : "리뷰 생성 요청 보내기";

  const phaseText = (() => {
    switch (phase) {
      case "requesting":
        return "1/4 • 리뷰 생성 중...";
      case "requested":
        return "2/4 • 리뷰 생성 완료 (review_id 확보)";
      case "fetching":
        return "3/4 • 서버에서 데이터 조회 중...";
      case "fetched":
        return "4/4 • 조회 완료!";
      case "error":
        return "에러가 발생했습니다. 로그를 확인해주세요.";
      default:
        return "";
    }
  })();

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
                    github_id: {user.github_id ?? "?"} · login:{" "}
                    {user.login ?? "unknown"}
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
            로 리뷰를 생성하고, 이어서{" "}
            <code className="rounded bg-slate-900/40 px-1.5 py-0.5 text-xs">
              GET /v1/reviews/&#123;review_id&#125;
            </code>{" "}
            로 실제 리뷰 내용을 조회합니다.
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

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button disabled={!canRun} onClick={run}>
                {primaryLabel}
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

            {phaseText && (
              <span className="text-xs text-muted-foreground">
                {phaseText}
                {lastReviewId != null && phase !== "idle" && (
                  <> (review_id: {lastReviewId})</>
                )}
              </span>
            )}

            {error && (
              <div className="text-sm text-red-400">에러: {String(error)}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Raw Request / Response 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>요청 / 응답 Raw JSON</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Request Body (POST /v1/reviews/request)
            </div>
            <Textarea
              className="min-h-[260px] font-mono text-xs"
              value={requestRaw}
              readOnly
              placeholder="아직 요청을 보내지 않았습니다."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">
                Response Body (GET /v1/reviews/&#123;review_id&#125;)
              </div>
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
