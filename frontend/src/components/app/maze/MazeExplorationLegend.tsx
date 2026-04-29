import { cn } from "@/lib/utils";
import { MAZE_LEGEND_SURFACE_CLASS_NAME } from "@/components/app/maze/mazeLegendStyles";

export type MazeExplorationLegendItem = {
  color: string;
  label: string;
};

type MazeExplorationLegendProps = {
  additionalItems?: readonly MazeExplorationLegendItem[];
  className?: string;
  gridClassName?: string;
  title?: string | null;
  variant?: "plain" | "surface";
};

const BASE_EXPLORATION_ITEMS = [
  {
    color: "#ff2d95",
    label: "Aktuell entdeckte Kante",
  },
  {
    color: "#7c3aed",
    label: "Aktuell geprüfte bekannte Kante",
  },
  {
    color: "#fff200",
    label: "Bereits entdeckte Kanten",
  },
  {
    color: "#a3e635",
    label: "Bereits geprüfte bekannte Kanten",
  },
] satisfies readonly MazeExplorationLegendItem[];

export function MazeExplorationLegend({
  additionalItems = [],
  className,
  gridClassName,
  title = "Legende zur Exploration",
  variant = "surface",
}: MazeExplorationLegendProps) {
  const items = [...BASE_EXPLORATION_ITEMS, ...additionalItems];

  return (
    <div
      className={cn(
        variant === "surface"
          ? `${MAZE_LEGEND_SURFACE_CLASS_NAME} px-3 py-2 text-sm`
          : "text-sm",
        className,
      )}
    >
      {title ? <div className="mb-2 font-medium">{title}</div> : null}
      <div
        className={cn(
          "grid grid-cols-1 gap-2 sm:grid-cols-2",
          gridClassName,
        )}
      >
        {items.map((item) => (
          <div
            key={`${item.color}-${item.label}`}
            className="flex items-center gap-2"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
