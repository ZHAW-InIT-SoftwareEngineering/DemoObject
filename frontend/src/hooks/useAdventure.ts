import { useCallback, useState } from "react";
import { startAdventure } from "../services";

export function useAdventure() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [maze, setMaze] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (mazeId: number) => {
    setLoading(true);
    setError(null);

    try {
      const { sessionRes, mazeRes } = await startAdventure(mazeId);
      setSession(sessionRes);
      setMaze(mazeRes);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, session, maze, error, start };
}
