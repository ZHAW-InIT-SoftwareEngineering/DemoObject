import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { Card, CardContent, Maze, Separator } from "@/components/ui";
import { MazePanelHeader } from "./MazePanelHeader";
import type { NodePath } from "@/lib/path/transforms";


type MazePanelProps = {
  maze: MazesMazeIdGet200Response;
  onNodeClick: (node: MazesMazeIdGet200ResponseNodesInner) => void;
  onUndo: () => void;
  onShowAnimation: () => void;
  onOpen3DPreview: () => void;
  isPathSubmitted: boolean;
  canShowAnimationButton: boolean;
  nodePath: NodePath;
  secondaryHighlightedNodePath: NodePath;
};

export function MazePanel({
  maze,
  onNodeClick,
  onUndo,
  onShowAnimation,
  onOpen3DPreview,
  isPathSubmitted,
  canShowAnimationButton,
  nodePath,
  secondaryHighlightedNodePath,
}: MazePanelProps) {

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <MazePanelHeader
          pathState={{
            nodePath,
            isPathSubmitted,
            canShowAnimationButton,
          }}
          actions={{ onUndo, onShowAnimation, onOpen3DPreview }}
        />
        <Separator />
        <div className="w-full aspect-square">
          <Maze
            maze={maze}
            className="h-full w-full border rounded bg-white"
            onNodeClick={onNodeClick}
            selectedNodePath={nodePath}
            highlightedNodePath={nodePath}
            secondaryHighlightedNodePath={secondaryHighlightedNodePath}
          />
        </div>
      </CardContent>
    </Card>
  );
}
