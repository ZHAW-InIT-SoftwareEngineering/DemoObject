import {
  useDemo,
  usePathSelection,
  useShortestPath,
  useShortestPathEdgeKeys,
  useToast,
} from "./hooks/";
import { Toast } from "@/components/ui";
import { ActionButtons } from "@/components/app/ActionButtons";
import { DslStrip } from "@/components/app/DslStrip";
import { MazePanel } from "@/components/app/MazePanel";
import { PathInfo } from "@/components/app/PathInfo";
import { StartScreen } from "@/components/app/StartScreen";

export default function App() {
  const mazeId = 0;

  const { loading, session, maze, error, start } = useDemo();
  
  const {
    selectedNodeIds,
    highlightedEdgeKeys,
    apiRequest,
    pathKey,
    selectNode,
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
  
  const { toast, showToast } = useToast();

  const handleStartAdventure = () => {
    start(mazeId);
  };

  const handleResetPath = () => {
    resetPath();
  };

  const handleSubmitPath = async () => {
    const response = await getDSL();
    if (response) {
      showToast("Path submitted.", "success");
    } else {
      showToast("Failed to submit path.", "error");
    }
  };

  const handleShortestPath = async () => {
    try {
      const shortestPathRes = await getShortestPath(mazeId);
      if (shortestPathRes) {
        showToast("Shortest path loaded.", "success");
      } else {
        showToast("Failed to compute shortest path.", "error");
      }
    } catch (err: any) {
      console.error("Failed to find a shortest path.")
      showToast("Failed to find a shortest path.", "error");
    }
  }

  const isStartScreen = !session;

  return (
    <div
      className={
        isStartScreen
          ? "min-h-screen p-6 flex flex-col items-center justify-center"
          : "min-h-screen p-6 flex flex-col items-center justify-start md:justify-center"
      }
    >
      <Toast toast={toast} />

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
              selectedNodeIds={selectedNodeIds}
              highlightedEdgeKeys={highlightedEdgeKeys}
              secondaryHighlightedEdgeKeys={shortestPathEdgeKeys}
            />
          )}
          <ActionButtons
            maze={maze}
            selectedNodeIds={selectedNodeIds}
            apiRequest={apiRequest}
            submitting={submitting}
            pathKey={pathKey}
            lastSubmittedKey={lastSubmittedKey}
            onReset={handleResetPath}
            onSubmit={handleSubmitPath}
            onShortestPath={handleShortestPath}
          />
        </div>
      )}
    </div>
  );
}
