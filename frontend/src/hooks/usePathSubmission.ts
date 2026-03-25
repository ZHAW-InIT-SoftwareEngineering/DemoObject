import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  MazesMazeIdPathsDslPostRequest,
  SessionsSessionIdPathsGet200Response,
} from "@/api";
import {
  readPersistedDemoPathSubmission,
  writePersistedDemoPathSubmissionDsl,
} from "@/lib/demoPathSubmissionStorage";
import { sessionsApi } from "../lib/api";

type UsePathSubmissionOptions = {
  apiRequest: MazesMazeIdPathsDslPostRequest | null;
  mazeId?: number | null;
  pathKey: string;
  sessionId?: string | null;
};

export function usePathSubmission({
  apiRequest,
  mazeId,
  pathKey,
  sessionId,
}: UsePathSubmissionOptions) {
  const [dsl, setDsl] = useState<string[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedKey, setLastSubmittedKey] = useState<string | null>(null);
  const submissionScopeKey =
    mazeId !== null && mazeId !== undefined && sessionId
      ? `${mazeId}:${sessionId}:${pathKey}`
      : null;
  const currentSubmissionScopeKeyRef = useRef<string | null>(submissionScopeKey);

  currentSubmissionScopeKeyRef.current = submissionScopeKey;

  useEffect(() => {
    setDsl(null);
    setSubmitError(null);
    setLastSubmittedKey(null);
  }, [sessionId]);

  useEffect(() => {
    const persistedSubmission =
      mazeId !== null && mazeId !== undefined && sessionId
        ? readPersistedDemoPathSubmission(sessionId, mazeId, pathKey)
        : null;
    const hasPersistedSubmission =
      !!persistedSubmission &&
      (persistedSubmission.dsl !== null ||
        persistedSubmission.shortestPath !== null);

    setDsl(persistedSubmission?.dsl ?? null);
    setLastSubmittedKey(hasPersistedSubmission ? pathKey : null);
    setSubmitError(null);
  }, [mazeId, pathKey, sessionId]);

  const resetSubmission = useCallback(() => {
    setDsl(null);
    setSubmitError(null);
    setLastSubmittedKey(null);
  }, []);

  const submitPath = useCallback(async () => {
    if (!sessionId || !apiRequest || mazeId === null || mazeId === undefined) {
      return null;
    }
    if (!submissionScopeKey) {
      return null;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await sessionsApi.sessionsSessionIdPathsPut({
        sessionId,
        mazesMazeIdPathsDslPostRequest: apiRequest,
      });

      const nextDsl = response.dsl ?? null;

      writePersistedDemoPathSubmissionDsl(sessionId, mazeId, pathKey, nextDsl);

      if (currentSubmissionScopeKeyRef.current === submissionScopeKey) {
        setDsl(nextDsl);
        setLastSubmittedKey(pathKey);
      }

      return response;
    } catch {
      if (currentSubmissionScopeKeyRef.current === submissionScopeKey) {
        setSubmitError("Senden des Pfads fehlgeschlagen.");
      }
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [apiRequest, mazeId, pathKey, sessionId, submissionScopeKey]);

  const isPathSubmitted =
    Boolean(lastSubmittedKey) && pathKey === lastSubmittedKey;

  return useMemo(
    () => ({
      dsl,
      submitError,
      submitting,
      lastSubmittedKey,
      isPathSubmitted,
      submitPath: submitPath as () => Promise<SessionsSessionIdPathsGet200Response | null>,
      resetSubmission,
    }),
    [
      dsl,
      isPathSubmitted,
      lastSubmittedKey,
      resetSubmission,
      submitError,
      submitPath,
      submitting,
    ],
  );
}
