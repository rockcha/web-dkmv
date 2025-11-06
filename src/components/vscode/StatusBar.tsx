import { GitBranch, Server, ShieldCheck, Gauge } from "lucide-react";

export function StatusBar() {
  return (
    <div className="h-7 bg-[#007acc] text-white flex items-center text-xs px-3 gap-4 select-none">
      <div className="flex items-center gap-1 opacity-95">
        <GitBranch className="size-3.5" /> main
      </div>
      <div className="flex items-center gap-1 opacity-95">
        <Server className="size-3.5" /> FastAPI: ready
      </div>
      <div className="flex items-center gap-1 opacity-95">
        <ShieldCheck className="size-3.5" /> Model: mock
      </div>
      <div className="ml-auto flex items-center gap-1 opacity-95">
        <Gauge className="size-3.5" /> 60 fps
      </div>
    </div>
  );
}
