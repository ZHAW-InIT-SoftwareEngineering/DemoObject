import { useCallback, useState } from "react";
import { getSessionId } from "../services";
import { getMazeById } from "../services/maze";

export function useDemo() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [maze, setMaze] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (mazeId: number) => {
    setLoading(true);
    setError(null);

    try {
      const sessionRes = await getSessionId(mazeId);
      setSession(sessionRes);
      const mazeRes = await getMazeById(mazeId)
      setMaze(mazeRes);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, session, maze, error, start };
}
