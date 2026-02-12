import { useMemo } from "react";
import type { MazesMazeIdGet200Response } from "@/api";
import { buildAnimationSceneData, type AnimationSceneData } from "@/lib/animation";
import type { NodePath } from "@/lib/path/transforms";
import { useEdgePlayback } from "./useEdgePlayback";

type UseAnimationScenePlaybackOptions = {
  maze: MazesMazeIdGet200Response | null;
  nodePath: NodePath;
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
    () => buildAnimationSceneData(maze, nodePath, progress),
    [maze, nodePath, progress],
  );

  return {
    visibleNodePath,
    progress,
    total,
    sceneData,
  };
}
