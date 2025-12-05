// src/api/client.ts

// 공용 쿼리 파라미터 타입
export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

// 공용 에러 타입
export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// ─────────────────────────────
// API Base 설정
// ─────────────────────────────

const RAW_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const IS_DEV = import.meta.env.DEV;

/**
 * dev:
 *  - 무조건 "/api" 사용해서 Vite proxy 타게 만들기
 *
 * prod:
 *  - VITE_API_BASE_URL 있으면 그걸 사용 (예: "https://api.dkmv.app" 혹은 "/api")
 *  - 없으면 "/api"
 */
const API_BASE = IS_DEV
  ? "/api"
  : (RAW_BASE && RAW_BASE.replace(/\/+$/, "")) || "/api";

// ─────────────────────────────
// 내부 유틸: URL 빌더
// ─────────────────────────────

function buildUrl(path: string, query?: QueryParams): string {
  // path 앞에 슬래시 없으면 붙여주기
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(API_BASE + normalizedPath, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

// ─────────────────────────────
// 핵심 request 함수
// ─────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  query?: QueryParams;
  body?: unknown;
  // 기본값: include (쿠키 기반 인증 쓰고 있으니까)
  credentials?: RequestCredentials;
  headers?: HeadersInit;
};

export async function request<TResponse>(
  path: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const {
    method = "GET",
    query,
    body,
    credentials = "include",
    headers = {},
  } = options;

  const url = buildUrl(path, query);

  const finalHeaders: HeadersInit = {
    accept: "application/json",
    ...headers,
  };

  let payload: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    payload = JSON.stringify(body);
    (finalHeaders as Record<string, string>)["Content-Type"] =
      "application/json";
  }

  console.log("[api] request:", method, url);

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: payload,
    credentials,
  });

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      // ignore
    }

    const message =
      (errorBody as any)?.detail ||
      `API 요청 실패 (${res.status} ${res.statusText})`;

    throw new ApiError(res.status, message, errorBody);
  }

  // 204 No Content 같은 경우
  if (res.status === 204) {
    return undefined as TResponse;
  }

  const data = (await res.json()) as TResponse;
  return data;
}

// ─────────────────────────────
// 편의 헬퍼 (GET/POST/PUT/PATCH/DELETE)
// ─────────────────────────────

export const api = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T, B = unknown>(
    path: string,
    body?: B,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(path, { ...options, method: "POST", body });
  },

  put<T, B = unknown>(
    path: string,
    body?: B,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(path, { ...options, method: "PUT", body });
  },

  patch<T, B = unknown>(
    path: string,
    body?: B,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
