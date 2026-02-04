import { useAdventure } from "./hooks/";
import { Button } from "@/components/ui/button";
import { MazeView } from "@/util";

export default function App() {
  const { loading, session, maze, error, start } = useAdventure();

  const handleStartAdventure = () => {
    const mazeId = 0;
    start(mazeId);
  };

  return (
    <div className="p-6 space-y-4">
    <Button onClick={handleStartAdventure} disabled={loading}>
      {loading ? "Starting..." : "Start Adventure"}
    </Button>

    {error && <div className="text-red-600">{error}</div>}

    {session && (
        <pre className="bg-gray-100 p-3 rounded">
        {JSON.stringify(session, null, 2)}
        </pre>
    )}

    {maze && (
      <MazeView
        maze={maze}
        className="border rounded bg-white"
        onNodeClick={(node) => console.log("node clicked", node)}
      />
    )}
    </div>
  );
}
