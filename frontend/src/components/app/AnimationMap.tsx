import type { MazesMazeIdGet200Response } from "@/api";
import { Card, CardContent, Maze } from "@/components/ui";
import { useEdgePlayback } from "@/hooks/useEdgePlayback";

type AnimationMapProps = {
  maze: MazesMazeIdGet200Response | null;
  edgeKeys: string[];
  onComplete: () => void;
  stepMs?: number;
  settleMs?: number;
};

// TODO: this component is unused as for now 
//        consider to use it as a mini-map during the 3D animation
export function AnimationMap({
  maze,
  edgeKeys,
  onComplete,
  stepMs = 220,
  settleMs = 450,
}: AnimationMapProps) {
  const { visibleEdgeKeys, progress, total } = useEdgePlayback({
    edgeKeys,
    onComplete,
    stepMs,
    settleMs,
  });

  if (!maze) return null;

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <div className="text-sm text-gray-700">
          Playing animation ({progress}/{total})
        </div>
        <div className="w-full aspect-square">
          <Maze
            maze={maze}
            className="h-full w-full border rounded bg-white"
            highlightedEdgeKeys={visibleEdgeKeys}
          />
        </div>
      </CardContent>
    </Card>
  );
}
