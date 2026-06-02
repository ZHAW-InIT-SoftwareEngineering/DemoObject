import { useEffect, useMemo, useState } from "react";
import type { NodePath } from "@/lib/path/transforms";

type UseEdgePlaybackOptions = {
  nodePath: NodePath;
  onComplete: () => void;
  stepMs?: number;
  settleMs?: number;
  restartKey?: number | string;
  enabled?: boolean;
};

type UseEdgePlaybackResult = {
  visibleNodePath: NodePath;
  progress: number;
  total: number;
};

export function useEdgePlayback({
  nodePath,
  onComplete,
  stepMs = 220,
  settleMs = 450,
  restartKey,
  enabled = true,
}: UseEdgePlaybackOptions): UseEdgePlaybackResult {
  const [visibleSegmentCount, setVisibleSegmentCount] = useState(0);
  const totalSegments = Math.max(nodePath.length - 1, 0);

  const visibleNodePath = useMemo(() => {
    if (nodePath.length === 0) return [];
    const visibleNodeCount = Math.min(nodePath.length, visibleSegmentCount + 1);
    return nodePath.slice(0, visibleNodeCount);
  }, [nodePath, visibleSegmentCount]);

  useEffect(() => {
    setVisibleSegmentCount(0);
  }, [enabled, nodePath, restartKey]);

  useEffect(() => {
    if (!enabled) return;

    if (totalSegments === 0) {
      onComplete();
      return;
    }

    if (visibleSegmentCount >= totalSegments) {
      const timer = window.setTimeout(() => {
        onComplete();
      }, settleMs);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setVisibleSegmentCount((count) => count + 1);
    }, stepMs);

    return () => window.clearTimeout(timer);
  }, [enabled, onComplete, settleMs, stepMs, totalSegments, visibleSegmentCount]);

  return {
    visibleNodePath,
    progress: Math.min(visibleSegmentCount, totalSegments),
    total: totalSegments,
  };
}
