import { useCallback, useState } from "react";
import type { NodePath } from "@/lib/path/transforms";


type AnimationStatus = "idle" | "playing" | "preview";

type AnimationState = {
    status: AnimationStatus;
    nodePath: NodePath;
};


export function usePathAnimation() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    status: "idle",
    nodePath: [],
  });

  const startAnimation = useCallback((nodePath: NodePath) => {
    if (nodePath.length < 2) return false;

    setAnimationState((s) =>
      s.status === "idle"
        ? { status: "playing", nodePath: [...nodePath] }
        : s,
    );

    return true;
  }, []);

  const startPreviewAnimation = useCallback((nodePath: NodePath) => {
    setAnimationState(() => ({ status: "preview", nodePath: [...nodePath] }));
  }, []);

  const onCompleteAnimation = useCallback(() => {
    setAnimationState((s) =>
      s.status === "playing"
        ? { status: "idle", nodePath: [] }
        : s,
    );
  }, []);

  const closeAnimationView = useCallback(() => {
    setAnimationState((s) =>
      s.status === "idle"
        ? s
        : { status: "idle", nodePath: [] },
    );
  }, []);

  return {
    animationState,
    startAnimation,
    startPreviewAnimation,
    onCompleteAnimation,
    closeAnimationView,
  };
};
