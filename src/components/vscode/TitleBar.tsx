import { ChevronDown, Minus, Square, X } from "lucide-react";

export function TitleBar({ title }: { title: string }) {
  return (
    <div
      className="h-9 flex items-center justify-between px-3 select-none
                    bg-[#3c3c3c] text-[#e7e7e7] border-b border-[#2a2a2a]"
    >
      <div className="flex items-center gap-2">
        <div className="text-xs px-2 py-0.5 rounded bg-[#2d2d2d]">DKMV</div>
        <div className="text-sm font-medium">{title}</div>
        <ChevronDown className="size-4 opacity-60" />
      </div>
      <div className="hidden sm:flex items-center gap-3 opacity-80">
        <Minus className="size-4" />
        <Square className="size-4" />
        <X className="size-4" />
      </div>
    </div>
  );
}
