import { useMemo } from "react";
import type { MazesMazeIdGet200Response } from "@/api";
import { buildAnimationSceneData, type AnimationSceneData } from "@/lib/animation";
import type { NodePath } from "@/lib/path/transforms";
import { useEdgePlayback } from "./useEdgePlayback";

type UseAnimationScenePlaybackOptions = {
  maze: MazesMazeIdGet200Response | null;
  nodePath: NodePath;
  userNodePath: NodePath;
  shortestNodePath: NodePath;
  onComplete: () => void;
  stepMs?: number;
  settleMs?: number;
};

type UseAnimationScenePlaybackResult = {
  visibleNodePath: NodePath;
  progress: number;
  total: number;
  sceneData: AnimationSceneData;
};

export function useAnimationScenePlayback({
  maze,
  nodePath,
  userNodePath,
  shortestNodePath,
  onComplete,
  stepMs = 220,
  settleMs = 450,
}: UseAnimationScenePlaybackOptions): UseAnimationScenePlaybackResult {
  const { visibleNodePath, progress, total } = useEdgePlayback({
    nodePath,
    onComplete,
    stepMs,
    settleMs,
  });

  const sceneData = useMemo(
    () =>
      buildAnimationSceneData(
        maze,
        nodePath,
        progress,
        userNodePath,
        shortestNodePath,
      ),
    [maze, nodePath, progress, userNodePath, shortestNodePath],
  );

  return {
    visibleNodePath,
    progress,
    total,
    sceneData,
  };
}
