// src/pages/Landing.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, ArrowRight, Code2, Gauge, Monitor } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";

const FLOW_STEPS = [
  {
    id: 1,
    label: "바이브 코딩",
    icon: Code2,
  },
  {
    id: 2,
    label: "품질 점수화",
    icon: Gauge,
  },
  {
    id: 3,
    label: "웹에서 확인",
    icon: Monitor,
  },
];

// 보라색 하이라이트 칩 공통 클래스
const VIOLET_CHIP_CLASS =
  "rounded-md bg-violet-500/5 px-1.5 py-0.5 " +
  "text-violet-700 dark:text-violet-300";

export default function Landing() {
  const [hasLoaded, setHasLoaded] = useState(false);
  // ✅ 기본값을 idle 로
  const [videoMode, setVideoMode] = useState<"extension" | "idle">("idle");

  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const fadeClass = hasLoaded
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-4";

  const currentYear = new Date().getFullYear();

  const isExtensionMode = videoMode === "extension";
  const isIdleMode = videoMode === "idle";

  return (
    <main
      className="
        min-h-screen
        bg-white text-slate-900
        dark:bg-slate-950 dark:text-slate-100
      "
    >
      {/* Hero 섹션: 왼쪽 텍스트 / 오른쪽 비디오 */}
      <section
        className="
          relative overflow-hidden
          border-b border-slate-200 dark:border-slate-800
          bg-gradient-to-b from-slate-50 via-white to-slate-50
          dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
        "
      >
        {/* 은은한 배경 그라디언트 원 */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-violet-300/40 dark:bg-violet-500/25" />
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full blur-3xl bg-cyan-300/40 dark:bg-cyan-500/20" />
        </div>

        <div
          className="
            mx-auto flex max-w-6xl lg:max-w-7xl flex-col gap-10
            px-6 py-20
            lg:flex-row lg:items-center lg:gap-16
          "
        >
          {/* 왼쪽: 제목 / 서브카피 / 플로우 / CTA */}
          <div
            className={`
              w-full lg:flex-[0.9]
              transform-gpu transition-all duration-700 ease-out
              ${fadeClass}
            `}
            style={{ transitionDelay: hasLoaded ? "0ms" : "0ms" }}
          >
            <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
              {/* 제목 + 로고 + Beta 뱃지 */}
              <h1
                className="
                  mt-4 inline-flex items-center justify-center gap-3 sm:gap-4
                  text-4xl font-extrabold tracking-tight sm:text-5xl
                  lg:justify-start
                "
              >
                <img
                  src="/logo.png" // /public/logo.png
                  alt="DKMV"
                  width={40}
                  height={40}
                  className="
                    h-9 w-9 sm:h-10 sm:w-10
                    rounded-md object-contain
                  "
                  loading="eager"
                  decoding="async"
                />
                <span className="flex items-center gap-2">
                  Don’t Kill My Vibe
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/50 bg-violet-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-violet-700 dark:text-violet-200">
                    Beta
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
                    </span>
                  </span>
                </span>
              </h1>

              {/* 서브카피 + 키워드 하이라이트 */}
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                <span className="font-medium">AI가 만들어낸 코드</span>를{" "}
                <span className={VIOLET_CHIP_CLASS}>정적 분석 + LLM 리뷰</span>
                로 점수화하고,{" "}
                <span className={VIOLET_CHIP_CLASS}>VSCode 익스텐션</span> 및{" "}
                <span className={VIOLET_CHIP_CLASS}>웹 대시보드</span>
                에서 한 번에 관리할 수 있는 코드 품질 시스템입니다.
              </p>

              {/* 플로우 카드 */}
              <div
                className={`
                  mt-6 transform-gpu transition-all duration-700 ease-out
                  ${fadeClass}
                `}
                style={{ transitionDelay: hasLoaded ? "120ms" : "0ms" }}
              >
                <div className="grid gap-4 sm:grid-cols-3 text-left">
                  {FLOW_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <Card
                        key={step.id}
                        className="
                          group relative flex min-h-[96px] flex-col justify-between
                          rounded-2xl border border-violet-200/80
                          text-xs sm:text-sm shadow-sm
                          dark:border-violet-400/50
                          dark:bg-slate-900/70
                          backdrop-blur
                          transform-gpu transition-all duration-200
                          hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg
                        "
                      >
                        <CardHeader className="flex flex-col gap-2 pb-3">
                          <div className="flex flex-row items-center gap-1">
                            <div
                              className="
                                flex h-10 w-10 items-center justify-center rounded-2xl
                                transform-gpu transition-transform duration-200
                                group-hover:-translate-y-0.5
                              "
                            >
                              <Icon
                                className="
                                  size-7
                                  text-violet-500
                                "
                              />
                            </div>
                            <div className="flex flex-col ">
                              <CardTitle
                                className="
                                  text-[0.8rem] sm:text-sm
                                  font-semibold
                                  text-slate-800 dark:text-slate-50
                                  whitespace-nowrap
                                "
                              >
                                {step.label}
                              </CardTitle>
                            </div>
                          </div>

                          {/* 스텝별 짧은 설명 */}
                          <p className="mt-1 text-[0.7rem] leading-relaxed text-slate-500 dark:text-slate-200">
                            {idx === 0 &&
                              "VSCode에서 평소처럼 코딩하는 순간, 바이브를 그대로 캡처합니다."}
                            {idx === 1 &&
                              "정적 분석 도구와 LLM이 코드 품질을 점수와 리포트로 정리합니다."}
                            {idx === 2 &&
                              "웹 대시보드에서 히스토리를 쌓고, 나와 팀의 성장을 한눈에 봅니다."}
                          </p>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* CTA + 타이핑 애니메이션 */}
              <div
                className={`
                  mt-8 transform-gpu transition-all duration-700 ease-out
                  ${fadeClass}
                `}
                style={{ transitionDelay: hasLoaded ? "220ms" : "0ms" }}
              >
                {/* 👉 magicui TypingAnimation 사용 */}
                <TypingAnimation
                  as="div"
                  className="text-sm font-semibold tracking-wide text-violet-700 dark:text-violet-300"
                  words={["지금, 나의 바이브 코드 점수를 확인하세요"]}
                  typeSpeed={140}
                  pauseDelay={2000}
                  loop={true}
                  startOnView={false}
                  showCursor
                  blinkCursor
                  cursorStyle="underscore"
                />

                <div className="mt-4 flex justify-center lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="
                      group relative inline-flex h-16 w-full max-w-xs items-center justify-center overflow-hidden
                      rounded-2xl border border-violet-500/70
                      bg-gradient-to-r from-violet-500 via-violet-600 to-fuchsia-500
                      text-base sm:text-lg font-semibold text-white
                      shadow-[0_18px_40px_rgba(88,28,135,0.45)]
                      transition-all duration-300
                      hover:-translate-y-0.5 hover:scale-[1.02]
                      hover:shadow-[0_22px_50px_rgba(88,28,135,0.7)]
                      active:scale-[0.99]
                    "
                  >
                    <Link
                      to="/mypage/dashboard"
                      aria-label="DKMV 대시보드 시작하기"
                    >
                      <span className="flex items-center gap-2">
                        <Rocket
                          className="
                            size-5
                            transition-transform duration-300
                            group-hover:-translate-y-0.5 group-hover:translate-x-0.5
                          "
                        />
                        <span>대시보드로</span>
                        <ArrowRight
                          className="
                            size-4 opacity-0 -translate-x-1
                            transition-all duration-300
                            group-hover:opacity-100 group-hover:translate-x-0
                          "
                        />
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 히어로 비디오 + 보기 모드 토글 버튼 */}
          <div
            className={`
              w-full lg:flex-[1.1]
              transform-gpu transition-all duration-700 ease-out
              ${fadeClass}
            `}
            style={{ transitionDelay: hasLoaded ? "300ms" : "0ms" }}
          >
            {/* 보기 모드 토글 */}
            <div className="mb-4 flex items-center justify-end gap-3">
              <span className="text-[0.7rem] font-medium text-violet-700 dark:text-violet-300">
                보기 모드
              </span>
              <div
                className="
                  inline-flex items-center gap-1
                  rounded-full border border-violet-200/80 bg-violet-50/95
                  px-1 py-1 shadow-sm
                  dark:border-violet-600/70 dark:bg-violet-950/70
                "
              >
                <button
                  type="button"
                  onClick={() => setVideoMode("idle")}
                  className={`
                    rounded-full px-3 py-1 text-[0.8rem] font-medium
                    transition-all duration-150 cursor-pointer
                    ${
                      isIdleMode
                        ? "bg-violet-600 text-white shadow-sm dark:bg-violet-400 "
                        : "text-violet-600/80 hover:text-violet-800 dark:text-violet-200/80 dark:hover:text-violet-50"
                    }
                  `}
                >
                  Idle 화면
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode("extension")}
                  className={`
                    rounded-full px-3 py-1 text-[0.8rem] font-medium
                    transition-all duration-150 cursor-pointer
                    ${
                      isExtensionMode
                        ? "bg-violet-600 text-white shadow-sm dark:bg-violet-400 "
                        : "text-violet-600/80 hover:text-violet-800 dark:text-violet-200/80 dark:hover:text-violet-50"
                    }
                  `}
                >
                  VSCode 익스텐션
                </button>
              </div>
            </div>
            <div
              className="
                relative overflow-hidden
                rounded-3xl border border-slate-200/80 bg-black/90
                shadow-xl shadow-slate-900/25
                dark:border-slate-800
                aspect-video
              "
            >
              {/* 비디오 상단 라벨 */}
              <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg bg-black/65 px-3 py-1 text-[0.7rem] font-medium text-slate-100">
                <Monitor className="size-3.5" />
                {isExtensionMode
                  ? "VSCode 익스텐션 실사용 화면"
                  : "DKMV Idle 화면"}
              </div>

              {/* videoMode가 바뀔 때마다 새 video 엘리먼트로 리마운트 */}
              <video
                key={videoMode}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source
                  src={
                    isExtensionMode ? "/extension-video.mp4" : "/hero-video.mp4"
                  }
                  type="video/mp4"
                />
                브라우저에서 HTML5 비디오를 지원하지 않습니다.
              </video>

              {/* 하단 설명 그라디언트 오버레이 */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 py-4">
                <p className="text-xs sm:text-sm text-slate-100">
                  {isExtensionMode ? (
                    <>
                      에디터에서 선택한 코드만 전송해{" "}
                      <span className="font-semibold">
                        실시간 품질 점수와 상세 피드백
                      </span>
                      을 받아볼 수 있습니다.
                    </>
                  ) : (
                    <></>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="
          relative
          border-t border-slate-200
          px-6 py-8 text-center text-sm text-slate-500
          dark:border-slate-800 dark:text-slate-400
        "
      >
        {/* 🔥 헤더와 동일한 보라 스캔 라인 (위쪽 border에 붙이기) */}
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

        <div>© {currentYear} DKMV — Don’t Kill My Vibe</div>

        <div className="mt-2 flex flex-wrap justify-center gap-3 text-[0.75rem] text-slate-400 dark:text-slate-500">
          <span className="rounded-full border border-slate-200/70 px-3 py-1 dark:border-slate-700/70">
            사내 PoC · 코드 품질 점수화 시스템
          </span>
          <span className="rounded-full border border-slate-200/70 px-3 py-1 dark:border-slate-700/70">
            VSCode 익스텐션 · 웹 대시보드 통합
          </span>
          <span className="hidden rounded-full border border-slate-200/70 px-3 py-1 dark:border-slate-700/70 sm:inline">
            문의: FE 3팀 오정록
          </span>
        </div>
      </footer>
    </main>
  );
}
