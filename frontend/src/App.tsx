import {
  useDemo,
  usePathSelection,
  useShortestPath,
  useShortestPathEdgeKeys,
} from "./hooks/";
import { Toaster } from "@/components/ui";
import { ActionPanel } from "@/components/app/ActionPanel";
import { DslStrip } from "@/components/app/DslStrip";
import { MazePanel } from "@/components/app/MazePanel";
import { PathInfo } from "@/components/app/PathInfo";
import { StartScreen } from "@/components/app/StartScreen";
import { toast } from "sonner";

export default function App() {
  const mazeId = 0;

  const { loading, session, maze, error, start } = useDemo();
  
  const {
    selectedNodeIds,
    highlightedEdgeKeys,
    apiRequest,
    pathKey,
    selectNode,
    undoNodeSelection,
    resetPath,
    getDSL,
    dsl,
    submitError,
    submitting,
    lastSubmittedKey,
  } = usePathSelection(maze, session?.sessionId);
  
  const { shortestPath, getShortestPath } = useShortestPath();
  const shortestPathEdgeKeys = useShortestPathEdgeKeys(
    maze,
    shortestPath?.path,
  );
  const userPathLength = Math.max(0, selectedNodeIds.length - 1);
  
  const handleStartAdventure = () => {
    start(mazeId);
  };

  const handleResetPath = () => {
    resetPath();
  };

  const handleSubmitPath = async () => {
    const response = await getDSL();
    if (response) {
      toast.success("Path submitted.");
    } else {
      toast.error("Failed to submit path.");
    }
  };

  const handleShortestPath = async () => {
    try {
      const shortestPathRes = await getShortestPath(mazeId);
      if (shortestPathRes) {
        toast.success("Shortest path loaded.");
      } else {
        toast.error("Failed to compute shortest path.");
      }
    } catch (err: any) {
      console.error("Failed to find a shortest path.")
      toast.error("Failed to find a shortest path.");
    }
  }

  const handleUndoNodeSelection = () => {
    undoNodeSelection();
  };

  const handleShowAnimation = () => {
    toast("Path animation is not implemented yet.");
  };

  const isPathSubmitted =
    Boolean(lastSubmittedKey) && pathKey === lastSubmittedKey;
  const hasShortestPathDisplayed = shortestPathEdgeKeys.length > 0;
  const canShowAnimation = isPathSubmitted && hasShortestPathDisplayed;

  const isStartScreen = !session;

  return (
    <div
      className={
        isStartScreen
          ? "min-h-screen p-6 flex flex-col items-center justify-center"
          : "min-h-screen p-6 flex flex-col items-center justify-start md:justify-center"
      }
    >
      <Toaster />

      {isStartScreen ? (
        <div className="w-full max-w-[520px] space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          <StartScreen loading={loading} onStart={handleStartAdventure} />
        </div>
      ) : (
        <div className="w-full max-w-[520px] space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          {submitError && <div className="text-red-600">{submitError}</div>}
          <DslStrip dsl={dsl} />
          {maze && (
            <PathInfo
              userPathLength={userPathLength}
              shortestPathLength={shortestPath?.length}
            />
          )}
          {maze && (
            <MazePanel
              maze={maze}
              onNodeClick={selectNode}
              onUndo={handleUndoNodeSelection}
              onShowAnimation={handleShowAnimation}
              isPathSubmitted={isPathSubmitted}
              canShowAnimation={canShowAnimation}
              selectedNodeIds={selectedNodeIds}
              highlightedEdgeKeys={highlightedEdgeKeys}
              secondaryHighlightedEdgeKeys={shortestPathEdgeKeys}
            />
          )}
          <ActionPanel
            maze={maze}
            pathState={{
              selectedNodeIds,
              apiRequest,
              submitting,
              pathKey,
              lastSubmittedKey,
              hasShortestPathDisplayed,
            }}
            actions={{
              onReset: handleResetPath,
              onSubmit: handleSubmitPath,
              onShortestPath: handleShortestPath,
            }}
          />
        </div>
      )}
    </div>
  );
}
