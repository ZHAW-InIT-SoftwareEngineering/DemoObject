import { useCallback, useMemo, useState } from "react";
import type { NodePath } from "@/lib/path/transforms";
import { toast } from "sonner";

type AnimationPathChoice = "user" | "shortest";

type UseAnimationPathSelectionOptions = {
  userNodePath: NodePath;
  shortestNodePath: NodePath;
  startAnimation: (nodePath: NodePath) => boolean;
  startPreviewAnimation: (nodePath: NodePath) => void;
};

type UseAnimationPathSelectionResult = {
  animationPathSelectionOpen: boolean;
  setAnimationPathSelectionOpen: (open: boolean) => void;
  canUseUserPath: boolean;
  canUseShortestPath: boolean;
  hasAnimatablePath: boolean;
  onShowAnimation: () => void;
  onSelectAnimationPath: (choice: AnimationPathChoice) => void;
  onOpen3DPreview: () => void;
};

export function useAnimationPathSelection({
  userNodePath,
  shortestNodePath,
  startAnimation,
  startPreviewAnimation,
}: UseAnimationPathSelectionOptions): UseAnimationPathSelectionResult {
  const [animationPathSelectionOpen, setAnimationPathSelectionOpen] =
    useState(false);

  const canUseUserPath = userNodePath.length > 1;
  const canUseShortestPath = shortestNodePath.length > 1;
  const hasAnimatablePath = canUseUserPath || canUseShortestPath;

  const preferredAnimationNodePath = useMemo(
    () => (canUseShortestPath ? shortestNodePath : userNodePath),
    [canUseShortestPath, shortestNodePath, userNodePath],
  );

  const onShowAnimation = useCallback(() => {
    if (!hasAnimatablePath) {
      toast.error("Kein Pfad zum Animieren verfügbar.");
      return;
    }

    setAnimationPathSelectionOpen(true);
  }, [hasAnimatablePath]);

  const onSelectAnimationPath = useCallback(
    (choice: AnimationPathChoice) => {
      const animationNodePath =
        choice === "shortest" ? shortestNodePath : userNodePath;

      if (!startAnimation(animationNodePath)) {
        toast.error("Kein Pfad zum Animieren verfügbar.");
        return;
      }

      setAnimationPathSelectionOpen(false);
      toast("Pfadanimation läuft.");
    },
    [shortestNodePath, startAnimation, userNodePath],
  );

  const onOpen3DPreview = useCallback(() => {
    startPreviewAnimation(preferredAnimationNodePath);
  }, [preferredAnimationNodePath, startPreviewAnimation]);

  return {
    animationPathSelectionOpen,
    setAnimationPathSelectionOpen,
    canUseUserPath,
    canUseShortestPath,
    hasAnimatablePath,
    onShowAnimation,
    onSelectAnimationPath,
    onOpen3DPreview,
  };
}
