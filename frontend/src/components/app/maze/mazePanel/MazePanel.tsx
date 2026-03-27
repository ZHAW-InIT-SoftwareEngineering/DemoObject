import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { Card, CardContent, Maze, Separator } from "@/components/ui";
import { MazePanelHeader } from "./MazePanelHeader";
import type { NodePath } from "@/lib/path/transforms";
import { PathInfo } from "@/components/app/maze/PathInfo";


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
  explorationDiscoveredEdgeKeys?: readonly string[];
  explorationSeenEdgeKeys?: readonly string[];
  currentExplorationEdgeKey?: string | null;
  currentExplorationEdgeDiscovered?: boolean;
  showExplorationLegend?: boolean;
  userPathLength: number;
  shortestPathLength: number | null | undefined;
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
  explorationDiscoveredEdgeKeys = [],
  explorationSeenEdgeKeys = [],
  currentExplorationEdgeKey = null,
  currentExplorationEdgeDiscovered = false,
  showExplorationLegend = false,
  userPathLength,
  shortestPathLength,
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
        <PathInfo
          userPathLength={userPathLength}
          shortestPathLength={shortestPathLength}
        />
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-600 ring-2 ring-green-900" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-red-900" />
            <span>Ziel</span>
          </div>
        </div>
        {showExplorationLegend && (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
            <div className="mb-2 font-medium">Legende zur Exploration</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: "#ff2d95" }}
                />
                <span>Aktuell entdeckte Kante</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: "#7c3aed" }}
                />
                <span>Aktuell geprüfte bekannte Kante</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: "#fff200" }}
                />
                <span>Bereits entdeckte Kanten</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: "#a3e635" }}
                />
                <span>Bereits geprüfte bekannte Kanten</span>
              </div>
            </div>
          </div>
        )}
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
