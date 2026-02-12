import { useCallback, useEffect, useState } from "react";

type UsePerfectPathCelebrationOptions = {
  shortestPathLength: number | null | undefined;
  autoHideMs?: number;
};

type UsePerfectPathCelebrationResult = {
  showCelebrationOverlay: boolean;
  maybeCelebrateForPathLength: (
    pathLength: number,
    resolvedShortestPathLength?: number | null,
  ) => boolean;
  dismissCelebrationOverlay: () => void;
};

export function usePerfectPathCelebration({
  shortestPathLength,
  autoHideMs = 3200,
}: UsePerfectPathCelebrationOptions): UsePerfectPathCelebrationResult {
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);

  useEffect(() => {
    if (!showCelebrationOverlay) return;
    const timer = window.setTimeout(() => {
      setShowCelebrationOverlay(false);
    }, autoHideMs);

    return () => window.clearTimeout(timer);
  }, [autoHideMs, showCelebrationOverlay]);

  const dismissCelebrationOverlay = useCallback(() => {
    setShowCelebrationOverlay(false);
  }, []);

  const maybeCelebrateForPathLength = useCallback(
    (
      pathLength: number,
      resolvedShortestPathLength?: number | null,
    ) => {
      const effectiveShortestPathLength =
        resolvedShortestPathLength ?? shortestPathLength;

      if (
        effectiveShortestPathLength === null ||
        effectiveShortestPathLength === undefined
      ) {
        return false;
      }

      const shouldCelebrate = pathLength === effectiveShortestPathLength;

      if (shouldCelebrate) {
        setShowCelebrationOverlay(true);
      }

      return shouldCelebrate;
    },
    [shortestPathLength],
  );

  return {
    showCelebrationOverlay,
    maybeCelebrateForPathLength,
    dismissCelebrationOverlay,
  };
}
