import { useDemo, 
         usePathSelection, 
         useShortestPath,
         useShortestPathEdgeKeys,
         useToast } from "./hooks/";
import { Button } from "@/components/ui";
import { Toast } from "@/components/ui";
import { Maze } from "@/components/ui";

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

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        {!session && (
          <Button onClick={handleStartAdventure} disabled={loading}>
            {loading ? "Starting..." : "Start Adventure"}
          </Button>
        )}
        {session && (
          <Button
            onClick={handleResetPath}
            variant="secondary"
            disabled={!selectedNodeIds.length}
          >
            Reset Path
          </Button>
        )}
        {session && (
          <Button
            onClick={handleSubmitPath}
            disabled={
              !apiRequest ||
              submitting ||
              selectedNodeIds.length < 2 ||
              pathKey === lastSubmittedKey
            }
          >
            {submitting ? "Submitting..." : "Submit Path"}
          </Button>
        )}
        {session && (
          <Button
            onClick={handleShortestPath}
          >
            Shortest Path
          </Button>
        )}
      </div>

      {error && <div className="text-red-600">{error}</div>}
      {submitError && <div className="text-red-600">{submitError}</div>}
      <Toast toast={toast} />

      {dsl && dsl.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">DSL</div>
          <div className="flex flex-wrap items-center gap-2">
            {dsl.map((token, index) => (
              <div key={`${token}-${index}`} className="flex items-center gap-2">
                <span className="rounded bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {token}
                </span>
                {index < dsl.length - 1 && (
                  <span className="text-gray-400">➞</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {maze && (
        <Maze
          maze={maze}
          className="border rounded bg-white"
          onNodeClick={selectNode}
          selectedNodeIds={selectedNodeIds}
          highlightedEdgeKeys={highlightedEdgeKeys}
          secondaryHighlightedEdgeKeys={shortestPathEdgeKeys}
        />
      )}

      {/*
      {apiRequest && (
        <pre className="bg-gray-100 p-3 rounded">
          {JSON.stringify(apiRequest, null, 2)}
        </pre>
      )}

      {session && (
        <pre className="bg-gray-100 p-3 rounded">
          {JSON.stringify(session, null, 2)}
        </pre>
      )}
      */}
      
    </div>
  );
}
