// src/features/auth/authApi.ts
const BACKEND_BASE = "http://18.205.229.159:8000"; // TODO: 나중에 env로 빼기

// 전체 페이지 리다이렉트용 (로그인 화면에서 사용)
export function startGithubLogin(state: string = "web-login") {
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

// 로그아웃은 JWT 때는 서버쪽 처리 + 토큰 제거만 해도 됨
export async function logoutGithub() {
  try {
    await fetch(`${BACKEND_BASE}/auth/github/logout`, {
      method: "POST",
      credentials: "include", // 필요 없으면 빼도 됨
    });
  } catch (e) {
    console.error("로그아웃 요청 실패", e);
  }
}
