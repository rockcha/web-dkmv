// src/pages/Trends.tsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/features/auth/token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  bodyText: string;
};

export default function Trends() {
  const [url, setUrl] = useState(
    "http://18.205.229.159:8000/v1/reviews/me" // 기본 테스트용
  );
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [body, setBody] = useState<string>(""); // POST/PUT 등에서만 사용
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const handleSend = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      };

      // 토큰 자동 붙이기
      const token = getToken();
      if (token) {
        (headers as any).Authorization = `Bearer ${token}`;
      }

      // body가 필요한 메서드만 body 전송
      const hasBody = method !== "GET" && method !== "DELETE";

      if (hasBody && body.trim()) {
        (headers as any)["Content-Type"] = "application/json";
      }

      const res = await fetch(url, {
        method,
        headers,
        body: hasBody && body.trim() ? body : undefined,
      });

      const text = await res.text();

      // 헤더를 보기 좋게 객체로 변환
      const headersObj: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: headersObj,
        bodyText: text,
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const prettyBody = (() => {
    if (!response) return "";
    try {
      // JSON이면 이쁘게
      const parsed = JSON.parse(response.bodyText);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // JSON 아니면 그냥 텍스트
      return response.bodyText;
    }
  })();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API 호출 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            URL이랑 메서드, (필요하면) 요청 바디를 입력해서 백엔드 응답을 그대로
            확인하는 디버깅용 페이지입니다.
          </p>

          {/* 메서드 + URL */}
          <div className="flex flex-col gap-2 md:flex-row">
            <select
              className="w-full md:w-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <Input
              className="flex-1"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000/v1/..."
            />
          </div>

          {/* 요청 바디 (GET/DELETE 제외) */}
          {method !== "GET" && method !== "DELETE" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Request Body (JSON)</span>
                <span>옵션</span>
              </div>
              <Textarea
                className="font-mono text-xs"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`{\n  "example": 123\n}`}
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={isLoading}>
              {isLoading ? "요청 보내는 중..." : "요청 보내기"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 응답 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/5 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!error && !response && !isLoading && (
            <div className="h-32 grid place-items-center text-sm text-slate-500">
              아직 응답이 없습니다. 위에서 요청을 보내보세요.
            </div>
          )}

          {response && (
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-semibold">Status: </span>
                <span
                  className={
                    response.status >= 200 && response.status < 300
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                >
                  {response.status} {response.statusText}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-300">Headers</div>
                <pre className="max-h-40 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-200">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-300">Body</div>
                <pre className="max-h-[400px] overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-200">
                  {prettyBody}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
