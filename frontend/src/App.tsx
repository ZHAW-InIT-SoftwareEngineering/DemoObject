import { useMemo } from "react";
import { useDemo, 
         usePathSelection, 
         useShortestPath,
         useToast } from "./hooks/";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { MazeView } from "@/util";

export default function App() {
  const mazeId = 0;

  const { loading, session, maze, error, start } = useDemo();
  
  const {
    selectedNodeIds,
    highlightedEdgeKeys,
    apiRequest,
    selectNode,
    resetPath,
    getDSL,
    dsl,
    submitError,
    submitting,
    lastSubmittedKey,
  } = usePathSelection(maze, session?.sessionId);
  
  const { shortestPath, getShortestPath } = useShortestPath();
  
  const { toast, showToast } = useToast();

  const handleStartAdventure = () => {
    start(mazeId);
  };

  const pathKey = useMemo(() => selectedNodeIds.join(","), [selectedNodeIds]);
  const shortestPathEdgeKeys = useMemo(() => {
    if (!maze || !shortestPath?.path?.length) return [];
    const nodeIdByCoord = new Map<string, number>();
    for (const node of maze.nodes ?? []) {
      nodeIdByCoord.set(`${node.x},${node.y}`, node.mazeNodeId);
    }
    const ids: number[] = [];
    for (const point of shortestPath.path) {
      const id = nodeIdByCoord.get(`${point.x},${point.y}`);
      if (id !== undefined) ids.push(id);
    }
    if (ids.length < 2) return [];
    const keys: string[] = [];
    for (let i = 0; i < ids.length - 1; i += 1) {
      const from = ids[i];
      const to = ids[i + 1];
      keys.push(`${from}-${to}`);
      keys.push(`${to}-${from}`);
    }
    return keys;
  }, [maze, shortestPath?.path]);

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
        <MazeView
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
