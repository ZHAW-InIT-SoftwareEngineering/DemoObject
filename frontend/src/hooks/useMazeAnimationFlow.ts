import { useMemo } from "react";
import type { NodePath } from "@/lib/path/transforms";
import { useAnimationPathSelection } from "./useAnimationPathSelection";
import { usePathAnimation } from "./usePathAnimation";

type UseMazeAnimationFlowOptions = {
  userNodePath: NodePath;
  shortestNodePath: NodePath;
  isPathSubmitted: boolean;
  hasShortestPathForCurrentSubmission: boolean;
};

export function useMazeAnimationFlow({
  userNodePath,
  shortestNodePath,
  isPathSubmitted,
  hasShortestPathForCurrentSubmission,
}: UseMazeAnimationFlowOptions) {
  const {
    animationState,
    startAnimation,
    startPreviewAnimation,
    onCompleteAnimation,
    closeAnimationView,
  } = usePathAnimation();
  const {
    animationPathSelectionOpen,
    setAnimationPathSelectionOpen,
    canUseUserPath,
    canUseShortestPath,
    hasAnimatablePath,
    onShowAnimation,
    onSelectAnimationPath,
    onOpen3DPreview,
  } = useAnimationPathSelection({
    userNodePath,
    shortestNodePath,
    startAnimation,
    startPreviewAnimation,
  });

  const canShowAnimationButton =
    isPathSubmitted && hasShortestPathForCurrentSubmission && hasAnimatablePath;

  return useMemo(
    () => ({
      animationPathSelectionOpen,
      setAnimationPathSelectionOpen,
      canUseUserPath,
      canUseShortestPath,
      hasAnimatablePath,
      showAnimationPathSelection: onShowAnimation,
      selectAnimationPath: onSelectAnimationPath,
      open3DPreview: onOpen3DPreview,
      animationState,
      closeAnimationView,
      completeAnimation: onCompleteAnimation,
      canShowAnimationButton,
    }),
    [
      animationPathSelectionOpen,
      animationState,
      canShowAnimationButton,
      canUseShortestPath,
      canUseUserPath,
      closeAnimationView,
      hasAnimatablePath,
      onCompleteAnimation,
      onOpen3DPreview,
      onSelectAnimationPath,
      onShowAnimation,
      setAnimationPathSelectionOpen,
    ],
  );
}
