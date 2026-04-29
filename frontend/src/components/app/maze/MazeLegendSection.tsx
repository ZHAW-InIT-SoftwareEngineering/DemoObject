import type { ReactNode } from "react";
import {
  MazeExplorationLegend,
  type MazeExplorationLegendItem,
} from "@/components/app/maze/MazeExplorationLegend";
import { MazeStartGoalLegend } from "@/components/app/maze/MazeStartGoalLegend";
import {
  MAZE_LEGEND_DIVIDER_CLASS_NAME,
  MAZE_LEGEND_SURFACE_CLASS_NAME,
} from "@/components/app/maze/mazeLegendStyles";
import { cn } from "@/lib/utils";

type MazeLegendSectionProps = {
  className?: string;
  children?: ReactNode;
  title?: string;
  explorationLegend?: {
    additionalItems?: readonly MazeExplorationLegendItem[];
    gridClassName?: string;
    title?: string | null;
  } | null;
};

export function MazeLegendSection({
  className,
  children,
  explorationLegend = null,
  title,
}: MazeLegendSectionProps) {
  return (
    <div
      className={cn(
        `${MAZE_LEGEND_SURFACE_CLASS_NAME} space-y-3 px-3 py-2 text-sm`,
        className,
      )}
    >
      {title ? <div className="font-medium">{title}</div> : null}
      <MazeStartGoalLegend />
      {children}
      {explorationLegend ? (
        <MazeExplorationLegend
          additionalItems={explorationLegend.additionalItems}
          className={cn("border-t pt-3", MAZE_LEGEND_DIVIDER_CLASS_NAME)}
          gridClassName={explorationLegend.gridClassName}
          title={
            title
              ? (explorationLegend.title ?? null)
              : explorationLegend.title
          }
          variant="plain"
        />
      ) : null}
    </div>
  );
}
