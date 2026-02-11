import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { Card, CardContent, Maze, Separator } from "@/components/ui";
import { MazePanelHeader } from "./MazePanelHeader";


type MazePanelProps = {
  maze: MazesMazeIdGet200Response;
  onNodeClick: (node: MazesMazeIdGet200ResponseNodesInner) => void;
  onUndo: () => void;
  onShowAnimation: () => void;
  isPathSubmitted: boolean;
  canShowAnimation: boolean;
  selectedNodeIds: number[];
  highlightedEdgeKeys: string[];
  secondaryHighlightedEdgeKeys: string[];
};

export function MazePanel({
  maze,
  onNodeClick,
  onUndo,
  onShowAnimation,
  isPathSubmitted,
  canShowAnimation,
  selectedNodeIds,
  highlightedEdgeKeys,
  secondaryHighlightedEdgeKeys,
}: MazePanelProps) {

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <MazePanelHeader
          pathState={{ selectedNodeIds, isPathSubmitted, canShowAnimation }}
          actions={{ onUndo, onShowAnimation }}
        />
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
