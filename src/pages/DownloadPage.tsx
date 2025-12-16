// src/pages/DownloadPage.tsx
import {
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
  Monitor,
  Store,
  Sidebar,
  Command,
  Sparkles,
  Package,
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

function StepList({ steps }: { steps: { title: string; desc?: string }[] }) {
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
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      </div>

      {desc ? (
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {desc}
        </p>
      ) : (
        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li className="flex justify-center gap-2">
            <span className="text-violet-600">•</span>
            <span>아래 두 가지 방법 중 하나로 설치할 수 있어요</span>
          </li>
        </ul>
      )}
    </div>
  );
}

export default function DownloadPage() {
  const EXT_NAME = "DKMV Analyzer";
  const EXT_VERSION = "0.0.3";

  const vsixUrl = "/downloads/dkmv-extension-0.0.3.vsix";
  const marketplaceUrl =
    "https://marketplace.visualstudio.com/items?itemName=TBADKMV.dkmv-extension";

  return (
    <main className="w-full px-6 py-10">
      {/* ✅ 전체 폭 제한 + 가로 중앙 정렬 */}
      <section className="w-full max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <Card className="relative overflow-hidden border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl">
          <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />

          <CardHeader className="relative p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <CardTitle className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {EXT_NAME} 시작하기
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-full bg-violet-600 text-white hover:bg-violet-600"
                >
                  v {EXT_VERSION}
                </Badge>
              </CardTitle>

              <CardDescription className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mx-auto">
                코드 선택/파일 선택 → 리뷰 생성 → 개선코드 생성/적용까지, VS
                Code 안에서 바로 이어지는 <br />
                DKMV 가 제공하는 Extension, <strong>{EXT_NAME}</strong>을
                설치해보세요.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Main */}
        <Card
          id="install"
          className="border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl"
        >
          {/* ✅ 섹션 간격을 더 넉넉하게 */}
          <CardContent className="p-8 pt-6 space-y-10">
            {/* ✅ 소제목: Extension 설치 방법 (아이콘 + 중앙정렬) */}
            <SectionTitle
              icon={Package}
              title="Extension 설치 방법"
              desc="아래 두 가지 방법 중 하나로 설치할 수 있어요"
            />

            {/* ✅ 설치 방법 2열 (가로 기준 중앙 느낌 + 균형) */}
            <div className="grid lg:grid-cols-2 gap-6 items-stretch">
              {/* 방법 A */}
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
                      <Monitor className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-extrabold">
                      방법 A) VS Code UI로 .vsix 설치
                    </CardTitle>
                    <CardDescription className="text-sm">
                      로컬 파일(.vsix)로 직접 설치할 때
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex flex-col h-full">
                  <Separator className="my-4" />

                  <div className="flex-1">
                    <StepList
                      steps={[
                        {
                          title: "VS Code 실행 후 Extensions 탭 열기",
                          desc: "왼쪽 사이드바에서 Extensions를 눌러요.",
                        },
                        {
                          title: "우측 상단 ( … ) 메뉴 클릭",
                          desc: "Extensions 패널 오른쪽 위 더보기 메뉴예요.",
                        },
                        {
                          title: "Install from VSIX… 선택",
                          desc: "다운로드한 파일을 선택해서 설치해요.",
                        },
                        {
                          title: `dkmv-extension-${EXT_VERSION}.vsix 선택 후 설치 완료`,
                          desc: "설치 후 필요하면 VS Code를 재시작해주세요.",
                        },
                      ]}
                    />
                  </div>

                  <div className="mt-5">
                    <Button
                      asChild
                      className={[
                        "w-full h-12 rounded-lg font-extrabold",
                        "bg-violet-600 text-white hover:bg-violet-600",
                        "shadow-lg shadow-violet-500/15",
                        "transition-all duration-200",
                        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/20",
                        "active:translate-y-0 active:scale-[0.99]",
                      ].join(" ")}
                    >
                      <a
                        href={vsixUrl}
                        download={`dkmv-extension-${EXT_VERSION}.vsix`}
                      >
                        <DownloadCloud className="w-5 h-5 mr-2" />
                        .vsix 다운로드
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 방법 B (마켓플레이스) */}
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
                      <Store className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-extrabold">
                      방법 B) 마켓플레이스에서 설치
                    </CardTitle>
                    <CardDescription className="text-sm">
                      가장 안정적이고 업데이트가 쉬운 방법
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex flex-col h-full">
                  <Separator className="my-4" />

                  <div className="flex-1">
                    <StepList
                      steps={[
                        {
                          title: "마켓플레이스 페이지로 이동",
                          desc: "아래 버튼을 눌러 VS Code Marketplace로 이동해요.",
                        },
                        {
                          title: "Install 클릭",
                          desc: "VS Code에서 자동으로 설치가 진행돼요.",
                        },
                        {
                          title: "설치 완료",
                          desc: "설치가 끝나면 바로 Extension을 실행할 수 있어요.",
                        },
                      ]}
                    />
                  </div>

                  <div className="mt-5">
                    <Button
                      asChild
                      className={[
                        "w-full h-12 rounded-lg font-extrabold",
                        "bg-violet-600 text-white hover:bg-violet-600",
                        "shadow-lg shadow-violet-500/15",
                        "transition-all duration-200",
                        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/20",
                        "active:translate-y-0 active:scale-[0.99]",
                      ].join(" ")}
                    >
                      <a href={marketplaceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2 opacity-80" />
                        마켓플레이스로 가기
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ✅ 구분선(섹션 사이 간격 안정감) */}
            <div className="pt-2">
              <Separator className="bg-violet-200/70 dark:bg-violet-900/40" />
            </div>

            {/* ✅ 소제목: Extension 실행 방법 (아이콘 + 중앙정렬) */}
            <SectionTitle
              icon={Rocket}
              title="Extension 실행 방법"
              desc="설치가 완료되면 아래 방법 중 아무거나로 실행하면 돼요"
            />

            {/* ✅ 실행 방법 카드 (가로 기준 중앙 + 여백 정리) */}
            <Card
              className={[
                "rounded-3xl bg-white/80 dark:bg-slate-950/30",
                "border-2 border-violet-300/70 dark:border-violet-700/60",
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/10",
              ].join(" ")}
            >
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Sidebar,
                      title: "사이드바 아이콘 클릭",
                      desc: "VS Code 왼쪽에 DKMV 아이콘이 보이면 정상 설치예요.",
                    },
                    {
                      icon: Command,
                      title: "Command Palette로 실행",
                      desc: "macOS: Cmd+Shift+P / Windows: Ctrl+Shift+P → 'DKMV' 검색",
                    },
                    {
                      icon: Sparkles,
                      title: "분석 시작",
                      desc: "열리면 코드 선택/파일 선택 → Analyze 흐름으로 진행!",
                    },
                  ].map((it, i) => {
                    const Icon = it.icon;
                    return (
                      <div
                        key={i}
                        className={[
                          "rounded-2xl border bg-white/70 dark:bg-slate-950/40 backdrop-blur p-4",
                          "border-violet-200/70 dark:border-violet-900/40",
                          "transition-all duration-200",
                          "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5 h-10 w-10 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                              {it.title}
                            </div>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {it.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div className="rounded-3xl border border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div className="flex-1">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">
                    참고 (업데이트/버전 확인)
                  </div>
                  <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                    <li>
                      • 현재 안내 기준 버전: <b>v{EXT_VERSION}</b>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
