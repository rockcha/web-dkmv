// src/pages/About.tsx
"use client";

import React from "react";
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Gauge,
  Wrench,
  Palette,
  GitBranch,
  Rocket,
  Wand2,
  Workflow,
  Code2,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function StepList({
  steps,
}: {
  steps: { title: string; desc?: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="space-y-3">
      {steps.map((s, idx) => (
        <div
          key={idx}
          className={[
            "rounded-2xl border bg-white/70 dark:bg-slate-950/40 backdrop-blur p-4",
            "border-violet-200/70 dark:border-violet-900/40",
            "transition-all duration-200",
            "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            {/* 번호 박스 */}
            <div
              className={[
                "shrink-0 mt-0.5",
                "h-8 w-8 rounded-lg",
                "bg-violet-600 text-white",
                "flex items-center justify-center",
                "text-sm font-extrabold",
                "shadow-sm shadow-violet-500/20",
              ].join(" ")}
            >
              {idx + 1}
            </div>

            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2">
                {s.icon ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-600/10 text-violet-700 dark:text-violet-300">
                    {s.icon}
                  </span>
                ) : null}
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {s.title}
                </span>
              </div>

              {s.desc ? (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {s.desc}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  bullets,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <Card
      className={[
        "rounded-3xl bg-white/80 dark:bg-slate-950/30",
        "border-2 border-violet-300/70 dark:border-violet-700/60",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/10",
      ].join(" ")}
    >
      <CardHeader className="pb-4 border-b border-violet-200/80 dark:border-violet-900/40">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
            <Icon className="w-7 h-7" />
          </div>
          <CardTitle className="text-lg font-extrabold">{title}</CardTitle>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
            {desc}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Separator className="my-4" />
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-600/80" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function About() {
  return (
    <main className="w-full px-6 py-10">
      <section className="w-full mx-auto space-y-6">
        {/* Hero */}
        <Card className="relative overflow-hidden border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl">
          <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />

          <CardHeader className="relative p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center items-center gap-2">
                <Badge className="rounded-full bg-violet-600 text-white hover:bg-violet-600">
                  DKMV
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-violet-600/10 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-900/40"
                >
                  AI Code Review Companion
                </Badge>
              </div>

              <CardTitle className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                DKMV는 “리뷰 → 개선 → 적용”을
                <br className="hidden md:block" />한 흐름으로 묶는 코드
                워크플로우입니다.
              </CardTitle>

              <CardDescription className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mx-auto">
                코드 조각/파일을 선택하고, AI 리뷰를 받고, 개선 코드를 생성한 뒤
                적용까지. 매번 툴을 옮겨 다니지 않도록{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  “작업 흐름 자체”
                </span>
                를 깔끔하게 정리해주는 서비스예요.
              </CardDescription>

              {/* ✅ 버튼 하나만 */}
              <div className="pt-3 w-full flex justify-center">
                <Button
                  asChild
                  className={[
                    "h-14 md:h-16 px-8 md:px-10 rounded-2xl font-extrabold text-base md:text-lg",
                    "bg-gradient-to-r from-violet-600 to-indigo-500 text-white",
                    "shadow-xl shadow-violet-500/20",
                    "transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/30 hover:brightness-105",
                    "active:translate-y-0 active:scale-[0.99]",
                  ].join(" ")}
                >
                  <a href="/landing">
                    <Rocket className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                    랜딩 페이지로
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* What / Why */}
        <Card className="border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl pt-0 overflow-hidden">
          <CardHeader className="p-8 pb-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>

            <CardTitle className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              개발자의 “리뷰 루프”를 더 짧게
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              리뷰 결과를 보고 끝나는 게 아니라, 개선안을 실제 코드에 반영하는
              순간까지가 진짜 가치라고 봐요. DKMV는 그 과정을 빠르고 매끄럽게
              만듭니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-violet-200/70 dark:border-violet-900/40 bg-white/80 dark:bg-slate-950/30 p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                  <Code2 className="w-6 h-6" />
                </div>
                <div className="mt-3 font-extrabold text-slate-900 dark:text-slate-100">
                  컨텍스트 유지
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  코드/파일/리뷰를 한 화면 흐름으로 묶어 “왔다 갔다” 비용을
                  줄여요.
                </p>
              </div>

              <div className="rounded-3xl border border-violet-200/70 dark:border-violet-900/40 bg-white/80 dark:bg-slate-950/30 p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                  <Gauge className="w-6 h-6" />
                </div>
                <div className="mt-3 font-extrabold text-slate-900 dark:text-slate-100">
                  측정 가능한 개선
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  총점/카테고리(버그·유지보수·스타일·보안) 기반으로 변화가
                  보이게.
                </p>
              </div>

              <div className="rounded-3xl border border-violet-200/70 dark:border-violet-900/40 bg-white/80 dark:bg-slate-950/30 p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div className="mt-3 font-extrabold text-slate-900 dark:text-slate-100">
                  적용까지 한 번에
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  개선 코드를 만들고, 선택한 범위/파일에 적용하는 루트를
                  제공합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow */}
        <Card className="border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl pt-0 overflow-hidden">
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              DKMV 워크플로우
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              “어떻게 쓰는지”가 바로 이해되도록, 핵심 단계를 간단히 정리했어요.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <div className="grid lg:grid-cols-2 gap-5">
              <Card
                className={[
                  "rounded-3xl bg-white/80 dark:bg-slate-950/30",
                  "border-2 border-violet-300/70 dark:border-violet-700/60",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/10",
                ].join(" ")}
              >
                <CardHeader className="pb-4 border-b border-violet-200/80 dark:border-violet-900/40">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                      <Bot className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-extrabold">
                      1) 리뷰 생성
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Separator className="my-4" />
                  <StepList
                    steps={[
                      {
                        title: "코드 조각 또는 파일을 선택",
                        desc: "드래그 선택 / 파일 선택 어떤 방식이든 OK",
                        icon: <GitBranch className="h-4 w-4" />,
                      },
                      {
                        title: "AI 리뷰 생성",
                        desc: "총점과 카테고리별 점수 + 코멘트를 받아요",
                        icon: <Gauge className="h-4 w-4" />,
                      },
                      {
                        title: "요약으로 핵심만 빠르게 확인",
                        desc: "긴 글보다 ‘결론부터’ 보는 흐름을 유지해요",
                        icon: <Sparkles className="h-4 w-4" />,
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card
                className={[
                  "rounded-3xl bg-white/80 dark:bg-slate-950/30",
                  "border-2 border-violet-300/70 dark:border-violet-700/60",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/10",
                ].join(" ")}
              >
                <CardHeader className="pb-4 border-b border-violet-200/80 dark:border-violet-900/40">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                      <Wand2 className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-extrabold">
                      2) 개선 코드 생성 & 적용
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Separator className="my-4" />
                  <StepList
                    steps={[
                      {
                        title: "개선 코드 생성",
                        desc: "리뷰 기반으로 더 나은 코드 버전을 제안받아요",
                        icon: <Sparkles className="h-4 w-4" />,
                      },
                      {
                        title: "적용 방식 선택",
                        desc: "선택 범위/파일 단위로 적용해서 변경이 명확해요",
                        icon: <Workflow className="h-4 w-4" />,
                      },
                      {
                        title: "루프 반복",
                        desc: "점수/코멘트가 좋아지는 과정을 빠르게 만들어요",
                        icon: <Rocket className="h-4 w-4" />,
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl pt-0 overflow-hidden">
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              핵심 기능
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              개발자가 실제로 “계속 쓰게 되는” 포인트만 모았어요.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <div className="grid gap-5 lg:grid-cols-3">
              <FeatureCard
                icon={Gauge}
                title="점수 & 트렌드"
                desc="리뷰가 쌓일수록 성장 흐름이 보이는 대시보드"
                bullets={[
                  "총점/카테고리 점수 변화 라인 차트",
                  "평균 점수/총 리뷰 수/향상률 등 핵심 지표",
                  "관심 지표만 토글해서 빠르게 집중",
                ]}
              />
              <FeatureCard
                icon={ShieldCheck}
                title="유형별 코멘트"
                desc="버그·유지보수·스타일·보안 관점으로 정리된 피드백"
                bullets={[
                  "유형별 점수 + 코멘트를 카드 섹션으로",
                  "요약/원본 코드와 함께 읽을 수 있는 컨텍스트",
                  "다이얼로그에서 한 번에 확인",
                ]}
              />
              <FeatureCard
                icon={Wrench}
                title="개선 & 적용 루프"
                desc="‘제안’에서 끝나지 않고 실제 코드 반영까지"
                bullets={[
                  "개선 코드 생성",
                  "선택 범위/파일 단위 적용",
                  "반복하면서 점진적으로 품질 개선",
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Principles */}
        <Card className="border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl pt-0 overflow-hidden">
          <CardHeader className="p-8 pb-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <CardTitle className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              우리가 중요하게 보는 것
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              기능보다 먼저, “믿고 쓸 수 있는 경험”을 만들어요.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-violet-200/70 dark:border-violet-900/40 bg-white/80 dark:bg-slate-950/30 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">
                    명확한 피드백
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  “어디가 문제인지/왜 그런지”를 짧게라도 납득 가능하게.
                </p>
              </div>

              <div className="rounded-3xl border border-violet-200/70 dark:border-violet-900/40 bg-white/80 dark:bg-slate-950/30 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">
                    실전 친화
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  “작게, 자주” 개선하는 흐름에 맞게 구성합니다.
                </p>
              </div>

              <div className="rounded-3xl border border-violet-200/70 dark:border-violet-900/40 bg-white/80 dark:bg-slate-950/30 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">
                    읽히는 UI
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  정보 밀도는 유지하면서, 시각적으로 덜 피곤하게.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
