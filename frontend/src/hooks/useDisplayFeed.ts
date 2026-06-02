import { useEffect, useState } from "react";
import { getDisplayFeed, type DisplayFeed } from "@/services/displayFeed";

type UseDisplayFeedResult = {
  feed: DisplayFeed | null;
  loading: boolean;
  error: string | null;
};

export function useDisplayFeed(
  mazeId: number,
  pollMs = 2000,
): UseDisplayFeedResult {
  const [feed, setFeed] = useState<DisplayFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    let abortController: AbortController | null = null;

    const poll = async () => {
      abortController?.abort();
      abortController = new AbortController();

      try {
        const nextFeed = await getDisplayFeed(mazeId, abortController.signal);
        if (cancelled) return;
        setFeed(nextFeed);
        setError(null);
      } catch (error) {
        if (cancelled || abortController.signal.aborted) return;
        setError(
          error instanceof Error ? error.message : "Display feed unavailable.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          timeoutId = window.setTimeout(poll, pollMs);
        }
      }
    };

    setLoading(true);
    setError(null);
    void poll();

    return () => {
      cancelled = true;
      abortController?.abort();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [mazeId, pollMs]);

  return { feed, loading, error };
}
