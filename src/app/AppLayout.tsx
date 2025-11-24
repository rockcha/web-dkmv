// src/layouts/AppLayout.tsx
import * as React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

import AppHeader from "./AppHeader";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import FloatingCreateButton from "@/components/FloatingCreateButton";
import { DummyDataProvider } from "@/components/DummyDataContext";

import {
  LayoutDashboard,
  ListChecks,
  GitCompare,
  LineChart,
  Trophy,
  FlaskConical,
  FileBarChart,
  Settings as SettingsIcon,
} from "lucide-react";

/** ===== 네비 아이템 ===== */
type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { to: "/analyses", label: "분석 내역", icon: ListChecks },
  { to: "/compare", label: "모델 비교", icon: GitCompare },
  { to: "/trends", label: "성장 추이", icon: LineChart },
  { to: "/leaderboard", label: "랭킹", icon: Trophy },
  { to: "/playground", label: "플레이그라운드", icon: FlaskConical },
  { to: "/reports", label: "리포트", icon: FileBarChart },
  { to: "/settings", label: "설정", icon: SettingsIcon },
];

export default function AppLayout() {
  const { pathname } = useLocation();

  /** ✅ 랜딩(/, /landing)에서는 헤더만 보이게 */
  const isLanding = pathname === "/" || pathname.startsWith("/landing");
  if (isLanding) {
    return (
      <div
        className="
          min-h-screen w-full
          bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100
          grid grid-rows-[auto_1fr]
          text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed
        "
      >
        <AppHeader />
        <main className="p-0">
          <Outlet />
        </main>
      </div>
    );
  }

  /** 현재 페이지 타이틀/아이콘 계산(상세 경로 대응) */
  const current =
    NAV_ITEMS.find((n) => pathname === n.to) ??
    NAV_ITEMS.find((n) => pathname.startsWith(n.to));
  const CurrentIcon = current?.icon ?? LayoutDashboard;

  return (
    <DummyDataProvider>
      <div
        className="
          min-h-screen w-full
          bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100
          grid grid-rows-[auto_1fr]
          text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed
        "
      >
        {/* 헤더 */}
        <AppHeader />

        <div className="grid grid-cols-[260px_1fr] md:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
          {/* ========== 사이드바 ========== */}
          <aside className="border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-56px)] sticky top-14">
            <TooltipProvider delayDuration={100}>
              <ScrollArea className="h-full">
                <nav className="px-4 py-5" aria-label="주 메뉴">
                  <p className="px-1 pb-3 text-[12px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    메뉴
                  </p>

                  <ul className="space-y-1.5">
                    {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <NavLink
                          to={to}
                          className={({ isActive }: { isActive: boolean }) =>
                            [
                              "group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-[15px] md:text-base transition",
                              // hover (라이트/다크)
                              "hover:bg-slate-100 hover:text-slate-900",
                              "dark:hover:bg-slate-900 dark:hover:text-slate-100",
                              // active (더 또렷하게)
                              isActive
                                ? [
                                    "font-semibold",
                                    "bg-slate-100 text-slate-900 ring-1 ring-slate-200",
                                    "dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800",
                                    // 왼쪽 포인트 인디케이터
                                    "before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1.5 before:rounded-full before:bg-violet-500",
                                  ].join(" ")
                                : "text-slate-600 dark:text-slate-300",
                            ].join(" ")
                          }
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center justify-center">
                                <Icon className="size-5 transition-transform group-hover:scale-110" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="hidden md:block"
                            >
                              {label}
                            </TooltipContent>
                          </Tooltip>
                          <span className="truncate">{label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>

                  <Separator className="my-5 bg-slate-200 dark:bg-slate-800" />

                  <p className="px-1 pt-1 text-[12px] text-slate-500 dark:text-slate-400">
                    Don’t Kill My Vibe
                  </p>
                </nav>
              </ScrollArea>
            </TooltipProvider>
          </aside>

          {/* ========== 메인 컨텐츠 ========== */}
          <main className="p-6 md:p-8">
            {/* 페이지 타이틀 */}
            <header
              className="mb-6 flex items-center gap-3"
              aria-label="페이지 제목"
            >
              <CurrentIcon className="size-6 text-violet-600 dark:text-violet-400" />
              <h1 className="text-2xl md:text-[26px] font-semibold">
                {current?.label ?? "페이지"}
              </h1>
            </header>

            <section aria-live="polite">
              <Outlet />
            </section>
          </main>
        </div>

        {/* 우측 하단 플로팅 더미 생성 버튼 */}
        <FloatingCreateButton />
      </div>
    </DummyDataProvider>
  );
}
