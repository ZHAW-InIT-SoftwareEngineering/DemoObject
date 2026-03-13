import { useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimationView } from "@/components/app/animation/AnimationView";
import { useDemoFlow } from "@/components/app/DemoFlowProvider";
import { useAnimationScenePlayback, useDemoSession } from "@/hooks";

export function MazeAnimationPage() {
  const navigate = useNavigate();
  const { maze } = useDemoSession();
  const {
    animationState,
    completeAnimation,
    nodePath,
    shortestPathNodePath,
  } = useDemoFlow();

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
    userNodePath: nodePath,
    shortestNodePath: shortestPathNodePath,
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
      onClose={handleAnimationComplete}
    />
  );
}
