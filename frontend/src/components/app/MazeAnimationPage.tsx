import { useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMazeFlow } from "@/components/app/MazeFlowProvider";
import { AnimationView } from "@/components/app/animation/AnimationView";
import { useAnimationScenePlayback, useDemoSession } from "@/hooks";

export function MazeAnimationPage() {
  const navigate = useNavigate();
  const { maze } = useDemoSession();
  const {
    animationState,
    completeAnimation,
    closePlayback,
  } = useMazeFlow();

  useEffect(() => {
    if (animationState.status === "playing") return;
    void navigate({ to: "/maze", replace: true });
  }, [animationState.status, navigate]);

  const handleAnimationComplete = useCallback(() => {
    completeAnimation();
  }, [completeAnimation]);

  const { progress, total, sceneData } = useAnimationScenePlayback({
    maze,
    nodePath: animationState.status === "playing" ? animationState.nodePath : [],
    userNodePath: animationState.userNodePath,
    shortestNodePath: animationState.shortestNodePath,
    onComplete: handleAnimationComplete,
    stepMs: 260,
    settleMs: 5200,
  });

  if (!maze || animationState.status !== "playing") {
    return null;
  }

  return (
    <AnimationView
      sceneData={sceneData}
      progress={progress}
      total={total}
      onClose={closePlayback}
    />
  );
}
