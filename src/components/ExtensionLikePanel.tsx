// src/components/ExtensionLikePanel.tsx
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { AspectKey, MockAnalysis } from "@/constants/mockData";

// 아이콘 (고정 보라색)
import {
  Cpu, // 기능성
  CheckCircle2, // 신뢰성
  Pointer, // 사용 가능성
  Gauge, // 효율성
  Wrench, // 유지보수성
  Globe2, // 이식성
  Shield, // 보안성
} from "lucide-react";

// 아이콘 보라색(공통)
const ICON_PURPLE = "#C586C0";

// 라벨/아이콘 매핑 (프로그래스바는 통일된 탁한 하늘색)
const ASPECT_META: Record<
  AspectKey,
  { label: string; Icon: React.ComponentType<any> }
> = {
  functionality: { label: "기능성", Icon: Cpu },
  reliability: { label: "신뢰성", Icon: CheckCircle2 },
  usability: { label: "사용 가능성", Icon: Pointer },
  efficiency: { label: "효율성", Icon: Gauge },
  maintainability: { label: "유지보수성", Icon: Wrench },
  portability: { label: "이식성", Icon: Globe2 },
  security: { label: "보안성", Icon: Shield },
};

type Props = {
  /** elapsedMs는 데모에서 주입 (소요 시간) */
  data: MockAnalysis & { elapsedMs?: number };
};

export function ExtensionLikePanel({ data }: Props) {
  const {
    aspect_scores,
    average_score,
    model,
    title,
    summaries,
    comments,
    elapsedMs,
  } = data;

  const elapsedText =
    typeof elapsedMs === "number"
      ? elapsedMs >= 1000
        ? `${(elapsedMs / 1000).toFixed(1)}s`
        : `${elapsedMs}ms`
      : "—";

  return (
    <Card className="m-4 border-[#2a2a2a] bg-[#1e1e1e]">
      <CardHeader className="gap-3">
        {/* 고정 타이틀 */}
        <CardTitle className="text-xl font-extrabold tracking-tight">
          Don’t Kill My Vibe
        </CardTitle>

        {/* 뱃지: 평균 점수 / 사용 모델 / 소요 시간 */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="bg-[#2d2d2d] text-[#e6e6e6] border-[#3a3a3a]"
            variant="secondary"
          >
            평균 점수
            <span className="ml-1 font-semibold tabular-nums">
              {average_score}
            </span>
          </Badge>
          <Badge variant="outline" className="border-[#3a3a3a] text-[#bdbdbd]">
            사용 모델
            <span className="ml-1 font-medium">{model}</span>
          </Badge>
          <Badge variant="outline" className="border-[#3a3a3a] text-[#bdbdbd]">
            소요 시간
            <span className="ml-1 font-medium">{elapsedText}</span>
          </Badge>

          {/* 분석 타이틀(선택 코드명 등) */}
          <span className="ml-auto truncate text-xs text-[#9aa0a6]">
            {title}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <Separator className="mb-6 bg-[#2a2a2a]" />

        {/* 7개 관점 카드 */}
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(aspect_scores).map(([key, score]) => {
            const K = key as AspectKey;
            const { label, Icon } = ASPECT_META[K];

            return (
              <div
                key={key}
                className="rounded-xl border border-[#2a2a2a] p-4 hover:border-[#3a3a3a] transition-colors"
              >
                {/* 헤더: 아이콘(보라색 고정) + 라벨 + 점수 */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="grid size-6 place-items-center rounded-md"
                      style={{ backgroundColor: `${ICON_PURPLE}1A` }} // 보라 10% 틴트
                    >
                      <Icon className="size-4" style={{ color: ICON_PURPLE }} />
                    </span>
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm tabular-nums">{score}</span>
                </div>

                {/* 프로그레스바: 탁한 하늘색으로 통일 (Tailwind JIT 위해 리터럴 사용) */}
                <Progress
                  value={score}
                  className="bg-[#242424] [&>div]:bg-[#7FB7E6]"
                />

                {/* 요약 & 코멘트 */}
                {(summaries?.[K] || comments?.[K]) && (
                  <div className="mt-2 space-y-1.5">
                    {summaries?.[K] && (
                      <p className="text-xs text-[#d4d4d4]">
                        <span className="mr-1 rounded bg-[#2a2a2a] px-1.5 py-0.5 text-[10px] text-[#9aa0a6]">
                          요약
                        </span>
                        {summaries[K]}
                      </p>
                    )}
                    {comments?.[K] && (
                      <p className="text-xs text-[#bdbdbd]">
                        <span className="mr-1 rounded bg-[#2a2a2a] px-1.5 py-0.5 text-[10px] text-[#9aa0a6]">
                          코멘트
                        </span>
                        {comments[K]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
