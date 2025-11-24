// src/layouts/AppHeader.tsx
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User2 } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const NAV_ITEMS = [
  { label: "홈", to: "/" },
  { label: "DKMV란?", to: "/about" },
  { label: "다운로드", to: "/download" },
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
        h-16
        flex items-center
        border-b border-slate-200 dark:border-slate-800
        bg-white/70 dark:bg-slate-950/60
        backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-slate-950/40
        animate-header-enter
        transform-gpu transition-all duration-500 ease-out
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
          transform-gpu transition-all duration-500 ease-out
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
          flex-1 flex items-center justify-center text-sm font-medium gap-6
          transform-gpu transition-all duration-500 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
        style={{ transitionDelay: mounted ? "110ms" : "0ms" }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "relative inline-flex items-center px-3 py-1 rounded-full transition-all select-none cursor-pointer",
                "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                "hover:bg-slate-100/80 dark:hover:bg-slate-800/70",
                // underline 애니메이션
                "after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:rounded-full",
                "after:bg-violet-500 after:scale-x-0 after:origin-center after:transition-transform after:duration-200",
                isActive
                  ? "text-violet-500 dark:text-violet-400 after:scale-x-100 bg-violet-500/5 dark:bg-violet-500/10"
                  : "",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 🟡 우측 액션 */}
      <div
        className={`
          absolute right-6 flex items-center gap-2
          transform-gpu transition-all duration-500 ease-out
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
        style={{ transitionDelay: mounted ? "160ms" : "0ms" }}
      >
        <AnimatedThemeToggler className="rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <User2 className="size-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
          >
            <DropdownMenuLabel>계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User2 className="mr-2 size-4" />
              <span>프로필 (준비중)</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogIn className="mr-2 size-4" />
              <span>로그인</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <LogOut className="mr-2 size-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
