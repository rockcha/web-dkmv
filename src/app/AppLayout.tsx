// src/layouts/AppLayout.tsx
import * as React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { DummyDataProvider } from "@/components/DummyDataContext";

import {
  LayoutDashboard,
  ListChecks,
  GitCompare,
  Trophy,
  FlaskConical,
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

/** ===== 네비 섹션 타입 ===== */
type NavSection = {
  title: string; // 빈 문자열이면 타이틀을 렌더링하지 않음
  items: NavItem[];
};

/** ===== 네비 섹션 구성 ===== */
const NAV_SECTIONS: NavSection[] = [
  {
    title: "내 바이브",
    items: [
      { to: "/mypage/dashboard", label: "대시보드", icon: LayoutDashboard },
      { to: "/mypage/analyses", label: "리뷰 모음", icon: ListChecks },
      { to: "/mypage/playground", label: "플레이그라운드", icon: FlaskConical },
    ],
  },
  {
    title: "글로벌 바이브",
    items: [
      { to: "/mypage/compare", label: "모델 비교", icon: GitCompare },
      { to: "/mypage/leaderboard", label: "랭킹", icon: Trophy },
    ],
  },
  {
    title: "",
    items: [{ to: "/mypage/settings", label: "설정", icon: SettingsIcon }],
  },
];

/** PageHeader 계산용: 섹션을 펼쳐서 flat array로 */
const NAV_ITEMS_FLAT: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export default function AppLayout() {
  const { pathname } = useLocation();

  const isLanding = pathname === "/" || pathname.startsWith("/landing");
  const isMyPage = pathname.startsWith("/mypage");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <>
      {isLanding ? (
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
          <AppFooter currentYear={currentYear} />
        </div>
      ) : isMyPage ? (
        <DummyDataProvider>
          <div
            className="
              min-h-screen w-full
              bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100
              grid grid-rows-[auto_1fr_auto]
              text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed
            "
          >
            <AppHeader />

            <div className="grid grid-cols-[auto_1fr] min-h-0">
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
                <div className="relative h-full">
                  <div
                    className="
                      pointer-events-none absolute inset-x-0 top-0 h-6 z-10
                      bg-gradient-to-b from-white/95 to-white/0
                      dark:from-slate-950/95 dark:to-slate-950/0
                    "
                  />
                  <div
                    className="
                      pointer-events-none absolute inset-x-0 bottom-0 h-8 z-10
                      bg-gradient-to-t from-white/95 to-white/0
                      dark:from-slate-950/95 dark:to-slate-950/0
                    "
                  />

                  <ScrollArea className="h-full">
                    <div
                      className={`${isSidebarCollapsed ? "pr-1" : "pr-2"} pb-2`}
                    >
                      <div className="flex items-center justify-end px-3 pt-4 pb-2">
                        <button
                          type="button"
                          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                          aria-label={
                            isSidebarCollapsed
                              ? "사이드바 펼치기"
                              : "사이드바 접기"
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
                        <ul className="space-y-4">
                          {NAV_SECTIONS.map((section, sIdx) => {
                            const hasTitle = !!section.title;

                            return (
                              <li key={sIdx}>
                                {!isSidebarCollapsed && hasTitle && (
                                  <div className="px-2 flex items-center gap-2">
                                    <span className="text-violet-500 text-[12px] leading-none">
                                      ●
                                    </span>
                                    <span className="text-[14px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                                      {section.title}
                                    </span>
                                  </div>
                                )}

                                {!isSidebarCollapsed && hasTitle && (
                                  <Separator className="my-3 bg-slate-200 dark:bg-slate-800" />
                                )}

                                <ul className="space-y-1.5">
                                  {section.items.map(
                                    ({ to, label, icon: Icon }) => (
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

                                            const hoverExpanded = isActive
                                              ? ""
                                              : `
                                                hover:bg-violet-50/90
                                                hover:text-violet-900

                                                dark:hover:bg-violet-900/70
                                                dark:hover:text-violet-100
                                                hover:border-violet-200
                                                dark:hover:border-violet-500
                                                hover:shadow-sm
                                              `;

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

                                          <span className="relative flex items-center justify-center">
                                            <span
                                              className="
                                              absolute inset-0
                                              rounded-full
                                              bg-violet-500/8 dark:bg-violet-400/15
                                              blur-sm
                                              opacity-0
                                              transition-opacity duration-200
                                              w-7 h-7
                                              group-hover:opacity-100
                                            "
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
                                            <span className="whitespace-nowrap">
                                              {label}
                                            </span>

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
                                    )
                                  )}
                                </ul>

                                {sIdx !== NAV_SECTIONS.length - 1 && (
                                  <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </nav>
                    </div>
                  </ScrollArea>
                </div>
              </aside>

              <main className="p-6 min-h-0">
                <PageHeader pathname={pathname} />
                <section aria-live="polite">
                  <Outlet />
                </section>
              </main>
            </div>

            <AppFooter currentYear={currentYear} />
          </div>
        </DummyDataProvider>
      ) : (
        <div
          className="
            min-h-screen w-full
            bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100
            grid grid-rows-[auto_1fr_auto]
            text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed
          "
        >
          <AppHeader />
          <main className="min-h-0">
            <Outlet />
          </main>
          <AppFooter currentYear={currentYear} />
        </div>
      )}

      <Toaster />
    </>
  );
}

/** 현재 페이지 타이틀/아이콘 계산 + 렌더 분리 */
function PageHeader({ pathname }: { pathname: string }) {
  const current =
    NAV_ITEMS_FLAT.find((n) => pathname === n.to) ??
    NAV_ITEMS_FLAT.find((n) => pathname.startsWith(n.to));

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
