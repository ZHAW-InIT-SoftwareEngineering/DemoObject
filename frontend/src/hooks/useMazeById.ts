import { useEffect, useState } from "react";
import type { MazesMazeIdGet200Response } from "@/api";
import { getMazeById } from "@/services/maze";

type UseMazeByIdResult = {
  loading: boolean;
  maze: MazesMazeIdGet200Response | null;
  error: string | null;
};

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function useMazeById(mazeId?: number | null): UseMazeByIdResult {
  const [loading, setLoading] = useState(Boolean(mazeId !== null && mazeId !== undefined));
  const [maze, setMaze] = useState<MazesMazeIdGet200Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (mazeId === null || mazeId === undefined) {
      setLoading(false);
      setMaze(null);
      setError(null);
      return;
    }

    setLoading(true);
    setMaze(null);
    setError(null);

    const loadMaze = async () => {
      try {
        const mazeRes = await getMazeById(mazeId);

        if (cancelled) return;

        setMaze(mazeRes);
      } catch (error: unknown) {
        if (cancelled) return;

        setMaze(null);
        setError(
          getErrorMessage(error, "Das Labyrinth konnte nicht geladen werden."),
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMaze();

    return () => {
      cancelled = true;
    };
  }, [mazeId]);

  return { loading, maze, error };
}
