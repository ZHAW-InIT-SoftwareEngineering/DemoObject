import { useEffect, useMemo, useState } from "react";
import type { MazesMazeIdGet200Response } from "@/api";
import { Card, CardContent, Maze } from "@/components/ui";

type AnimationViewProps = {
  maze: MazesMazeIdGet200Response | null;
  edgeKeys: string[];
  onComplete: () => void;
  stepMs?: number;
  settleMs?: number;
};

export function AnimationView({
  maze,
  edgeKeys,
  onComplete,
  stepMs = 220,
  settleMs = 450,
}: AnimationViewProps) {
  const [visibleGroupCount, setVisibleGroupCount] = useState(0);

  const edgeGroups = useMemo(() => {
    const groups: string[][] = [];
    for (let i = 0; i < edgeKeys.length; i += 1) {
      const current = edgeKeys[i];
      const next = edgeKeys[i + 1];
      if (next) {
        const [fromA, toA] = current.split("-");
        const [fromB, toB] = next.split("-");
        if (fromA === toB && toA === fromB) {
          groups.push([current, next]);
          i += 1;
          continue;
        }
      }
      groups.push([current]);
    }
    return groups;
  }, [edgeKeys]);

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

  if (!maze) return null;

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <div className="text-sm text-gray-700">
          Playing animation ({Math.min(visibleGroupCount, edgeGroups.length)}/
          {edgeGroups.length})
        </div>
        <div className="w-full aspect-square">
          <Maze
            maze={maze}
            className="h-full w-full border rounded bg-white"
            highlightedEdgeKeys={visibleEdgeKeys}
          />
        </div>
      </CardContent>
    </Card>
  );
}
