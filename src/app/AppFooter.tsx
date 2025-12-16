// src/components/AppFooter.tsx
import * as React from "react";
import { Github, Mail, Globe } from "lucide-react";

type Props = {
  currentYear?: number;
};

export default function AppFooter({ currentYear }: Props) {
  const year = currentYear ?? new Date().getFullYear();

  return (
    <footer
      className="
        relative
        border-t border-slate-200 dark:border-slate-800
        px-6
        text-slate-500 dark:text-slate-400
      "
    >
      {/* 상단 보라색 sheen 라인 (유지) */}
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

      <div className="mx-auto max-w-6xl py-5 sm:py-6">
        {/* 상단: 좌우 활용 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT: 브랜드 영역 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                DKMV
              </span>
            </div>
            <div className="text-xs text-slate-500/90 dark:text-slate-400/90">
              Code quality, vibes, and clarity — in one flow.
            </div>
          </div>

          {/* RIGHT: Contact(장식용) */}
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <div className="text-lg text-slate-500/80 dark:text-slate-400/80">
              Contact
            </div>

            <div className="flex items-center gap-2">
              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-full
                  border border-slate-200 dark:border-slate-700
                  bg-white/60 dark:bg-slate-900/40
                  backdrop-blur
                  shadow-sm
                "
                aria-hidden="true"
                title="GitHub"
              >
                <Github size={20} />
              </div>

              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-full
                  border border-slate-200 dark:border-slate-700
                  bg-white/60 dark:bg-slate-900/40
                  backdrop-blur
                  shadow-sm
                "
                aria-hidden="true"
                title="Email"
              >
                <Mail size={20} />
              </div>

              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-full
                  border border-slate-200 dark:border-slate-700
                  bg-white/60 dark:bg-slate-900/40
                  backdrop-blur
                  shadow-sm
                "
                aria-hidden="true"
                title="Website"
              >
                <Globe size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="mt-4 h-px w-full bg-slate-200/70 dark:bg-slate-800" />

        {/* 하단: 카피라이트 */}
        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs">
            © {year} <span className="font-medium">DKMV</span> — Don’t Kill My
            Vibe
          </div>

          <div className="text-[11px] text-slate-500/80 dark:text-slate-400/80">
            Built for developers who ship fast — and clean.
          </div>
        </div>
      </div>
    </footer>
  );
}
