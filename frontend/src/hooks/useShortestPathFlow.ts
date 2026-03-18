import { useCallback, useMemo, useState } from "react";
import type { MazesMazeIdGet200Response } from "@/api";
import { useEdgePlayback } from "./useEdgePlayback";
import { usePerfectPathCelebration } from "./usePerfectPathCelebration";
import { useShortestPath } from "./useShortestPath";
import { useShortestPathNodePath } from "./useShortestPathNodePath";

const DEFAULT_MAZE_ID = 0;

export type ShortestPathRequestResult = "success" | "missing" | "error";

type UseShortestPathFlowOptions = {
  maze: MazesMazeIdGet200Response | null;
  lastSubmittedKey: string | null;
  userPathLength: number;
};

export function useShortestPathFlow({
  maze,
  lastSubmittedKey,
  userPathLength,
}: UseShortestPathFlowOptions) {
  const { shortestPath, getShortestPath } = useShortestPath();
  const {
    showCelebrationOverlay,
    maybeCelebrateForPathLength,
    dismissCelebrationOverlay,
  } = usePerfectPathCelebration({
    shortestPathLength: shortestPath?.length,
  });
  const shortestPathNodePath = useShortestPathNodePath(
    maze,
    shortestPath?.path,
  );
  const handleShortestPathPlaybackComplete = useCallback(() => {}, []);
  const { visibleNodePath: displayedShortestPathNodePath } = useEdgePlayback({
    nodePath: shortestPathNodePath,
    onComplete: handleShortestPathPlaybackComplete,
    stepMs: 320,
    settleMs: 0,
  });
  const [lastShortestPathSubmissionKey, setLastShortestPathSubmissionKey] =
    useState<string | null>(null);

  const hasShortestPathDisplayed = shortestPathNodePath.length > 1;
  const hasShortestPathForCurrentSubmission =
    hasShortestPathDisplayed &&
    Boolean(lastSubmittedKey) &&
    lastSubmittedKey === lastShortestPathSubmissionKey;

  const clearShortestPathSubmissionLink = useCallback(() => {
    setLastShortestPathSubmissionKey(null);
  }, []);

  const requestShortestPath = useCallback(async () => {
    try {
      const shortestPathResponse = await getShortestPath(
        maze?.mazeId ?? DEFAULT_MAZE_ID,
      );
      if (!shortestPathResponse) {
        return "missing" as const;
      }

      if (lastSubmittedKey) {
        setLastShortestPathSubmissionKey(lastSubmittedKey);
      }

      maybeCelebrateForPathLength(userPathLength, shortestPathResponse.length);
      return "success" as const;
    } catch {
      return "error" as const;
    }
  }, [
    getShortestPath,
    lastSubmittedKey,
    maze?.mazeId,
    maybeCelebrateForPathLength,
    userPathLength,
  ]);

  return useMemo(
    () => ({
      shortestPath,
      shortestPathNodePath,
      displayedShortestPathNodePath,
      requestShortestPath: requestShortestPath as () => Promise<ShortestPathRequestResult>,
      showCelebrationOverlay,
      dismissCelebrationOverlay,
      hasShortestPathForCurrentSubmission,
      clearShortestPathSubmissionLink,
    }),
    [
      clearShortestPathSubmissionLink,
      dismissCelebrationOverlay,
      hasShortestPathForCurrentSubmission,
      requestShortestPath,
      shortestPath,
      displayedShortestPathNodePath,
      shortestPathNodePath,
      showCelebrationOverlay,
    ],
  );
}
