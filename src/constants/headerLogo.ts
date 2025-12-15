// src/constants/headerLogo.ts
export type HeaderLogoRule = {
  /** pathname이 이 prefix로 시작하면 매칭 */
  prefix: string;
  /** public 기준 src 경로 */
  src: string;
};

export const HEADER_LOGO_FALLBACK = "/logo3d.png";

/**
 * 우선순위: 위에서부터 먼저 매칭되는 규칙 적용
 * - /mypage/*: 각 페이지별 이미지
 * - /download, /about: 전용 이미지
 * - 그 외: 기본 로고
 */
export const HEADER_LOGO_RULES: HeaderLogoRule[] = [
  // mypage
  { prefix: "/mypage/dashboard", src: "/images/dashboard.png" },
  { prefix: "/mypage/analyses", src: "/images/analyses.png" }, // /mypage/analyses/:id 포함
  { prefix: "/mypage/compare", src: "/images/compare.png" },
  { prefix: "/mypage/leaderboard", src: "/images/leaderboard.png" },
  { prefix: "/mypage/playground", src: "/images/playground.png" },
  { prefix: "/mypage/settings", src: "/images/settings.png" },

  // public pages
  { prefix: "/download", src: "/images/download.png" },
  { prefix: "/about", src: "/images/about.png" },
  { prefix: "/login", src: "/images/login.png" },
];

export function pickHeaderLogo(pathname: string) {
  const rule = HEADER_LOGO_RULES.find((r) => pathname.startsWith(r.prefix));
  return rule?.src ?? HEADER_LOGO_FALLBACK;
}
