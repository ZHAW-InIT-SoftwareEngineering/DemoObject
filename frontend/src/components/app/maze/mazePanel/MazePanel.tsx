import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { Card, CardContent } from "@/components/ui";
import { Maze } from "./Maze";
import { MazePanelHeader } from "./MazePanelHeader";
import type { NodePath } from "@/lib/path/transforms";
import { PathInfo } from "@/components/app/maze/PathInfo";
import { MazeLegendSection } from "@/components/app/maze/MazeLegendSection";
import { MAZE_LEGEND_DIVIDER_CLASS_NAME } from "@/components/app/maze/mazeLegendStyles";
import { cn } from "@/lib/utils";

type MazePanelProps = {
  maze: MazesMazeIdGet200Response;
  userName?: string | null;
  onNodeClick: (node: MazesMazeIdGet200ResponseNodesInner) => void;
  onUndo: () => void;
  onShowAnimation: () => void;
  onOpen3DPreview: () => void;
  isPathSubmitted: boolean;
  canShowAnimationButton: boolean;
  nodePath: NodePath;
  secondaryHighlightedNodePath: NodePath;
  explorationDiscoveredEdgeKeys?: readonly string[];
  explorationSeenEdgeKeys?: readonly string[];
  currentExplorationEdgeKey?: string | null;
  currentExplorationEdgeDiscovered?: boolean;
  showExplorationLegend?: boolean;
  userPathLength: number;
  shortestPathLength: number | null | undefined;
  timerElapsedMs: number;
};

export function MazePanel({
  maze,
  userName = null,
  onNodeClick,
  onUndo,
  onShowAnimation,
  onOpen3DPreview,
  isPathSubmitted,
  canShowAnimationButton,
  nodePath,
  secondaryHighlightedNodePath,
  explorationDiscoveredEdgeKeys = [],
  explorationSeenEdgeKeys = [],
  currentExplorationEdgeKey = null,
  currentExplorationEdgeDiscovered = false,
  showExplorationLegend = false,
  userPathLength,
  shortestPathLength,
  timerElapsedMs,
}: MazePanelProps) {
  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <div className="grid items-stretch gap-3 md:grid-cols-2">
          <MazeLegendSection
            title="Legende:"
            explorationLegend={
              showExplorationLegend
                ? {}
                : null
            }
          >
            <PathInfo
              className={cn("border-t pt-3", MAZE_LEGEND_DIVIDER_CLASS_NAME)}
              shortestPathLength={shortestPathLength}
              userPathLength={userPathLength}
              variant="plain"
            />
          </MazeLegendSection>
          <MazePanelHeader
            userName={userName}
            pathState={{
              nodePath,
              isPathSubmitted,
              canShowAnimationButton,
              timerElapsedMs,
            }}
            actions={{ onUndo, onShowAnimation, onOpen3DPreview }}
          />
        </div>
        <div className="w-full aspect-square touch-none overscroll-contain">
          <Maze
            maze={maze}
            className="h-full w-full border rounded bg-white"
            onNodeClick={onNodeClick}
            selectedNodePath={nodePath}
            highlightedNodePath={nodePath}
            secondaryHighlightedNodePath={secondaryHighlightedNodePath}
            explorationDiscoveredEdgeKeys={explorationDiscoveredEdgeKeys}
            explorationSeenEdgeKeys={explorationSeenEdgeKeys}
            currentExplorationEdgeKey={currentExplorationEdgeKey}
            currentExplorationEdgeDiscovered={currentExplorationEdgeDiscovered}
          />
        </div>
      </CardContent>
    </Card>
  );
}
