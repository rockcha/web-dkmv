// src/layouts/AppLayout.tsx
import * as React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

import AppHeader from "./AppHeader";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Toaster } from "@/components/ui/sonner";

/** ===== 네비 아이템 타입 ===== */
type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

/** ===== 네비게이션 아이템 목록 ===== */
const NAV_ITEMS: NavItem[] = [
  { to: "/mypage/dashboard", label: "대시보드", icon: LayoutDashboard },
  { to: "/mypage/analyses", label: "분석 내역", icon: ListChecks },
  { to: "/mypage/compare", label: "모델 비교", icon: GitCompare },
  { to: "/mypage/trends", label: "성장 추이", icon: LineChart },
  { to: "/mypage/leaderboard", label: "랭킹", icon: Trophy },
  { to: "/mypage/playground", label: "플레이그라운드", icon: FlaskConical },
  { to: "/mypage/reports", label: "리포트", icon: FileBarChart },
  { to: "/mypage/settings", label: "설정", icon: SettingsIcon },
];

export default function AppLayout() {
  const { pathname } = useLocation();

  /** 랜딩(/, /landing) */
  const isLanding = pathname === "/" || pathname.startsWith("/landing");

  /** 마이페이지 (/mypage/...) */
  const isMyPage = pathname.startsWith("/mypage");

  /** 마이페이지 사이드바 접힘 상태 */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <>
      {isLanding ? (
        // ───────── 랜딩 레이아웃 ─────────
        <div
          className="
            min-h-screen w-full
            bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100
            grid grid-rows-[auto_minmax(0,1fr)_auto]
            text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed
          "
        >
          <AppHeader />
          <main className="p-0 min-h-0">
            <Outlet />
          </main>
          <footer
            className="
              relative
              flex h-16 sm:h-20 items-center justify-center
              border-t border-slate-200 dark:border-slate-800
              px-6
              text-center text-xs sm:text-[0.8rem] text-slate-500 dark:text-slate-400
            "
          >
            <div className="pointer-events-none absolute inset-x-0 -top-[2px] h-[3px] overflow-hidden">
              <div
                className="
                  h-full w-full
                  bg-gradient-to-r from-violet-500/0 via-violet-400 to-violet-500/0
                  bg-[length:200%_100%]
                  animate-header-border-sheen
                "
              />
            </div>

            <div className="text-md">
              © {currentYear} DKMV — Don’t Kill My Vibe
            </div>
          </footer>
        </div>
      ) : isMyPage ? (
        // ───────── /mypage/* 레이아웃 ─────────
        <DummyDataProvider>
          <div
            className="
              min-h-screen w-full
              bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100
              grid grid-rows-[auto_1fr]
              text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed
            "
          >
            <AppHeader />

            <div className="grid grid-cols-[auto_1fr]">
              {/* ========== 사이드바 ========== */}
              <aside
                className={`
                  border-r border-slate-200 dark:border-slate-800
                  h-[calc(100vh-128px)]
                  sticky top-32
                  overflow-hidden
                  transition-[width] duration-300 ease-in-out
                  bg-white/90 dark:bg-slate-950/90
                  ${
                    isSidebarCollapsed
                      ? "w-[72px]"
                      : "w-[160px] md:w-[180px] xl:w-[200px]"
                  }
                `}
              >
                <ScrollArea className="h-full">
                  {/* 상단: 제목 + 접기/펼치기 버튼 */}
                  <div className="flex items-center justify-between px-3 pt-4 pb-2">
                    {!isSidebarCollapsed && (
                      <span className="px-1 text-[12px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        메뉴
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                      aria-label={
                        isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"
                      }
                      className="transition-all duration-300 ease hover:scale-110"
                    >
                      {isSidebarCollapsed ? (
                        <span className="inline-flex items-center justify-center animate-wiggle-right">
                          <ChevronsRight className="cursor-pointer ml-3 h-6 w-6 text-slate-700 dark:text-slate-200" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center animate-wiggle-left">
                          <ChevronsLeft className="cursor-pointer h-6 w-6 text-slate-700 dark:text-slate-200" />
                        </span>
                      )}
                    </button>
                  </div>

                  <nav className="px-2 pb-5" aria-label="주 메뉴">
                    <ul className="space-y-1.5">
                      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                        <li key={to}>
                          <NavLink
                            to={to}
                            className={({
                              isActive,
                            }: {
                              isActive: boolean;
                            }) => {
                              const base =
                                "group relative flex items-center rounded-lg border border-transparent px-3 py-3 text-[15px] md:text-base transition-all transform";
                              const layout = isSidebarCollapsed
                                ? "justify-center"
                                : "gap-3.5";

                              // 펼쳐진 상태에서의 hover
                              const hoverExpanded = isActive
                                ? ""
                                : `
                                  hover:bg-violet-50/90
                                  hover:text-violet-900
                                  hover:translate-x-1
                                  dark:hover:bg-violet-900/70
                                  dark:hover:text-violet-100
                                  hover:border-violet-200
                                  dark:hover:border-violet-500
                                  hover:shadow-sm
                                `;

                              // 접힌 상태에서는 배경/이동 없이 심플하게
                              const hoverCollapsed = isActive
                                ? ""
                                : "hover:bg-transparent";

                              const activeBase = isActive
                                ? `
                                    font-semibold text-white
                                    bg-violet-500 dark:bg-violet-500
                                    border-violet-500 shadow-sm shadow-violet-500/30
                                    translate-x-0.5
                                  `
                                : "text-slate-600 dark:text-slate-300";

                              return [
                                base,
                                layout,
                                isSidebarCollapsed
                                  ? hoverCollapsed
                                  : hoverExpanded,
                                activeBase,
                              ].join(" ");
                            }}
                          >
                            {/* 왼쪽 보라 인디케이터 바 (펼쳐진 상태에서만) */}
                            {!isSidebarCollapsed && (
                              <span
                                className="
                                  pointer-events-none
                                  absolute left-1 top-1/2 -translate-y-1/2
                                  h-7 w-[3px]
                                  rounded-full bg-violet-500
                                  origin-center
                                  scale-y-0 opacity-0
                                  transition-transform duration-300
                                  group-hover:scale-y-100
                                  group-hover:opacity-100
                                "
                              />
                            )}

                            {/* 아이콘 + 글로우 래퍼 */}
                            <span className="relative flex items-center justify-center">
                              {/* 아이콘 뒤 글로우 */}
                              <span
                                className={`
                                  absolute inset-0
                                  rounded-full
                                  bg-violet-500/8 dark:bg-violet-400/15
                                  blur-sm
                                  opacity-0
                                  transition-opacity duration-200
                                  ${isSidebarCollapsed ? "w-7 h-7" : "w-7 h-7"}
                                  group-hover:opacity-100
                                `}
                              />
                              <Icon
                                className={`
                                  relative z-10 size-5
                                  transition-all duration-200 ease-out
                                  ${
                                    isSidebarCollapsed
                                      ? "group-hover:scale-125 group-hover:-translate-y-0.5"
                                      : "group-hover:animate-wiggle-rotate group-hover:text-violet-600 dark:group-hover:text-violet-300"
                                  }
                                `}
                              />
                            </span>

                            {/* 라벨 + 밑줄 */}
                            <span
                              className={`
                                relative flex items-center truncate transition-all duration-300
                                ${
                                  isSidebarCollapsed
                                    ? "max-w-0 opacity-0 ml-0"
                                    : "max-w-[160px] opacity-100 ml-3"
                                }
                              `}
                            >
                              {/* 텍스트 */}
                              <span className="whitespace-nowrap">{label}</span>

                              {/* 보라 밑줄: 펼쳐져 있을 때만 슬라이드 인 */}
                              {!isSidebarCollapsed && (
                                <span
                                  className="
                                    pointer-events-none
                                    absolute -bottom-0.5 left-0
                                    h-[2px] w-full
                                    rounded-full bg-violet-500
                                    transform origin-left
                                    scale-x-0 -translate-x-2
                                    opacity-0
                                    transition-all duration-300 ease-out
                                    group-hover:scale-x-100
                                    group-hover:translate-x-0
                                    group-hover:opacity-100
                                  "
                                />
                              )}
                            </span>

                            {/* 접힌 상태에서 툴팁 */}
                            {isSidebarCollapsed && (
                              <span
                                className="
                                  pointer-events-none
                                  absolute left-full ml-2
                                  rounded-lg bg-slate-900/90 text-xs text-slate-50
                                  px-2 py-1
                                  opacity-0 translate-x-2
                                  group-hover:opacity-100
                                  group-hover:translate-x-0
                                  shadow-lg
                                  whitespace-nowrap
                                  z-50
                                "
                              >
                                {label}
                              </span>
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>

                    <Separator className="my-5 bg-slate-200 dark:bg-slate-800" />

                    {!isSidebarCollapsed && (
                      <p className="px-3 pt-1 text-[12px] text-slate-500 dark:text-slate-400">
                        Don’t Kill My Vibe
                      </p>
                    )}
                  </nav>
                </ScrollArea>
              </aside>

              {/* ========== 메인 컨텐츠 ========== */}
              <main className="p-6">
                <PageHeader pathname={pathname} />
                <section aria-live="polite">
                  <Outlet />
                </section>
              </main>
            </div>
          </div>
        </DummyDataProvider>
      ) : (
        // ───────── 일반 페이지 (/download, /about 등) ─────────
        <div
          className="
            min-h-screen w-full
            bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100
            grid grid-rows-[auto_1fr]
            text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed
          "
        >
          <AppHeader />
          <main>
            <Outlet />
          </main>
        </div>
      )}

      {/* 공통 Toaster */}
      <Toaster />
    </>
  );
}

/** 현재 페이지 타이틀/아이콘 계산 + 렌더 분리 */
function PageHeader({ pathname }: { pathname: string }) {
  const current =
    NAV_ITEMS.find((n) => pathname === n.to) ??
    NAV_ITEMS.find((n) => pathname.startsWith(n.to));

  const CurrentIcon = current?.icon ?? LayoutDashboard;

  return (
    <header className="flex items-center gap-3 mb-4" aria-label="페이지 제목">
      <CurrentIcon className="size-6 text-violet-600 dark:text-violet-400" />
      <h1 className="text-2xl md:text-[26px] font-semibold">
        {current?.label ?? "페이지"}
      </h1>
    </header>
  );
}
