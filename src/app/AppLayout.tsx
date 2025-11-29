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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Toaster } from "@/components/ui/sonner";

/** ===== 네비 아이템 ===== */
type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

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

  /** ✅ 랜딩(/, /landing)에서는 헤더만 보이게 */
  const isLanding = pathname === "/" || pathname.startsWith("/landing");

  /** ✅ 마이페이지 영역 (/mypage/...) 인지 여부 */
  const isMyPage = pathname.startsWith("/mypage");

  /** ✅ 마이페이지 사이드바 접힘 상태 */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <>
      {isLanding ? (
        // ───────── 랜딩 레이아웃: 헤더 + 컨텐츠 + 푸터 = 100vh ─────────
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
        // ───────── /mypage/* 레이아웃 (사이드바 + 타이틀) ─────────
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
                      : "w-[260px] md:w-[280px] xl:w-[300px]"
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
                      className="
                        ml-auto flex h-8 w-8 items-center justify-center
                        rounded-full border border-slate-200 dark:border-slate-700
                        bg-white/80 dark:bg-slate-900/80
                        shadow-sm
                        hover:bg-slate-100 dark:hover:bg-slate-800
                        transition-all duration-200
                      "
                      aria-label={
                        isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"
                      }
                    >
                      {isSidebarCollapsed ? (
                        <ChevronRight className="size-4 text-slate-600 dark:text-slate-300" />
                      ) : (
                        <ChevronLeft className="size-4 text-slate-600 dark:text-slate-300" />
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
                                "group relative flex items-center rounded-xl px-3 py-3 text-[15px] md:text-base transition-all";
                              const layout = isSidebarCollapsed
                                ? "justify-center"
                                : "gap-3.5";

                              const hoverExpanded =
                                "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-slate-100";
                              const hoverCollapsed = "hover:bg-transparent"; // 접혔을 땐 배경 그대로

                              const activeBase = isActive
                                ? "font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40"
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
                            {/* 아이콘: active 시 부모 텍스트색을 따라 보라색, hover 시 더 진해짐 */}
                            <Icon
                              className="
                                size-5
                                transition-all duration-200 ease-out
                                group-hover:scale-110
                                group-hover:text-violet-500
                                dark:group-hover:text-violet-400
                              "
                            />

                            {/* 라벨: 접히면 부드럽게 사라지고, 펼치면 부드럽게 나타남 */}
                            <span
                              className={`
                                truncate
                                transition-all duration-300
                                ${
                                  isSidebarCollapsed
                                    ? "max-w-0 opacity-0 ml-0"
                                    : "max-w-[160px] opacity-100 ml-3"
                                }
                              `}
                            >
                              {label}
                            </span>
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
              <main className="p-6 ">
                <PageHeader pathname={pathname} />
                <section aria-live="polite">
                  <Outlet />
                </section>
              </main>
            </div>
          </div>
        </DummyDataProvider>
      ) : (
        // ───────── 그 외 일반 페이지 (/download, /about 등) ─────────
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
    <header className="mb-6 flex items-center gap-3" aria-label="페이지 제목">
      <CurrentIcon className="size-6 text-violet-600 dark:text-violet-400" />
      <h1 className="text-2xl md:text-[26px] font-semibold">
        {current?.label ?? "페이지"}
      </h1>
    </header>
  );
}
