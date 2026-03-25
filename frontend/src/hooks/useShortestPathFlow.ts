import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdShortestPathGet200Response,
  MazesMazeIdShortestPathGet200ResponseExplorationStepsInner,
} from "@/api";
import {
  readPersistedDemoPathSubmission,
  writePersistedDemoPathSubmissionShortestPath,
} from "@/lib/demoPathSubmissionStorage";
import { undirectedEdgeKey } from "@/lib/path/transforms";
import { getShortestPath as getShortestPathService } from "../services/maze";
import { useEdgePlayback } from "./useEdgePlayback";
import { usePerfectPathCelebration } from "./usePerfectPathCelebration";
import { useShortestPathNodePath } from "./useShortestPathNodePath";

const SHORTEST_PATH_STEP_MS = 320;
const EXPLORATION_STEP_MS = 105;
const EXPLORATION_SETTLE_MS = 420;

export type ShortestPathRequestResult = "success" | "missing" | "error";

type UseShortestPathFlowOptions = {
  maze: MazesMazeIdGet200Response | null;
  pathKey: string;
  sessionId?: string | null;
  lastSubmittedKey: string | null;
  userPathLength: number;
};

type ExplorationEdgeStep = {
  edgeKey: string;
  discovered: boolean;
};

export function useShortestPathFlow({
  maze,
  pathKey,
  sessionId,
  lastSubmittedKey,
  userPathLength,
}: UseShortestPathFlowOptions) {
  const [shortestPath, setShortestPath] =
    useState<MazesMazeIdShortestPathGet200Response | null>(null);
  const submissionScopeKey =
    maze && sessionId ? `${maze.mazeId}:${sessionId}:${pathKey}` : null;
  const currentSubmissionScopeKeyRef = useRef<string | null>(submissionScopeKey);

  currentSubmissionScopeKeyRef.current = submissionScopeKey;

  useEffect(() => {
    setVisibleExplorationStepCount(0);
  }, [submissionScopeKey]);

  useEffect(() => {
    if (!maze || !sessionId || !submissionScopeKey) {
      setShortestPath(null);
      return;
    }

    const persistedSubmission = readPersistedDemoPathSubmission(
      sessionId,
      maze.mazeId,
      pathKey,
    );

    setShortestPath(persistedSubmission?.shortestPath ?? null);
  }, [maze, pathKey, sessionId, submissionScopeKey]);

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
  const explorationEdgeSteps = useMemo(() => {
    if (!maze || !shortestPath?.explorationSteps?.length) return [];

    const nodeIdByCoord = new Map<string, number>();
    for (const node of maze.nodes ?? []) {
      nodeIdByCoord.set(`${node.x},${node.y}`, node.mazeNodeId);
    }

    return shortestPath.explorationSteps
      .map((step: MazesMazeIdShortestPathGet200ResponseExplorationStepsInner) => {
        const fromId = nodeIdByCoord.get(`${step.from.x},${step.from.y}`);
        const toId = nodeIdByCoord.get(`${step.to.x},${step.to.y}`);
        if (fromId === undefined || toId === undefined) {
          return null;
        }

        return {
          edgeKey: undirectedEdgeKey(fromId, toId),
          discovered: step.discovered,
        };
      })
      .filter((step): step is ExplorationEdgeStep => step !== null);
  }, [maze, shortestPath?.explorationSteps]);
  const [shortestPathPlaybackKey, setShortestPathPlaybackKey] = useState(0);
  const [explorationPlaybackKey, setExplorationPlaybackKey] = useState(0);
  const [visibleExplorationStepCount, setVisibleExplorationStepCount] =
    useState(0);

  const triggerShortestPathPlayback = useCallback(() => {
    setVisibleExplorationStepCount(0);
    setShortestPathPlaybackKey((key) => key + 1);
  }, []);

  const handleShortestPathPlaybackComplete = useCallback(() => {}, []);
  const { visibleNodePath: displayedShortestPathNodePath } = useEdgePlayback({
    nodePath: visibleExplorationStepCount > 0 ? [] : shortestPathNodePath,
    onComplete: handleShortestPathPlaybackComplete,
    stepMs: SHORTEST_PATH_STEP_MS,
    settleMs: 0,
    restartKey: shortestPathPlaybackKey,
  });

  useEffect(() => {
    if (explorationPlaybackKey === 0 || visibleExplorationStepCount === 0) {
      return;
    }

    if (visibleExplorationStepCount < explorationEdgeSteps.length) {
      const timer = window.setTimeout(() => {
        setVisibleExplorationStepCount((count) => count + 1);
      }, EXPLORATION_STEP_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      triggerShortestPathPlayback();
    }, EXPLORATION_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [
    explorationEdgeSteps.length,
    explorationPlaybackKey,
    triggerShortestPathPlayback,
    visibleExplorationStepCount,
  ]);

  const isPathSubmitted =
    Boolean(lastSubmittedKey) && pathKey === lastSubmittedKey;
  const hasShortestPathDisplayed = shortestPathNodePath.length > 1;
  const hasShortestPathForCurrentSubmission =
    isPathSubmitted && hasShortestPathDisplayed;

  const persistShortestPath = useCallback(
    (nextShortestPath: MazesMazeIdShortestPathGet200Response) => {
      if (!maze || !sessionId || !submissionScopeKey) return;

      writePersistedDemoPathSubmissionShortestPath(
        sessionId,
        maze.mazeId,
        pathKey,
        nextShortestPath,
      );

      if (currentSubmissionScopeKeyRef.current === submissionScopeKey) {
        setShortestPath(nextShortestPath);
      }
    },
    [maze, pathKey, sessionId, submissionScopeKey],
  );

  const fetchShortestPath = useCallback(async () => {
    if (!maze || !isPathSubmitted || !submissionScopeKey) {
      return null;
    }

    const shortestPathResponse = await getShortestPathService(maze.mazeId);
    if (!shortestPathResponse) {
      return null;
    }

    persistShortestPath(shortestPathResponse);
    maybeCelebrateForPathLength(userPathLength, shortestPathResponse.length);
    return shortestPathResponse;
  }, [
    isPathSubmitted,
    maze,
    maybeCelebrateForPathLength,
    persistShortestPath,
    submissionScopeKey,
    userPathLength,
  ]);

  const requestShortestPath = useCallback(async () => {
    const requestScopeKey = submissionScopeKey;

    try {
      const shortestPathResponse = await fetchShortestPath();
      if (!shortestPathResponse) {
        return "missing" as const;
      }

      if (
        !requestScopeKey ||
        currentSubmissionScopeKeyRef.current !== requestScopeKey
      ) {
        return "success" as const;
      }

      if ((shortestPathResponse.explorationSteps?.length ?? 0) === 0) {
        triggerShortestPathPlayback();
        return "success" as const;
      }

      setExplorationPlaybackKey((key) => key + 1);
      setVisibleExplorationStepCount(1);
      return "success" as const;
    } catch {
      return "error" as const;
    }
  }, [fetchShortestPath, submissionScopeKey, triggerShortestPathPlayback]);

  const visibleExplorationSteps = explorationEdgeSteps.slice(
    0,
    visibleExplorationStepCount,
  );
  const explorationDiscoveredEdgeKeys = visibleExplorationSteps
    .filter((step) => step.discovered)
    .map((step) => step.edgeKey);
  const explorationSeenEdgeKeys = visibleExplorationSteps
    .filter((step) => !step.discovered)
    .map((step) => step.edgeKey);
  const currentExplorationStep =
    visibleExplorationStepCount > 0
      ? visibleExplorationSteps[visibleExplorationSteps.length - 1] ?? null
      : null;

  return useMemo(
    () => ({
      shortestPath,
      shortestPathNodePath,
      displayedShortestPathNodePath,
      explorationDiscoveredEdgeKeys,
      explorationSeenEdgeKeys,
      currentExplorationEdgeKey: currentExplorationStep?.edgeKey ?? null,
      currentExplorationEdgeDiscovered:
        currentExplorationStep?.discovered ?? false,
      requestShortestPath: requestShortestPath as () => Promise<ShortestPathRequestResult>,
      showCelebrationOverlay,
      dismissCelebrationOverlay,
      hasShortestPathForCurrentSubmission,
      isExplorationAnimating: visibleExplorationStepCount > 0,
    }),
    [
      currentExplorationStep,
      dismissCelebrationOverlay,
      displayedShortestPathNodePath,
      explorationDiscoveredEdgeKeys,
      explorationSeenEdgeKeys,
      hasShortestPathForCurrentSubmission,
      requestShortestPath,
      shortestPath,
      shortestPathNodePath,
      showCelebrationOverlay,
      visibleExplorationStepCount,
    ],
  );
}
