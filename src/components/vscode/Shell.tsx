import * as React from "react";
import { cn } from "@/lib/utils";
import { TitleBar } from "./TitleBar";
import { ActivityBar } from "./ActivityBar";
import { StatusBar } from "./StatusBar";

type ShellProps = {
  title?: string;
  right?: React.ReactNode; // 우측 패널(분석 결과)
  left?: React.ReactNode; // 좌측 패널(에디터/입력)
  className?: string;
};

export function VscodeShell({
  title = "DKMV — Vibe Code Checker",
  left,
  right,
  className,
}: ShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full",
        "bg-[#1e1e1e] text-[#d4d4d4]", // VSCode Dark 기본 톤
        "flex flex-col",
        className
      )}
    >
      <TitleBar title={title} />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* 좌측: 에디터 */}
          <div className="border-r border-[#2a2a2a] overflow-hidden">
            {left}
          </div>
          {/* 우측: 결과 패널 */}
          <div className="overflow-auto">{right}</div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
