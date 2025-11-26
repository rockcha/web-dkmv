// src/features/auth/authApi.ts
import { getToken } from "@/features/auth/token";

const BACKEND_BASE =
  import.meta.env.VITE_BACKEND_URL || "http://18.205.229.159:8000";

/**
 * 🔁 GitHub 로그인 플로우 타입
 * - "web"      : 웹 로그인 (기존)
 * - "signup"   : 웹에서 팝업으로 계정 연동
 * - "extension": VS Code 익스텐션에서 연 로그인 플로우 (현재는 사용 안 해도 됨)
 */
export type GithubLoginFlow = "web" | "signup" | "extension";

// ✅ 현재 프론트의 origin을 state에 같이 실어보내는 헬퍼
function buildState(flow: GithubLoginFlow) {
  const origin = window.location.origin; // 예: http://localhost:3000, https://web-dkmv.vercel.app
  return `${flow}:${origin}`;
}

// ✅ 전체 페이지 리다이렉트용 (로그인 화면에서 사용)
export function startGithubLogin(flow: GithubLoginFlow = "web") {
  const state = buildState(flow);

  const url = `${BACKEND_BASE}/auth/github/login?state=${encodeURIComponent(
    state
  )}`;
  window.location.href = url;
}

// ✅ 팝업용 (회원가입 화면에서 GitHub 연동 버튼)
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

// ✅ VS Code용 토큰 발급 (웹에서 로그인된 상태에서 호출)
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

// ✅ 디버그 토큰 발급: user_id 기준으로 JWT 받아오기
export async function mintDebugTokenByUserId(userId: number): Promise<string> {
  const url = `${BACKEND_BASE}/auth/github/debug/mint?user_id=${userId}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("디버그 토큰 발급 실패");
  }

  const json = await res.json();

  // 🔥 app/routers/auth.py 기준: { "token": "<JWT>" }
  const token = json?.token;
  if (!token || typeof token !== "string") {
    throw new Error("응답에서 token을 찾을 수 없습니다.");
  }

  return token;
}

// 로그아웃은 JWT 때는 서버쪽 처리 + 토큰 제거만 해도 됨
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
