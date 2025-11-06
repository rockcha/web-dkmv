import { useEffect, useMemo, useRef } from "react";
import { FileCode2, ChevronDown, Save, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  filename: string;
  setFilename: (s: string) => void;
  value: string;
  setValue: (s: string) => void;
  onAnalyze: () => void;
};

export function EditorMock({
  filename,
  setFilename,
  value,
  setValue,
  onAnalyze,
}: Props) {
  const lines = useMemo(() => Math.max(8, value.split("\n").length), [value]);
  const gutter = Array.from({ length: lines }, (_, i) => i + 1);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  // Ctrl/Cmd+Enter로 분석
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onAnalyze();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAnalyze]);

  return (
    <div className="h-full flex flex-col">
      {/* 탭 바 */}
      <div className="h-9 bg-[#252526] border-b border-[#2a2a2a] flex items-center px-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-t-md">
          <FileCode2 className="size-4 text-[#9cdcfe]" />
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="h-6 w-56 bg-transparent border-none text-xs focus-visible:ring-0 text-[#d4d4d4] p-0"
          />
          <ChevronDown className="size-4 text-[#858585]" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <kbd className="text-[10px] bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#2a2a2a] opacity-80">
            Ctrl/Cmd + Enter
          </kbd>
          <button
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-[#0e639c] hover:bg-[#1177bb] transition-colors"
            onClick={onAnalyze}
          >
            <Play className="size-3.5" /> 분석
          </button>
          <button className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-[#3a3d41] hover:bg-[#4b4e52]">
            <Save className="size-3.5" /> 저장
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="flex-1 grid grid-cols-[48px_1fr]">
        {/* Gutter */}
        <div className="bg-[#1e1e1e] border-r border-[#2a2a2a] text-[#858585] text-xs py-3 select-none">
          <div className="pr-2 text-right tabular-nums leading-6">
            {gutter.map((n) => (
              <div key={n}>{n}</div>
            ))}
          </div>
        </div>
        {/* Textarea */}
        <div className="bg-[#1e1e1e]">
          <Textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-full w-full resize-none border-0 rounded-none bg-transparent text-sm font-mono leading-6 focus-visible:ring-0 text-[#d4d4d4] placeholder:text-[#6b6b6b]"
            placeholder={`// 여기에 프롬프트 또는 코드 스니펫을 붙여넣으세요.`}
          />
        </div>
      </div>
    </div>
  );
}
