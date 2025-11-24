// src/features/auth/authApi.ts

// GitHub 로그인 시작 (브라우저 리다이렉트)
export function startGithubLogin(state: string = "native") {
  // 스펙상 기본 state가 "native" 라서 기본값을 native로 뒀어.
  const params = new URLSearchParams();
  if (state) params.set("state", state);

  // 같은 origin 기준 /auth/github/login 으로 바로 보냄
  const url = `/auth/github/login${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  window.location.href = url;
}

// GitHub 로그아웃 (쿠키 삭제)
// 실제 리다이렉트는 프론트에서 처리 (/main 또는 원하는 곳)
export async function logoutGithub() {
  try {
    await fetch("/auth/github/logout", {
      method: "POST",
      credentials: "include",
    });
    // 스펙에선 303 /ui/reviews 로 리다이렉트하지만,
    // fetch는 네비게이션을 안 바꾸니까 프론트에서 원하는 주소로 이동.
  } catch (e) {
    console.error("로그아웃 요청 실패", e);
  }
}

// 새 창(Popup)으로 GitHub OAuth 시작
export function startGithubLoginPopup(state: string = "native") {
  const url = `/auth/github/login?state=${state}`;
  window.open(
    url,
    "github_oauth_popup",
    "width=500,height=650,menubar=no,toolbar=no"
  );
}
