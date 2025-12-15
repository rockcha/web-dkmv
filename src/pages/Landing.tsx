// src/pages/Landing.tsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Gauge, Monitor } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import DashboardTokenCta from "@/components/DashboardTokenCta";
import { Highlighter } from "@/components/ui/highlighter"; // ✅ 경로 맞게

const FLOW_STEPS = [
  { id: 1, label: "바이브 코딩", icon: Code2 },
  { id: 2, label: "품질 점수화", icon: Gauge },
  { id: 3, label: "웹에서 확인", icon: Monitor },
];

const VIOLET_CHIP_CLASS =
  "rounded-md bg-violet-500/5 px-1.5 py-0.5 " +
  "text-violet-700 dark:text-violet-300";

console.log("✅ Landing 렌더링 됨");

export default function Landing() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [videoMode, setVideoMode] = useState<"extension" | "idle">("idle");

  // 🔄 플로우 카드 뒤 보라색 글로우 순환 인덱스
  const [activeFlowGlow, setActiveFlowGlow] = useState(0);

  // ✅ 하이라이트 시퀀스: 0(없음) → 1(box) → 2(circle) → 3(underline) → 0 반복
  const [hlPhase, setHlPhase] = useState<0 | 1 | 2 | 3>(0);
  // ✅ rough-notation은 "다시 그리기"가 필요해서 cycle로 remount 시킴
  const [hlCycle, setHlCycle] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 🔁 일정 주기로 Idle ↔ Extension 자동 전환
  useEffect(() => {
    const interval = setInterval(
      () => setVideoMode((prev) => (prev === "idle" ? "extension" : "idle")),
      10000
    );
    return () => clearInterval(interval);
  }, []);

  // 🔁 플로우 카드 보라색 글로우 순차 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlowGlow((prev) => (prev + 1) % FLOW_STEPS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  // ✅ DKMV 타이틀 하이라이트 반복 시퀀스
  useEffect(() => {
    if (!hasLoaded) return;

    let alive = true;
    let t1: number | undefined;
    let t2: number | undefined;
    let t3: number | undefined;
    let t4: number | undefined;

    // 각 단계 시간(원하면 여기만 조절)
    const d1 = 700; // box 그리는 시간/대기
    const d2 = 700; // circle
    const d3 = 650; // underline
    const gap = 450; // 한 사이클 끝나고 쉬는 시간

    const run = () => {
      if (!alive) return;

      setHlPhase(1); // box ON
      t1 = window.setTimeout(() => {
        if (!alive) return;
        setHlPhase(2); // circle ON
      }, d1);

      t2 = window.setTimeout(() => {
        if (!alive) return;
        setHlPhase(3); // underline ON
      }, d1 + d2);

      t3 = window.setTimeout(() => {
        if (!alive) return;
        // 다 끝나면 꺼졌다가 cycle 증가로 다시 "그리기"
        setHlPhase(0);
        setHlCycle((c) => c + 1);
      }, d1 + d2 + d3);

      t4 = window.setTimeout(() => {
        if (!alive) return;
        run(); // 반복
      }, d1 + d2 + d3 + gap);
    };

    run();

    return () => {
      alive = false;
      if (t1) window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
      if (t3) window.clearTimeout(t3);
      if (t4) window.clearTimeout(t4);
    };
  }, [hasLoaded]);

  const fadeClass = hasLoaded
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-4";

  const isExtensionMode = videoMode === "extension";
  const isIdleMode = videoMode === "idle";

  return (
    <>
      <style>{`
        @keyframes dkmvBorderSweep {
          0% { background-position: 0% 0%; }
          50% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>

      <div
        className="
          flex h-full flex-col
          bg-white text-slate-900
          dark:bg-slate-950 dark:text-slate-100
        "
      >
        <div
          className="
            relative flex flex-1 flex-col lg:flex-row
            overflow-hidden
            border-b border-slate-200 dark:border-slate-800
            bg-gradient-to-b from-slate-50 via-white to-slate-50
            dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
          "
        >
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-violet-300/40 dark:bg-violet-500/25" />
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full blur-3xl bg-cyan-300/40 dark:bg-cyan-500/20" />
          </div>

          {/* ====== 왼쪽 ====== */}
          <section
            className={`
              flex-1 flex items-center
              px-6 py-16 lg:py-20
              transform-gpu transition-all duration-700 ease-out
              ${fadeClass}
            `}
          >
            <div className="mx-auto w-full max-w-3xl flex flex-col items-center">
              <div className="max-w-xl text-center">
                <h1
                  className="
                    mt-4 inline-flex items-center justify-center gap-3 sm:gap-4
                    text-4xl font-extrabold tracking-tight sm:text-5xl
                    lg:justify-start
                  "
                >
                  <span className="flex items-center gap-3">
                    {/* ✅ 반복 시퀀스: enabled로 단계별 on/off + cycle로 다시 그리기 */}
                    <Highlighter
                      key={`box-${hlCycle}`}
                      action="box"
                      color="rgba(139,92,246,0.75)"
                      strokeWidth={2}
                      padding={6}
                      animationDuration={650}
                      iterations={1}
                      enabled={hlPhase >= 1}
                      isView={false}
                    >
                      <Highlighter
                        key={`circle-${hlCycle}`}
                        action="circle"
                        color="rgba(34,211,238,0.75)"
                        strokeWidth={2}
                        padding={8}
                        animationDuration={1250}
                        iterations={1}
                        enabled={hlPhase >= 2}
                        isView={false}
                      >
                        <Highlighter
                          key={`underline-${hlCycle}`}
                          action="underline"
                          color="rgba(139,92,246,0.85)"
                          strokeWidth={2.2}
                          padding={2}
                          animationDuration={1200}
                          iterations={1}
                          enabled={hlPhase >= 3}
                          isView={false}
                        >
                          Don’t Kill My Vibe
                        </Highlighter>
                      </Highlighter>
                    </Highlighter>

                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/50 bg-violet-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-violet-700 dark:text-violet-200">
                      Beta
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
                      </span>
                    </span>
                  </span>
                </h1>

                <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                  <span className="font-medium">AI가 만들어낸 코드</span>를{" "}
                  <span className={VIOLET_CHIP_CLASS}>
                    정적 분석 + LLM 리뷰
                  </span>
                  로 점수화하고,{" "}
                  <span className={VIOLET_CHIP_CLASS}>VSCode 익스텐션</span> 및{" "}
                  <span className={VIOLET_CHIP_CLASS}>웹 대시보드</span>
                  에서 한 번에 관리할 수 있는 코드 품질 시스템입니다.
                </p>

                <div
                  className={`
                    mt-10 transform-gpu transition-all duration-700 ease
                    ${fadeClass}
                  `}
                  style={{ transitionDelay: hasLoaded ? "120ms" : "0ms" }}
                >
                  <div className="grid gap-4 sm:grid-cols-3 text-left">
                    {FLOW_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isActiveGlow = activeFlowGlow === idx;
                      return (
                        <div key={step.id} className="relative">
                          <div
                            className={`
                              pointer-events-none absolute -inset-1
                              rounded-3xl blur-2xl
                              bg-violet-500/40
                              transition-opacity duration-1000
                              ${isActiveGlow ? "opacity-80" : "opacity-0"}
                            `}
                          />
                          <Card
                            className="
                              relative
                              group flex min-h-[96px] flex-col justify-between
                              rounded-2xl border border-violet-200/80
                              bg-white/80
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
                                  <Icon className="size-7 text-violet-500" />
                                </div>
                                <div className="flex flex-col">
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={`
                    mt-10 transform-gpu transition-all duration-700 ease-out
                    ${fadeClass}
                  `}
                  style={{ transitionDelay: hasLoaded ? "220ms" : "0ms" }}
                >
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

                  <DashboardTokenCta />
                </div>
              </div>
            </div>
          </section>

          {/* ====== 오른쪽 ====== */}
          <aside
            className="
              flex-1 relative
              border-t border-slate-200 lg:border-t-0 lg:border-l
              border-slate-200 dark:border-slate-800
              min-h-[260px]
            "
          >
            <div className="pointer-events-none absolute inset-y-0 -left-[1px] z-20 hidden lg:block">
              <div
                className="h-full w-[2px] rounded-full"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, rgba(139,92,246,0), rgba(139,92,246,0.9), rgba(139,92,246,0))",
                  backgroundSize: "100% 200%",
                  animation: "dkmvBorderSweep 3s ease-in-out infinite",
                }}
              />
            </div>

            <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-lg bg-black/65 px-3 py-1 text-[0.7rem] font-medium text-slate-100">
              <Monitor className="size-3.5" />
              {isExtensionMode
                ? "VSCode 익스텐션 실사용 화면"
                : "DKMV Idle 화면"}
            </div>

            <video
              className={`
                absolute inset-0 h-full w-full object-cover
                transition-opacity duration-700
                ${isIdleMode ? "opacity-100" : "opacity-0"}
              `}
              autoPlay
              muted
              loop
              playsInline
              src="/hero-video.mp4"
            >
              브라우저에서 HTML5 비디오를 지원하지 않습니다.
            </video>

            <video
              className={`
                absolute inset-0 h-full w-full object-cover
                transition-opacity duration-700
                ${isExtensionMode ? "opacity-100" : "opacity-0"}
              `}
              autoPlay
              muted
              loop
              playsInline
              src="/extension-video.mp4"
            >
              브라우저에서 HTML5 비디오를 지원하지 않습니다.
            </video>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 py-4">
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
                  <>
                    DKMV Idle 화면에서 전체적인{" "}
                    <span className="font-semibold">분석 흐름</span>과{" "}
                    <span className="font-semibold">바이브 점수</span>를 확인할
                    수 있습니다.
                  </>
                )}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
