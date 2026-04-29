import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MazesMazeIdShortestPathGet200Response,
  MazesMazeIdShortestPathGet200ResponseExplorationStepsInner,
} from "@/api";
import { useEdgePlayback, useMazeById, useShortestPathNodePath } from "@/hooks";
import { undirectedEdgeKey } from "@/lib/path/transforms";
import {
  getShortestPath,
  ShortestPathAlgorithm,
  type ShortestPathAlgorithm as ShortestPathAlgorithmType,
} from "@/services/maze";

const EXPLORATION_SETTLE_MS = 550;

type TheoryExplorationEdgeStep = {
  edgeKey: string;
  discovered: boolean;
  candidateCost: number;
  fromId: number;
  toId: number;
};

type UseTheoryShortestPathDemoOptions = {
  mazeId: number;
  algorithm: ShortestPathAlgorithmType;
  isActive: boolean;
  explorationStepMs?: number;
  shortestPathStepMs?: number;
};

export function useTheoryShortestPathDemo({
  mazeId,
  algorithm,
  isActive,
  explorationStepMs = 140,
  shortestPathStepMs = 260,
}: UseTheoryShortestPathDemoOptions) {
  const { loading: mazeLoading, maze, error: mazeError } = useMazeById(mazeId);
  const [shortestPath, setShortestPath] =
    useState<MazesMazeIdShortestPathGet200Response | null>(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);
  const shortestPathNodePath = useShortestPathNodePath(maze, shortestPath?.path);

  useEffect(() => {
    let cancelled = false;

    if (!maze) {
      setShortestPath(null);
      setPathLoading(false);
      setPathError(null);
      return;
    }

    setPathLoading(true);
    setPathError(null);

    const loadShortestPath = async () => {
      try {
        const response = await getShortestPath(mazeId, algorithm);
        if (cancelled) return;
        setShortestPath(response);
      } catch (error: unknown) {
        if (cancelled) return;

        const message =
          error instanceof Error && error.message
            ? error.message
            : "Der kuerzeste Pfad konnte nicht geladen werden.";
        setShortestPath(null);
        setPathError(message);
      } finally {
        if (!cancelled) {
          setPathLoading(false);
        }
      }
    };

    void loadShortestPath();

    return () => {
      cancelled = true;
    };
  }, [algorithm, maze, mazeId]);

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
          discovered: step.discovered || step.improved,
          candidateCost: step.candidateCost,
          fromId,
          toId,
        } satisfies TheoryExplorationEdgeStep;
      })
      .filter((step): step is TheoryExplorationEdgeStep => step !== null);
  }, [maze, shortestPath?.explorationSteps]);

  const [shortestPathPlaybackKey, setShortestPathPlaybackKey] = useState(0);
  const [explorationPlaybackKey, setExplorationPlaybackKey] = useState(0);
  const [visibleExplorationStepCount, setVisibleExplorationStepCount] =
    useState(0);
  const [revealedExplorationStepCount, setRevealedExplorationStepCount] =
    useState(0);
  const [isShortestPathPlaybackActive, setIsShortestPathPlaybackActive] =
    useState(false);

  const triggerShortestPathPlayback = useCallback(() => {
    setVisibleExplorationStepCount(0);
    setIsShortestPathPlaybackActive(true);
    setShortestPathPlaybackKey((currentKey) => currentKey + 1);
  }, []);

  const replay = useCallback(() => {
    if (!shortestPath) return;

    setVisibleExplorationStepCount(0);
    setRevealedExplorationStepCount(0);
    setIsShortestPathPlaybackActive(false);

    if (explorationEdgeSteps.length === 0) {
      triggerShortestPathPlayback();
      return;
    }

    setExplorationPlaybackKey((currentKey) => currentKey + 1);
    setVisibleExplorationStepCount(1);
  }, [explorationEdgeSteps.length, shortestPath, triggerShortestPathPlayback]);

  useEffect(() => {
    if (!isActive) {
      setVisibleExplorationStepCount(0);
      setRevealedExplorationStepCount(0);
      setIsShortestPathPlaybackActive(false);
      return;
    }

    if (shortestPath) {
      replay();
    }
  }, [isActive, replay, shortestPath]);

  const handleShortestPathPlaybackComplete = useCallback(() => {
    setIsShortestPathPlaybackActive(false);
  }, []);

  const { visibleNodePath: animatedShortestPathNodePath } = useEdgePlayback({
    nodePath:
      isActive && isShortestPathPlaybackActive ? shortestPathNodePath : [],
    onComplete: handleShortestPathPlaybackComplete,
    stepMs: shortestPathStepMs,
    settleMs: 0,
    restartKey: shortestPathPlaybackKey,
  });

  useEffect(() => {
    setRevealedExplorationStepCount((currentCount) =>
      Math.max(currentCount, visibleExplorationStepCount),
    );
  }, [visibleExplorationStepCount]);

  useEffect(() => {
    if (
      !isActive ||
      explorationPlaybackKey === 0 ||
      visibleExplorationStepCount === 0
    ) {
      return;
    }

    if (visibleExplorationStepCount < explorationEdgeSteps.length) {
      const timer = window.setTimeout(() => {
        setVisibleExplorationStepCount((currentCount) => currentCount + 1);
      }, explorationStepMs);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      triggerShortestPathPlayback();
    }, EXPLORATION_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [
    explorationEdgeSteps.length,
    explorationPlaybackKey,
    explorationStepMs,
    isActive,
    triggerShortestPathPlayback,
    visibleExplorationStepCount,
  ]);

  const visibleExplorationSteps = explorationEdgeSteps.slice(
    0,
    visibleExplorationStepCount,
  );
  const revealedExplorationSteps = explorationEdgeSteps.slice(
    0,
    revealedExplorationStepCount,
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
  const observedEdgeKeys = Array.from(
    new Set(revealedExplorationSteps.map((step) => step.edgeKey)),
  );
  const observedNodeIds = Array.from(
    new Set([
      ...(maze?.startNodeId !== undefined ? [maze.startNodeId] : []),
      ...revealedExplorationSteps.flatMap((step) => [step.fromId, step.toId]),
    ]),
  );

  const displayedShortestPathNodePath =
    visibleExplorationStepCount > 0
      ? []
      : isShortestPathPlaybackActive
        ? animatedShortestPathNodePath
        : shortestPathNodePath;

  const focusNodeId =
    currentExplorationStep?.fromId ??
    displayedShortestPathNodePath[displayedShortestPathNodePath.length - 1] ??
    maze?.startNodeId ??
    null;

  return useMemo(
    () => ({
      maze,
      shortestPath,
      loading: mazeLoading || pathLoading,
      error: mazeError ?? pathError,
      displayedShortestPathNodePath,
      explorationDiscoveredEdgeKeys,
      explorationSeenEdgeKeys,
      currentExplorationEdgeKey: currentExplorationStep?.edgeKey ?? null,
      currentExplorationEdgeDiscovered:
        currentExplorationStep?.discovered ?? false,
      currentCandidateCost: currentExplorationStep?.candidateCost ?? null,
      exploredStepCount: visibleExplorationStepCount,
      totalExplorationStepCount: explorationEdgeSteps.length,
      totalNodeCount: maze?.nodes?.length ?? 0,
      observedEdgeKeys,
      observedNodeIds,
      focusNodeId,
      replay,
      isAnimating:
        visibleExplorationStepCount > 0 || isShortestPathPlaybackActive,
    }),
    [
      currentExplorationStep,
      displayedShortestPathNodePath,
      explorationDiscoveredEdgeKeys,
      explorationEdgeSteps.length,
      explorationSeenEdgeKeys,
      focusNodeId,
      isShortestPathPlaybackActive,
      maze,
      mazeError,
      mazeLoading,
      observedEdgeKeys,
      observedNodeIds,
      pathError,
      pathLoading,
      replay,
      shortestPath,
      visibleExplorationStepCount,
    ],
  );
}

export const THEORY_SHORTEST_PATH_ALGORITHM = ShortestPathAlgorithm;
