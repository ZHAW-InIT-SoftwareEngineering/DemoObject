import { useCallback, useEffect, useState } from "react";
import type { MazesMazeIdGet200Response, SessionsPost201Response } from "@/api";
import {
  clearPersistedDemoSession,
  readPersistedDemoSession,
  writePersistedDemoSession,
} from "@/lib/demoSessionStorage";
import { getSessionId } from "../services";
import { getMazeById } from "../services/maze";

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function useDemo() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionsPost201Response | null>(null);
  const [maze, setMaze] = useState<MazesMazeIdGet200Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const restoreAdventure = async () => {
      const persistedSession = readPersistedDemoSession();

      if (!persistedSession) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      setError(null);

      try {
        const mazeRes = await getMazeById(persistedSession.mazeId);

        if (cancelled) return;

        setSession(persistedSession.session);
        setMaze(mazeRes);
      } catch (error: unknown) {
        if (cancelled) return;

        setSession(null);
        setMaze(null);
        setError(
          getErrorMessage(
            error,
            "Die vorherige Sitzung konnte nicht wiederhergestellt werden.",
          ),
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void restoreAdventure();

    return () => {
      cancelled = true;
    };
  }, []);

  const startAdventure = useCallback(async (mazeId: number) => {
    setLoading(true);
    setError(null);
    setSession(null);
    setMaze(null);

    try {
      const sessionRes = await getSessionId(mazeId);
      const mazeRes = await getMazeById(mazeId);

      writePersistedDemoSession(sessionRes, mazeId);
      setSession(sessionRes);
      setMaze(mazeRes);
      return true;
    } catch (error: unknown) {
      clearPersistedDemoSession();
      setSession(null);
      setMaze(null);
      setError(getErrorMessage(error, "Etwas ist schiefgelaufen."));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, session, maze, error, startAdventure };
}
