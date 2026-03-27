import type { MazesMazeIdGet200Response } from "@/api";
import { Card, CardContent, Maze } from "@/components/ui";
import type { NodePath } from "@/lib/path/transforms";

type AnimationMapProps = {
  maze: MazesMazeIdGet200Response | null;
  visibleNodePath: NodePath;
  progress: number;
  total: number;
};

// TODO: this component is unused as for now
//        consider to use it as a mini-map during the 3D animation
export function AnimationMap({
  maze,
  visibleNodePath,
  progress,
  total,
}: AnimationMapProps) {
  if (!maze) return null;

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <div className="text-sm text-gray-700">
          Animation läuft ({progress}/{total})
        </div>
        <div className="w-full aspect-square">
          <Maze
            maze={maze}
            className="h-full w-full border rounded bg-white"
            highlightedNodePath={visibleNodePath}
          />
        </div>
      </CardContent>
    </Card>
  );
}
