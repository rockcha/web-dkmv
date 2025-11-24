// src/layouts/AppHeader.tsx
import { useEffect, useState, Fragment } from "react";
import { Link, NavLink } from "react-router-dom";

import { Home, Info, DownloadCloud, LayoutDashboard } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { AuthMenu } from "@/features/auth/AuthMenu";

const NAV_ITEMS = [
  { label: "홈", to: "/", icon: Home },
  { label: "DKMV란?", to: "/about", icon: Info },
  { label: "다운로드", to: "/download", icon: DownloadCloud },
  { label: "대시보드", to: "/mypage/dashboard", icon: LayoutDashboard }, // ✅ 추가
];

export default function AppHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header
      className={`
        relative
        h-24
        flex items-center
        border-b border-slate-200 dark:border-slate-800
        bg-white/70 dark:bg-slate-950/60
        backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-slate-950/40
        animate-header-enter
        transform-gpu
        transition-[opacity,transform] duration-500 ease-out
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
      `}
    >
      {/* 🔥 아래 보라빛 스캔 라인 */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-[2px] h-[3px] overflow-hidden">
        <div
          className="
            h-full w-full
            bg-gradient-to-r from-violet-500/0 via-violet-400 to-violet-500/0
            bg-[length:200%_100%]
            animate-header-border-sheen
          "
        />
      </div>

      {/* 🔵 로고 (왼쪽 고정) */}
      <div
        className={`
          absolute left-6 flex items-center gap-2
          transform-gpu
          transition-[opacity,transform] duration-500 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
        style={{ transitionDelay: mounted ? "60ms" : "0ms" }}
      >
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 select-none"
        >
          <img
            src="/logo.png"
            alt="DKMV"
            width={24}
            height={24}
            className="h-7 w-7 object-contain rounded-md"
            loading="eager"
            decoding="async"
          />
          <span className="font-bold tracking-wide text-slate-900 dark:text-slate-100">
            DKMV
          </span>
        </Link>
      </div>

      {/* 🟣 중앙 네비게이션 */}
      <nav
        className={`
          flex-1 flex items-center justify-center text-sm font-medium gap-4
          transform-gpu
          transition-[opacity,transform] duration-500 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
        style={{ transitionDelay: mounted ? "110ms" : "0ms" }}
      >
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;

          return (
            <Fragment key={item.to}>
              {/* 아이템 사이 separator */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="h-5 w-px bg-slate-200/80 dark:bg-slate-700/80 rounded-full"
                />
              )}

              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    "group relative inline-flex items-center px-2 py-1 rounded-full transition-all select-none cursor-pointer",
                    "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                    "hover:bg-slate-100/80 dark:hover:bg-slate-800/70",
                    // underline
                    "after:absolute after:inset-x-2 after:-bottom-1 after:h-0.5 after:rounded-full",
                    "after:bg-violet-500 after:scale-x-0 after:origin-center after:transition-transform after:duration-200",
                    isActive
                      ? "text-violet-500 dark:text-violet-400 after:scale-x-100 bg-violet-500/5 dark:bg-violet-500/10"
                      : "",
                  ].join(" ")
                }
              >
                <span className="inline-flex items-center gap-1.5 overflow-hidden">
                  {/* 👉 아이콘 */}
                  <Icon
                    className="
                      h-5 w-5
                      transition-transform duration-200 ease-out
                    "
                  />

                  {/* 👉 텍스트 */}
                  <span
                    className="
                      text-[0.8rem]
                      whitespace-nowrap
                      max-w-0 opacity-0 translate-y-0.5
                      group-hover:max-w-[6rem] group-hover:opacity-100 group-hover:translate-y-0
                      transition-all duration-800 ease
                    "
                  >
                    {item.label}
                  </span>
                </span>
              </NavLink>
            </Fragment>
          );
        })}
      </nav>

      {/* 🟡 우측 액션 : 다크모드 토글 + AuthMenu */}
      <div
        className={`
          absolute right-6 flex items-center gap-2
          transform-gpu
          transition-[opacity,transform] duration-500 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
        style={{ transitionDelay: mounted ? "160ms" : "0ms" }}
      >
        <AnimatedThemeToggler className="rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" />
        <AuthMenu />
      </div>
    </header>
  );
}
