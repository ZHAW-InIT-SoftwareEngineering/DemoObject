import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { Card, CardContent, Maze, Separator } from "@/components/ui";

type MazePanelProps = {
  maze: MazesMazeIdGet200Response;
  onNodeClick: (node: MazesMazeIdGet200ResponseNodesInner) => void;
  selectedNodeIds: number[];
  highlightedEdgeKeys: string[];
  secondaryHighlightedEdgeKeys: string[];
};

export function MazePanel({
  maze,
  onNodeClick,
  selectedNodeIds,
  highlightedEdgeKeys,
  secondaryHighlightedEdgeKeys,
}: MazePanelProps) {
  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-600 ring-2 ring-green-900" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-red-900" />
            <span>End</span>
          </div>
        </div>
        <Separator />
        <div className="w-full aspect-square">
          <Maze
            maze={maze}
            className="h-full w-full border rounded bg-white"
            onNodeClick={onNodeClick}
            selectedNodeIds={selectedNodeIds}
            highlightedEdgeKeys={highlightedEdgeKeys}
            secondaryHighlightedEdgeKeys={secondaryHighlightedEdgeKeys}
          />
        </div>
      </CardContent>
    </Card>
  );
}
