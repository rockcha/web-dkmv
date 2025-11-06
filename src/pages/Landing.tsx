// src/pages/Landing.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LineChart, GitCompare, Gauge } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";

export default function Landing() {
  return (
    <main
      className="
        min-h-screen
        bg-white text-slate-900
        dark:bg-slate-950 dark:text-slate-100
      "
    >
      {/* Hero */}
      <section
        className="
          relative overflow-hidden
          border-b border-slate-200 dark:border-slate-800
          bg-gradient-to-b from-slate-50 to-white
          dark:from-slate-950 dark:to-slate-900/40
        "
      >
        {/* 은은한 배경 그라데이션 원 */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-violet-300/40 dark:bg-violet-700/20" />
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full blur-3xl bg-cyan-300/40 dark:bg-cyan-700/20" />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p
            className="mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium
                         border-slate-200 bg-white/60 text-slate-600
                         dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
          >
            AI 코드 품질을 점수로 재정의
          </p>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Don’t Kill My Vibe
          </h1>

          {/* 타이핑 애니메이션 — 단어 순환 */}
          <TypingAnimation
            as="p"
            className="mt-3 text-lg text-slate-600 dark:text-slate-300"
            words={[
              "VSCode에서 한 번에: 전역·모델 점수",
              "모델 비교로 성향 파악 (StarCoder / GPT / Claude)",
              "시간 흐름에 따른 성장 추이와 리포트",
            ]}
            typeSpeed={65}
            deleteSpeed={35}
            pauseDelay={2000}
            loop
            startOnView={false}
            showCursor
            blinkCursor
            cursorStyle="underscore"
          />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">샘플 분석 확인하러 가기</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#about">회원가입 하러가기</a>
            </Button>
            {/* ✅ 익스텐션 맛보기 버튼 추가 */}
            <Button asChild size="lg" variant="secondary">
              <Link to="/extension-demo">익스텐션 맛보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 무엇을 하는 웹? 소개 섹션 */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-6">
        <div className="mx-auto mb-4 max-w-2xl text-center">
          <h2 className="text-2xl font-bold">DKMV는 이런 걸 해요</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            더미 데이터로 흐름만 먼저 보여주는 MVP 데모입니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 카드 1 */}
          <article
            className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur
                              border-slate-200 dark:border-slate-800
                              dark:bg-slate-900/60"
          >
            <header className="mb-3 flex items-center gap-2">
              <Gauge className="size-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold">전역/모델 점수</h3>
            </header>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              코드 가독성·일관성·복잡도 등 항목을 점수화하고, 사용 모델을 고려한
              모델 점수도 제공합니다.
            </p>
          </article>

          {/* 카드 2 */}
          <article
            className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur
                              border-slate-200 dark:border-slate-800
                              dark:bg-slate-900/60"
          >
            <header className="mb-3 flex items-center gap-2">
              <GitCompare className="size-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold">모델 비교</h3>
            </header>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              동일 코드로 StarCoder·GPT·Claude 성향을 비교해 어떤 모델이 어떤
              항목에 강한지 파악합니다.
            </p>
          </article>

          {/* 카드 3 */}
          <article
            className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur
                              border-slate-200 dark:border-slate-800
                              dark:bg-slate-900/60"
          >
            <header className="mb-3 flex items-center gap-2">
              <LineChart className="size-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold">성장 추이</h3>
            </header>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              주간/월간 평균 점수와 항목별 상승률, PR/Push 비율을 시각화해
              성장을 추적합니다.
            </p>
          </article>

          {/* 카드 4 */}
          <article
            className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur
                              border-slate-200 dark:border-slate-800
                              dark:bg-slate-900/60"
          >
            <header className="mb-3 flex items-center gap-2">
              <Sparkles className="size-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold">플레이그라운드 & 리포트</h3>
            </header>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              더미 코드로 분석을 체험하고, 발표용 리포트를 내려받는 흐름을 미리
              확인할 수 있어요.
            </p>
          </article>
        </div>
      </section>

      {/* 푸터 */}
      <footer
        className="border-t border-slate-200 px-6 py-10 text-center text-sm text-slate-500
                         dark:border-slate-800 dark:text-slate-400"
      >
        © {new Date().getFullYear()} DKMV — Don’t Kill My Vibe
      </footer>
    </main>
  );
}
