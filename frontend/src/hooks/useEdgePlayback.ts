import { useEffect, useMemo, useState } from "react";
import { groupBidirectionalEdges } from "@/lib/animation/groupBidirectionalEdges";

type UseEdgePlaybackOptions = {
  edgeKeys: string[];
  onComplete: () => void;
  stepMs?: number;
  settleMs?: number;
};

type UseEdgePlaybackResult = {
  visibleEdgeKeys: string[];
  progress: number;
  total: number;
};

export function useEdgePlayback({
  edgeKeys,
  onComplete,
  stepMs = 220,
  settleMs = 450,
}: UseEdgePlaybackOptions): UseEdgePlaybackResult {
  const [visibleGroupCount, setVisibleGroupCount] = useState(0);

  const edgeGroups = useMemo(() => groupBidirectionalEdges(edgeKeys), [edgeKeys]);

  const visibleEdgeKeys = useMemo(
    () => edgeGroups.slice(0, visibleGroupCount).flat(),
    [edgeGroups, visibleGroupCount],
  );

  useEffect(() => {
    setVisibleGroupCount(0);
  }, [edgeGroups]);

  useEffect(() => {
    if (edgeGroups.length === 0) {
      onComplete();
      return;
    }

    if (visibleGroupCount >= edgeGroups.length) {
      const timer = window.setTimeout(() => {
        onComplete();
      }, settleMs);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setVisibleGroupCount((count) => count + 1);
    }, stepMs);

    return () => window.clearTimeout(timer);
  }, [edgeGroups.length, onComplete, settleMs, stepMs, visibleGroupCount]);

  return {
    visibleEdgeKeys,
    progress: Math.min(visibleGroupCount, edgeGroups.length),
    total: edgeGroups.length,
  };
}
