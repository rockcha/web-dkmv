"use client";

import React from "react";
import {
  Sparkles,
  Gauge,
  Wand2,
  Bot,
  Trophy,
  Users,
  BarChart3,
  Brain,
  Rocket,
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

/* =========================
   공통 섹션 타이틀 (DownloadPage 스타일)
========================= */
function SectionTitle({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc?: string;
}) {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <div className="h-10 w-10 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      </div>
      {desc && (
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
          {desc}
        </p>
      )}
    </div>
  );
}

/* =========================
   가치 카드
========================= */
function ValueCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="rounded-3xl bg-white/80 dark:bg-slate-950/30 border border-violet-200/70 dark:border-violet-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10">
      <CardContent className="p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div className="mt-3 font-extrabold text-slate-900 dark:text-slate-100">
          {title}
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}

export default function About() {
  return (
    <main className="w-full px-6 py-10">
      <section className="w-full max-w-6xl mx-auto space-y-10">
        {/* Hero */}
        <Card className="relative overflow-hidden border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl">
          <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />

          <CardHeader className="relative p-8 text-center space-y-4">
            <div className="flex justify-center gap-2">
              <Badge className="rounded-full bg-violet-600 text-white">
                DKMV
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full bg-violet-600/10 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-900/40"
              >
                AI Code Quality Platform
              </Badge>
            </div>

            <CardTitle className="text-3xl md:text-5xl font-extrabold tracking-tight">
              AI 코드의 품질을
              <br className="hidden md:block" />
              숫자로 이해하고, 개선으로 연결하다
            </CardTitle>

            <CardDescription className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              DKMV는 <b>AI가 작성한 코드의 품질을 점수로 시각화</b>하고, 그
              결과를 <b>개선 코드 제안 → 실제 적용</b>까지 이어주는 개발자
              중심의 코드 리뷰 플랫폼입니다.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* What is DKMV */}
        <Card className="rounded-3xl border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur">
          <CardContent className="p-8 space-y-8">
            <SectionTitle
              icon={Sparkles}
              title="DKMV가 해결하려는 문제"
              desc="AI 코드가 늘어날수록, ‘이 코드가 좋은 코드인지’ 판단하는 일은 더 어려워지고 있습니다."
            />

            <div className="grid md:grid-cols-3 gap-5">
              <ValueCard
                icon={Gauge}
                title="정성적인 리뷰의 한계"
                desc="좋다 / 나쁘다를 넘어, 객관적으로 비교할 기준이 부족합니다."
              />
              <ValueCard
                icon={Bot}
                title="AI 코드 신뢰 문제"
                desc="AI가 짠 코드가 항상 안전하거나 유지보수하기 좋은 것은 아닙니다."
              />
              <ValueCard
                icon={Wand2}
                title="리뷰 이후의 단절"
                desc="리뷰 결과가 실제 코드 개선으로 이어지지 않는 경우가 많습니다."
              />
            </div>
          </CardContent>
        </Card>

        {/* Core Value */}
        <Card className="rounded-3xl border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur">
          <CardContent className="p-8 space-y-8">
            <SectionTitle
              icon={Brain}
              title="DKMV의 핵심 가치"
              desc="DKMV는 ‘측정 → 이해 → 개선’이라는 명확한 흐름을 제공합니다."
            />

            <div className="grid md:grid-cols-3 gap-5">
              <ValueCard
                icon={BarChart3}
                title="품질을 점수로 표현"
                desc="버그, 유지보수성, 스타일, 보안 등 다양한 관점에서 코드 품질을 수치화합니다."
              />
              <ValueCard
                icon={Wand2}
                title="개선 코드 제안 & 적용"
                desc="리뷰 결과를 기반으로 더 나은 코드를 제안하고, 즉시 적용할 수 있습니다."
              />
              <ValueCard
                icon={Bot}
                title="VS Code 확장 기반"
                desc="개발 흐름을 끊지 않고, 에디터 안에서 모든 과정을 완료할 수 있습니다."
              />
            </div>
          </CardContent>
        </Card>

        {/* Beyond */}
        <Card className="rounded-3xl border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur">
          <CardContent className="p-8 space-y-8">
            <SectionTitle
              icon={Users}
              title="DKMV가 만드는 확장된 경험"
              desc="개인 리뷰를 넘어, AI 모델과 코드 품질을 이해하는 새로운 시야를 제공합니다."
            />

            <div className="grid md:grid-cols-3 gap-5">
              <ValueCard
                icon={BarChart3}
                title="리뷰 히스토리 & 성장 추적"
                desc="과거 리뷰를 한눈에 보고, 점수 변화로 나의 성장 흐름을 확인할 수 있습니다."
              />
              <ValueCard
                icon={Trophy}
                title="모델별 바이브 코딩 비교"
                desc="다른 사용자들의 모델별 코드 품질을 보며, AI 모델에 대한 이해를 넓힙니다."
              />
              <ValueCard
                icon={Brain}
                title="AI 이해도 향상"
                desc="어떤 모델이 어떤 코드에 강한지, 실제 데이터를 통해 학습할 수 있습니다."
              />
            </div>
          </CardContent>
        </Card>

        {/* Philosophy */}
        <Card className="rounded-3xl border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur">
          <CardContent className="p-8 space-y-6 text-center">
            <Separator />
            <p className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100">
              DKMV는 단순한 리뷰 툴이 아닙니다.
            </p>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              우리는 <b>AI와 함께 코딩하는 시대</b>에, 개발자가 더 좋은 선택을
              할 수 있도록 돕고 싶습니다. 숫자로 이해하고, 근거로 개선하며, 그
              과정에서 AI를 더 잘 활용하는 개발 문화를 만드는 것이 DKMV의
              철학입니다.
            </p>

            <div className="pt-2 flex justify-center">
              <Button
                asChild
                className={[
                  "h-14 px-8 rounded-2xl font-extrabold text-base text-white",
                  "bg-gradient-to-r from-violet-600 to-indigo-500",
                  "shadow-xl shadow-violet-500/20",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:scale-[1.01]",
                  "hover:from-violet-500 hover:to-indigo-400",
                  "hover:shadow-2xl hover:shadow-violet-500/35",
                  "active:translate-y-0 active:scale-[0.99]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                ].join(" ")}
              >
                <a href="/start" className="inline-flex items-center">
                  <Rocket className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  DKMV 시작하기
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
