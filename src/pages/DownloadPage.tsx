// src/pages/DownloadPage.tsx
import React from "react";
import {
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
  Monitor,
  Terminal,
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
            {/* ✅ 번호 네모 박스 */}
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

            {/* ✅ 내용 */}
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

export default function DownloadPage() {
  const vsixUrl = "/downloads/dkmv-extension-0.0.1.vsix";

  return (
    <main className="w-full px-6 py-10">
      <section className="w-full mx-auto space-y-6">
        {/* Hero */}
        <Card className="relative overflow-hidden border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl">
          {/* 은은한 바이올렛 글로우 */}
          <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />

          <CardHeader className="relative p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center items-center gap-2">
                <Badge className="rounded-full bg-violet-600 text-white hover:bg-violet-600">
                  VS Code Extension
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-violet-600/10 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-900/40"
                >
                  DKMV Analyzer
                </Badge>
              </div>

              <CardTitle className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                DKMV Analyzer 다운로드
              </CardTitle>

              <CardDescription className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mx-auto">
                코드 선택/파일 선택 → 리뷰 생성 → 개선코드 생성/적용까지, VS
                Code 안에서 바로 이어지는 DKMV 워크플로우를 설치해보세요.
              </CardDescription>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3 w-full">
                {/* ✅ 다운 버튼 크게 + 애니메이션 */}
                <Button
                  asChild
                  className={[
                    "h-14 md:h-16 px-7 md:px-9 rounded-2xl font-extrabold text-base md:text-lg",
                    "bg-gradient-to-r from-violet-600 to-indigo-500 text-white",
                    "shadow-xl shadow-violet-500/20",
                    "transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/30 hover:brightness-105",
                    "active:translate-y-0 active:scale-[0.99]",
                  ].join(" ")}
                >
                  <a href={vsixUrl} download="dkmv-analyzer.vsix">
                    <DownloadCloud className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                    .vsix 다운로드
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className={[
                    "h-14 md:h-16 px-6 md:px-8 rounded-2xl font-semibold",
                    "border-violet-200/80 dark:border-violet-900/40",
                    "bg-white/80 dark:bg-slate-900/40",
                    "transition-all duration-200",
                    "hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50/70 dark:hover:bg-violet-950/25",
                    "hover:shadow-lg hover:shadow-violet-500/10",
                    "active:translate-y-0 active:scale-[0.99]",
                  ].join(" ")}
                >
                  <a href="#install">
                    설치 방법 보기
                    <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main */}
        <Card
          id="install"
          className="border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur rounded-3xl"
        >
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              .vsix 파일 다운 후에는 어떻게 하나요?
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <div className="grid lg:grid-cols-2 gap-5">
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
                    {/* ✅ 아이콘 크게 */}
                    <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                      <Monitor className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-extrabold">
                      방법 A) VS Code UI로 설치
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Separator className="my-4" />
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
                        title: "dkmv-analyzer.vsix 선택 후 설치 완료",
                        desc: "설치 후 필요하면 VS Code를 재시작해주세요.",
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              {/* 방법 B */}
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
                    {/* ✅ 아이콘 크게 */}
                    <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                      <Terminal className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-extrabold">
                      방법 B) 터미널로 설치
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Separator className="my-4" />
                  <StepList
                    steps={[
                      {
                        title: "다운로드 폴더로 이동",
                        desc: "예: macOS/Linux는 보통 ~/Downloads",
                      },
                      {
                        title: "설치 명령 실행",
                        desc: "code --install-extension dkmv-analyzer.vsix",
                      },
                      {
                        title: "설치 확인 후 필요하면 재시작",
                        desc: "설치가 안 보이면 VS Code를 한 번 껐다 켜주세요.",
                      },
                    ]}
                  />

                  <div className="mt-4 rounded-2xl border border-violet-200/60 dark:border-violet-900/40 bg-slate-950 text-slate-100 p-4 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
                    <pre className="overflow-auto text-xs leading-6 text-left">
                      <code>
                        {`# (macOS/Linux) 예시
cd ~/Downloads
code --install-extension dkmv-analyzer.vsix

# Windows PowerShell 예시
cd $env:USERPROFILE\\Downloads
code --install-extension .\\dkmv-analyzer.vsix`}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            <div className="mt-6 rounded-3xl border border-violet-200/70 dark:border-violet-900/40 bg-white/70 dark:bg-slate-950/40 backdrop-blur p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div className="flex-1">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">
                    참고
                  </div>
                  <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                    <li>
                      • 다운로드가 안 되면 브라우저의 팝업/다운로드 차단을
                      확인하세요.
                    </li>
                    <li>• 설치 후 VS Code 재시작이 필요할 수 있어요.</li>
                    <li>
                      • 확장 업데이트는 새 .vsix를 다시 설치하면 덮어씌워집니다.
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
