import { useCallback, useEffect, useMemo, useState } from "react";
import {
  readPersistedDemoTheoryProgress,
  writePersistedDemoTheoryProgress,
} from "@/lib/demoTheoryProgressStorage";

export type TheoryTopic = "dsl" | "shortestPath";

type UseMazeTheoryProgressOptions = {
  mazeId?: number | null;
  sessionId?: string | null;
};

type TheoryProgressState = {
  visitedDsl: boolean;
  visitedShortestPath: boolean;
};

const INITIAL_PROGRESS_STATE: TheoryProgressState = {
  visitedDsl: false,
  visitedShortestPath: false,
};

export function useMazeTheoryProgress({
  mazeId,
  sessionId,
}: UseMazeTheoryProgressOptions) {
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<TheoryProgressState>(
    INITIAL_PROGRESS_STATE,
  );

  useEffect(() => {
    setHydrated(false);

    if (mazeId === null || mazeId === undefined || !sessionId) {
      setProgress(INITIAL_PROGRESS_STATE);
      setHydrated(true);
      return;
    }

    const persistedProgress = readPersistedDemoTheoryProgress(sessionId, mazeId);

    setProgress({
      visitedDsl: persistedProgress?.visitedDsl ?? false,
      visitedShortestPath: persistedProgress?.visitedShortestPath ?? false,
    });
    setHydrated(true);
  }, [mazeId, sessionId]);

  const markVisited = useCallback(
    (topic: TheoryTopic) => {
      if (mazeId === null || mazeId === undefined || !sessionId) {
        return;
      }

      setProgress((previousProgress) => {
        const nextProgress =
          topic === "dsl"
            ? { ...previousProgress, visitedDsl: true }
            : { ...previousProgress, visitedShortestPath: true };

        if (
          nextProgress.visitedDsl === previousProgress.visitedDsl &&
          nextProgress.visitedShortestPath === previousProgress.visitedShortestPath
        ) {
          return previousProgress;
        }

        writePersistedDemoTheoryProgress(
          sessionId,
          mazeId,
          nextProgress.visitedDsl,
          nextProgress.visitedShortestPath,
        );

        return nextProgress;
      });
    },
    [mazeId, sessionId],
  );

  const hasVisitedBoth = progress.visitedDsl && progress.visitedShortestPath;

  return useMemo(
    () => ({
      hydrated,
      visitedDsl: progress.visitedDsl,
      visitedShortestPath: progress.visitedShortestPath,
      hasVisitedBoth,
      markVisited,
    }),
    [hasVisitedBoth, hydrated, markVisited, progress],
  );
}
