import { House, IceCreamCone } from "lucide-react";
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
        <span className="flex size-6 items-center justify-center rounded-full border border-green-200 bg-green-100 text-green-700 shadow-sm">
          <House className="size-4" aria-hidden="true" />
        </span>
        <span>Start</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-orange-700 shadow-sm">
          <IceCreamCone className="size-4" aria-hidden="true" />
        </span>
        <span>Ziel</span>
      </div>
    </div>
  );
}
