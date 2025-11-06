import { Files, Search, GitBranch, Bug, SquareChartGantt } from "lucide-react";

export function ActivityBar() {
  const Item = ({ icon: Icon }: { icon: any }) => (
    <button className="p-3 hover:bg-[#2a2a2a] transition-colors">
      <Icon className="size-5 text-[#9cdcfe]" />
    </button>
  );
  return (
    <div className="w-12 bg-[#252526] border-r border-[#2a2a2a] flex flex-col items-center py-2 gap-1">
      <Item icon={Files} />
      <Item icon={Search} />
      <Item icon={GitBranch} />
      <Item icon={Bug} />
      <Item icon={SquareChartGantt} />
      <div className="mt-auto pb-2 text-[10px] text-[#858585]">DK</div>
    </div>
  );
}
