import { useState } from "react";
import { sessionsApi, mazeApi } from "./lib/api";
import { Button } from "@/components/ui/button"; 

export default function App() {
const [loading, setLoading] = useState(false);
const [session, setSession] = useState<any>(null);
const [maze, setMaze] = useState<any>(null);
const [error, setError] = useState<string | null>(null);

const startAdventure = async () => {
    setLoading(true);
    setError(null);

    try {
    const sessionRes = await sessionsApi.sessionsPost({
        sessionsPostRequest: {mazeId: 0}, // if your backend expects fields, put them here
    });
    setSession(sessionRes);

    const mazeRes = await mazeApi.mazesMazeIdGet({ mazeId: 0 });
    setMaze(mazeRes);
    } catch (e: any) {
    setError(e?.message ?? "Something went wrong");
    } finally {
    setLoading(false);
    }
};

return (
    <div className="p-6 space-y-4">
    <Button onClick={startAdventure} disabled={loading}>
        {loading ? "Starting..." : "Start Adventure"}
    </Button>

    {error && <div className="text-red-600">{error}</div>}

    {session && (
        <pre className="bg-gray-100 p-3 rounded">
        {JSON.stringify(session, null, 2)}
        </pre>
    )}

    {maze && (
        <pre className="bg-gray-100 p-3 rounded">
        {JSON.stringify(maze, null, 2)}
        </pre>
    )}
    </div>
);
}