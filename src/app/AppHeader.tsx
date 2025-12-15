// src/layouts/AppHeader.tsx
import { useEffect, useMemo, useState, Fragment } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Info, DownloadCloud, LayoutDashboard } from "lucide-react";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { AuthMenu } from "@/features/auth/AuthMenu";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";

import { pickHeaderLogo } from "@/constants/headerLogo";

const NAV_ITEMS = [
  { label: "홈", labelEn: "Home", to: "/", icon: Home },
  { label: "DKMV란?", labelEn: "About", to: "/about", icon: Info },
  {
    label: "다운로드",
    labelEn: "Download",
    to: "/download",
    icon: DownloadCloud,
  },
  {
    label: "대시보드",
    labelEn: "Dashboard",
    to: "/mypage/dashboard",
    icon: LayoutDashboard,
    requiresAuth: true as const,
  },
];

export default function AppHeader() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  /** ✅ 경로에 따른 헤더 로고 선택 */
  const headerLogoSrc = useMemo(() => pickHeaderLogo(pathname), [pathname]);

  /** ✅ 로고 클릭 시: 마이페이지면 대시보드, 아니면 랜딩 */
  const logoLinkTo = useMemo(() => {
    return pathname.startsWith("/mypage") ? "/mypage/dashboard" : "/";
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full
      relative h-26 flex items-center border-b border-slate-200 dark:border-slate-800
      bg-white/70 dark:bg-slate-950/60 backdrop-blur
      supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-slate-950/40
      animate-header-enter transform-gpu transition-[opacity,transform] duration-500 ease-out
      ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
    >
      {/* 🔥 아래 보라빛 스캔 라인 */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-[2px] h-[3px] overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-violet-500/0 via-violet-400 to-violet-500/0 bg-[length:200%_100%] animate-header-border-sheen" />
      </div>

      {/* 🔵 로고 (왼쪽 고정) */}
      <div
        className={`absolute left-10 flex items-center gap-2 transform-gpu transition-[opacity,transform] duration-500 ease-out
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
        style={{ transitionDelay: mounted ? "60ms" : "0ms" }}
      >
        <Link
          to={logoLinkTo}
          className="inline-flex items-center gap-2 select-none"
        >
          <img
            src={headerLogoSrc}
            alt="DKMV"
            width={24}
            height={24}
            className="h-16 w-16 object-contain rounded-md transform-gpu animate-[logo-bounce_3.2s_ease-in-out_infinite]"
            loading="eager"
            decoding="async"
          />
          <span className="text-3xl font-bold tracking-wide text-slate-900 dark:text-slate-100">
            DKMV
          </span>
        </Link>
      </div>

      {/* 🟣 중앙 네비게이션 */}
      <nav
        className={`flex-1 flex items-center justify-center text-sm font-medium gap-4
        transform-gpu transition-[opacity,transform] duration-500 ease-out
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
        style={{ transitionDelay: mounted ? "110ms" : "0ms" }}
      >
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <Fragment key={item.to}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="h-7 w-px bg-slate-200/80 dark:bg-slate-700/80 rounded-full"
                />
              )}

              <NavLink
                to={item.to}
                onClick={(e) => {
                  if (item.requiresAuth && !isAuthenticated) {
                    e.preventDefault();
                    toast.warning("로그인 후 이용 가능한 메뉴입니다.");
                    navigate("/login");
                    return;
                  }
                }}
                className={({ isActive }) =>
                  [
                    "group relative inline-flex items-center p-2 rounded-md transition-all select-none cursor-pointer",
                    "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                    "hover:bg-slate-100/80 dark:hover:bg-slate-800/70",
                    "after:absolute after:inset-x-2 after:-bottom-1 after:h-0.5 after:rounded-full",
                    "after:bg-violet-500 after:scale-x-0 after:origin-center after:transition-transform after:duration-200",
                    isActive
                      ? "text-violet-500 dark:text-white/80 after:scale-x-100 bg-violet-500/5 dark:bg-violet-500/10"
                      : "",
                  ].join(" ")
                }
              >
                <span className="inline-flex items-center gap-1.5 overflow-hidden">
                  <Icon className="h-7 w-7 transition-transform duration-200 ease-out" />
                  <span
                    className="text-[1rem] whitespace-nowrap max-w-0 opacity-0 translate-y-0.5
                    group-hover:max-w-[6rem] group-hover:opacity-100 group-hover:translate-y-0
                    transition-all duration-800 ease"
                  >
                    {item.label}
                  </span>
                </span>
              </NavLink>
            </Fragment>
          );
        })}
      </nav>

      {/* 🟡 우측 액션 */}
      <div
        className={`absolute right-6 flex items-center gap-2 transform-gpu transition-[opacity,transform] duration-500 ease-out
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
        style={{ transitionDelay: mounted ? "160ms" : "0ms" }}
      >
        <AnimatedThemeToggler className="cursor-pointer transition-transform duration-200 ease-out hover:scale-115" />
        <AuthMenu className="ml-4" />
      </div>
    </header>
  );
}
