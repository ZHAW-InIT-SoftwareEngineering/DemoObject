import { useEffect, useMemo, useState } from "react";
import { useAdventure, usePathSelection } from "./hooks/";
import { Button } from "@/components/ui/button";
import { MazeView } from "@/util";
import { sessionsApi } from "@/lib";

export default function App() {
  const { loading, session, maze, error, start } = useAdventure();
  const {
    selectedNodeIds,
    highlightedEdgeKeys,
    apiRequest,
    selectNode,
    resetPath,
  } = usePathSelection(maze);
  const [dsl, setDsl] = useState<string[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedKey, setLastSubmittedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    kind: "success" | "error";
  } | null>(null);

  const handleStartAdventure = () => {
    const mazeId = 0;
    start(mazeId);
  };

  const pathKey = useMemo(() => selectedNodeIds.join(","), [selectedNodeIds]);

  useEffect(() => {
    setDsl(null);
    setSubmitError(null);
  }, [pathKey, session?.sessionId]);

  useEffect(() => {
    setLastSubmittedKey(null);
  }, [session?.sessionId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleResetPath = () => {
    resetPath();
    setDsl(null);
    setSubmitError(null);
    setLastSubmittedKey(null);
  };

  const handleSubmitPath = async () => {
    if (!session || !apiRequest) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await sessionsApi.sessionsSessionIdPathsPut({
        sessionId: session.sessionId,
        mazesMazeIdPathsDslPostRequest: apiRequest,
      });
      setDsl(response.dsl ?? null);
      setLastSubmittedKey(pathKey);
      setToast({ message: "Path submitted.", kind: "success" });
    } catch (err) {
      setSubmitError("Failed to submit path.");
      setToast({ message: "Failed to submit path.", kind: "error" });
    } finally {
      setSubmitting(false);
    }
  };

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
      </div>

      {error && <div className="text-red-600">{error}</div>}
      {submitError && <div className="text-red-600">{submitError}</div>}
      {toast && (
        <div
          className={`rounded px-3 py-2 text-sm font-medium ${
            toast.kind === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}

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
        />
      )}
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
    </div>
  );
}
