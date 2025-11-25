// src/features/auth/authApi.ts
const BACKEND_BASE =
  import.meta.env.VITE_BACKEND_URL || "http://18.205.229.159:8000";

// 전체 페이지 리다이렉트용 (로그인 화면에서 사용)
export function startGithubLogin(state: string = "web") {
  const url = `${BACKEND_BASE}/auth/github/login?state=${encodeURIComponent(
    state
  )}`;
  window.location.href = url;
}

// 팝업용 (회원가입 화면에서 GitHub 연동 버튼)
export function startGithubLoginPopup(state: string = "signup") {
  const url = `${BACKEND_BASE}/auth/github/login?state=${encodeURIComponent(
    state
  )}`;

  return window.open(
    url,
    "github_oauth_popup",
    "width=500,height=650,menubar=no,toolbar=no"
  );
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
