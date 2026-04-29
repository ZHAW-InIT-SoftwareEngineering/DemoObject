import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  readPersistedDemoMazeTimer,
  writePersistedDemoMazeTimer,
} from "@/lib/demoMazeTimerStorage";

const TIMER_TICK_MS = 50;

export type MazeTimerStatus = "idle" | "running" | "submitting" | "stopped";

type UseMazeTimerOptions = {
  mazeId?: number | null;
  sessionId?: string | null;
};

export type MazeTimerSubmissionSnapshot = {
  elapsedMs: number;
  stoppedAt: number;
};

export function useMazeTimer({ mazeId, sessionId }: UseMazeTimerOptions) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [pendingStopAt, setPendingStopAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const pendingStopAtRef = useRef<number | null>(null);

  const timerScopeKey =
    mazeId !== null && mazeId !== undefined && sessionId
      ? `${mazeId}:${sessionId}`
      : null;

  useEffect(() => {
    setHydrated(false);
    setPendingStopAt(null);
    pendingStopAtRef.current = null;

    if (mazeId === null || mazeId === undefined || !sessionId || !timerScopeKey) {
      setStartedAt(null);
      setSubmittedAt(null);
      setHydrated(true);
      return;
    }

    const persistedTimer = readPersistedDemoMazeTimer(sessionId, mazeId);
    if (persistedTimer) {
      setStartedAt(persistedTimer.startedAt);
      setSubmittedAt(persistedTimer.submittedAt);
      setNow(Date.now());
      setHydrated(true);
      return;
    }

    setStartedAt(null);
    setSubmittedAt(null);
    setNow(Date.now());
    setHydrated(true);
  }, [mazeId, sessionId, timerScopeKey]);

  useEffect(() => {
    if (startedAt === null || submittedAt !== null || pendingStopAt !== null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, TIMER_TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pendingStopAt, startedAt, submittedAt]);

  const beginSubmission = useCallback((): MazeTimerSubmissionSnapshot | null => {
    if (
      startedAt === null ||
      submittedAt !== null ||
      pendingStopAtRef.current !== null
    ) {
      return null;
    }

    const stoppedAt = Date.now();
    pendingStopAtRef.current = stoppedAt;
    setPendingStopAt(stoppedAt);
    setNow(stoppedAt);

    return {
      elapsedMs: Math.max(0, stoppedAt - startedAt),
      stoppedAt,
    };
  }, [startedAt, submittedAt]);

  const start = useCallback(() => {
    if (
      mazeId === null ||
      mazeId === undefined ||
      !sessionId ||
      startedAt !== null ||
      submittedAt !== null
    ) {
      return;
    }

    const nextStartedAt = Date.now();
    writePersistedDemoMazeTimer(sessionId, mazeId, nextStartedAt, null);
    pendingStopAtRef.current = null;
    setStartedAt(nextStartedAt);
    setSubmittedAt(null);
    setPendingStopAt(null);
    setNow(nextStartedAt);
  }, [mazeId, sessionId, startedAt, submittedAt]);

  const cancelSubmission = useCallback(() => {
    if (pendingStopAtRef.current === null) return;

    pendingStopAtRef.current = null;
    setPendingStopAt(null);
    setNow(Date.now());
  }, []);

  const completeSubmission = useCallback((stoppedAt?: number) => {
    if (
      mazeId === null ||
      mazeId === undefined ||
      !sessionId ||
      startedAt === null ||
      submittedAt !== null
    ) {
      return;
    }

    const finalSubmittedAt =
      stoppedAt ?? pendingStopAtRef.current ?? pendingStopAt ?? Date.now();
    writePersistedDemoMazeTimer(
      sessionId,
      mazeId,
      startedAt,
      finalSubmittedAt,
    );
    pendingStopAtRef.current = null;
    setSubmittedAt(finalSubmittedAt);
    setPendingStopAt(null);
    setNow(finalSubmittedAt);
  }, [mazeId, pendingStopAt, sessionId, startedAt, submittedAt]);

  const displayStopAt = submittedAt ?? pendingStopAt ?? now;
  const elapsedMs =
    startedAt === null ? 0 : Math.max(0, displayStopAt - startedAt);

  const status: MazeTimerStatus =
    startedAt === null
      ? "idle"
      : submittedAt !== null
      ? "stopped"
      : pendingStopAt !== null
        ? "submitting"
        : "running";

  return useMemo(
    () => ({
      hydrated,
      hasStarted: startedAt !== null,
      elapsedMs,
      status,
      start,
      beginSubmission,
      cancelSubmission,
      completeSubmission,
    }),
    [
      beginSubmission,
      cancelSubmission,
      completeSubmission,
      elapsedMs,
      hydrated,
      start,
      startedAt,
      status,
    ],
  );
}
