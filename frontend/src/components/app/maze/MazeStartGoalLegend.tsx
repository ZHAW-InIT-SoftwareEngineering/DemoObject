import { cn } from "@/lib/utils";

type MazeStartGoalLegendProps = {
  className?: string;
};

export function MazeStartGoalLegend({
  className,
}: MazeStartGoalLegendProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 text-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-green-600 ring-2 ring-green-900" />
        <span>Start</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-red-900" />
        <span>Ziel</span>
      </div>
    </div>
  );
}
