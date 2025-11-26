// src/features/auth/authApi.ts
import { getToken } from "@/features/auth/token";

/**
 * 🔥 핵심: Vercel 환경에서 HTTPS → HTTP 요청은 차단되므로
 *        백엔드를 직접 호출하지 않고 반드시 `/api` 경유.
 *
 * vercel.json의 rewrites:
 *   /api/* → http://18.205.229.159:8000/*
 */
const BACKEND_BASE = "/api";

/**
 * 🔁 GitHub 로그인 플로우 타입
 */
export type GithubLoginFlow = "web" | "signup" | "extension";

/**
 * 🔧 현재 프론트의 origin을 state에 포함
 */
function buildState(flow: GithubLoginFlow) {
  const origin = window.location.origin;
  return `${flow}:${origin}`;
}

/**
 * 🌐 전체 페이지 GitHub 로그인
 */
export function startGithubLogin(flow: GithubLoginFlow = "web") {
  const state = buildState(flow);

  const url = `${BACKEND_BASE}/auth/github/login?state=${encodeURIComponent(
    state
  )}`;

  window.location.href = url;
}

/**
 * 🌐 팝업 GitHub 계정 연동
 */
export function startGithubLoginPopup(flow: "signup" | "web" = "signup") {
  const state = buildState(flow);

  const url = `${BACKEND_BASE}/auth/github/login?state=${encodeURIComponent(
    state
  )}`;

  return window.open(
    url,
    "github_oauth_popup",
    "width=500,height=650,menubar=no,toolbar=no"
  );
}

/**
 * 🟣 VS Code에 로그인한 유저용 토큰 발급
 */
export async function mintVscodeToken(): Promise<string> {
  const jwt = getToken();
  if (!jwt) {
    throw new Error("로그인된 상태가 아닙니다. 먼저 GitHub로 로그인해주세요.");
  }

  const res = await fetch(`${BACKEND_BASE}/auth/github/vscode/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!res.ok) {
    throw new Error(`토큰 발급 실패 (HTTP ${res.status})`);
  }

  const json = await res.json();
  const token = json?.token;

  if (!token || typeof token !== "string") {
    throw new Error("응답에서 token 값을 찾을 수 없습니다.");
  }

  return token;
}

/**
 * 🧪 debug mint (로컬 테스트 용)
 */
export async function mintDebugTokenByUserId(userId: number): Promise<string> {
  const res = await fetch(
    `${BACKEND_BASE}/auth/github/debug/mint?user_id=${userId}`
  );

  if (!res.ok) {
    throw new Error("디버그 토큰 발급 실패");
  }

  const json = await res.json();
  const token = json?.token;

  if (!token || typeof token !== "string") {
    throw new Error("응답에서 token을 찾을 수 없습니다.");
  }

  return token;
}

/**
 * 🚪 로그아웃
 */
export async function logoutGithub() {
  try {
    await fetch(`${BACKEND_BASE}/auth/github/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    console.error("로그아웃 요청 실패", e);
  }
}
