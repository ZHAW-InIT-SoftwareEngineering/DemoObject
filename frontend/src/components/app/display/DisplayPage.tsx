import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Trophy } from "lucide-react";
import { AnimationView } from "@/components/app/AnimationView";
import { useAnimationScenePlayback, useDisplayFeed, useMazeById } from "@/hooks";
import { cn } from "@/lib/utils";
import { coordPathToNodePath, type NodePath } from "@/lib/path/transforms";
import {
  getDisplayNext,
  type DisplayLeaderboardEntry,
} from "@/services/displayFeed";

type DisplayPageProps = {
  mazeId: number;
};

type RankedEntry = DisplayLeaderboardEntry & {
  key: string;
  nodePath: NodePath;
};

function getEntryKey(entry: DisplayLeaderboardEntry) {
  return `${entry.userName}:${entry.submittedAt}:${entry.elapsedMs}`;
}

function formatElapsedTime(elapsedMs: number) {
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  const centiseconds = Math.floor((elapsedMs % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${seconds}.${centiseconds.toString().padStart(2, "0")}s`;
}

export function DisplayPage({ mazeId }: DisplayPageProps) {
  const { feed, loading, error } = useDisplayFeed(mazeId);
  const { maze } = useMazeById(mazeId);
  const [currentAnimation, setCurrentAnimation] =
    useState<DisplayLeaderboardEntry | null>(null);
  const [nextLoading, setNextLoading] = useState(true);
  const [nextError, setNextError] = useState<string | null>(null);
  const requestInFlightRef = useRef(false);
  const nextAbortRef = useRef<AbortController | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const rankedEntries = useMemo<RankedEntry[]>(() => {
    const nodeIdByCoord = new Map(
      (maze?.nodes ?? []).map((node) => [`${node.x},${node.y}`, node.mazeNodeId]),
    );

    return (feed?.leaderboard ?? []).map((entry) => ({
      ...entry,
      key: getEntryKey(entry),
      nodePath: coordPathToNodePath(entry.path, nodeIdByCoord),
    }));
  }, [feed?.leaderboard, maze?.nodes]);

  const currentKey = currentAnimation ? getEntryKey(currentAnimation) : null;

  const currentNodePath = useMemo<NodePath>(() => {
    if (!currentAnimation || !maze) return [];

    const nodeIdByCoord = new Map(
      maze.nodes.map((node) => [`${node.x},${node.y}`, node.mazeNodeId]),
    );

    return coordPathToNodePath(currentAnimation.path, nodeIdByCoord);
  }, [currentAnimation, maze]);

  const requestNextAnimation = useCallback(async () => {
    if (requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    nextAbortRef.current?.abort();
    const abortController = new AbortController();
    nextAbortRef.current = abortController;
    setNextLoading(true);

    try {
      const next = await getDisplayNext(mazeId, abortController.signal);
      setCurrentAnimation(next.animation);
      setNextError(null);
    } catch (error) {
      if (abortController.signal.aborted) return;
      setNextError(
        error instanceof Error ? error.message : "Display animation unavailable.",
      );
    } finally {
      if (!abortController.signal.aborted) {
        setNextLoading(false);
        requestInFlightRef.current = false;
      }
    }
  }, [mazeId]);

  useEffect(() => {
    setCurrentAnimation(null);
    setNextError(null);
    void requestNextAnimation();

    return () => {
      nextAbortRef.current?.abort();
      requestInFlightRef.current = false;
    };
  }, [requestNextAnimation]);

  useEffect(() => {
    if (currentAnimation || nextLoading) return;

    const timeoutId = window.setTimeout(() => {
      void requestNextAnimation();
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [currentAnimation, nextLoading, requestNextAnimation]);

  const handleAnimationComplete = useCallback(() => {
    setCurrentAnimation(null);
    void requestNextAnimation();
  }, [requestNextAnimation]);

  useEffect(() => {
    if (!currentKey) return;
    rowRefs.current.get(currentKey)?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [currentKey]);

  const playback = useAnimationScenePlayback({
    maze,
    nodePath: currentNodePath,
    userNodePath: [],
    shortestNodePath: [],
    onComplete: handleAnimationComplete,
    stepMs: 260,
    settleMs: 1200,
    restartKey: currentKey ?? "warten",
    enabled: Boolean(currentAnimation && maze),
  });

  const hasEntries = rankedEntries.length > 0;
  const currentLabel = currentAnimation
    ? `#${currentAnimation.rank} ${currentAnimation.userName} (${formatElapsedTime(
        currentAnimation.elapsedMs,
      )})`
    : "Warten auf Pfade";

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#0f141b] text-slate-100">
      <div className="grid h-full grid-cols-1 md:grid-cols-[minmax(260px,25vw)_1fr]">
        <aside className="flex min-h-0 flex-col border-r border-slate-800 bg-[#151b24]">
          <div className="border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-7 w-7 text-amber-300" />
              <div>
                <h1 className="text-2xl font-bold tracking-normal">
                  Leaderboard
                </h1>
                <p className="text-sm text-slate-400">Labyrinth {mazeId}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs uppercase text-slate-500">
              <span>{rankedEntries.length} Kandidaten</span>
              <span>{currentAnimation ? "wird animiert" : "warten..."}</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {error ? (
              <div className="mb-3 rounded border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">
                Feed unavailable
              </div>
            ) : null}

            {nextError ? (
              <div className="mb-3 rounded border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">
                Animation nicht verfügbar
              </div>
            ) : null}

            {!hasEntries && !loading ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-slate-400">
                Warten auf den ersten Pfad.
              </div>
            ) : null}

            <div className="space-y-2">
              {rankedEntries.map((entry) => {
                const isCurrent = entry.key === currentKey;

                return (
                  <div
                    key={entry.key}
                    ref={(node) => {
                      if (node) rowRefs.current.set(entry.key, node);
                      else rowRefs.current.delete(entry.key);
                    }}
                    className={cn(
                      "grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-md border px-3 py-3 transition-colors",
                      isCurrent
                        ? "border-amber-300 bg-amber-300/15 text-white"
                        : "border-slate-800 bg-slate-900/45 text-slate-200",
                    )}
                  >
                    <div className="text-2xl font-black tabular-nums">
                      #{entry.rank}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold">
                        {entry.userName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {entry.moveCount} moves
                      </div>
                    </div>
                    <div className="text-right text-xl font-bold tabular-nums">
                      {formatElapsedTime(entry.elapsedMs)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="relative min-h-0">
          {currentAnimation ? (
            <AnimationView
              sceneData={playback.sceneData}
              progress={playback.progress}
              total={playback.total}
              label={currentLabel}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#161a22]">
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-300" />
                <div className="mt-5 text-5xl font-black tracking-normal">
                  Warten...
                </div>
                <div className="mt-3 text-lg text-slate-400">
                  Eingereichte Pfade erscheinen hier automatisch.
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
