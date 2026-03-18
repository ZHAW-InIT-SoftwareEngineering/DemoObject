import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MazesMazeIdPathsDslPostRequest,
  SessionsSessionIdPathsGet200Response,
} from "@/api";
import {
  readPersistedDemoDraftPath,
  writePersistedDemoDraftPath,
} from "@/lib/demoDraftPathStorage";
import type { NodePath } from "@/lib/path/transforms";
import { sessionsApi } from "../lib/api";

type UsePathSubmissionOptions = {
  apiRequest: MazesMazeIdPathsDslPostRequest | null;
  mazeId?: number | null;
  nodePath: NodePath;
  pathKey: string;
  sessionId?: string | null;
};

export function usePathSubmission({
  apiRequest,
  mazeId,
  nodePath,
  pathKey,
  sessionId,
}: UsePathSubmissionOptions) {
  const [dsl, setDsl] = useState<string[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedKey, setLastSubmittedKey] = useState<string | null>(null);

  useEffect(() => {
    setLastSubmittedKey(null);
  }, [sessionId]);

  useEffect(() => {
    const persistedDraftPath =
      mazeId !== null && mazeId !== undefined && sessionId
        ? readPersistedDemoDraftPath()
        : null;
    const canRestoreDsl =
      !!persistedDraftPath &&
      persistedDraftPath.mazeId === mazeId &&
      persistedDraftPath.sessionId === sessionId &&
      persistedDraftPath.lastSubmittedPathKey === pathKey &&
      Array.isArray(persistedDraftPath.dsl);

    setDsl(canRestoreDsl ? persistedDraftPath.dsl : null);
    setLastSubmittedKey(canRestoreDsl ? pathKey : null);
    setSubmitError(null);
  }, [mazeId, pathKey, sessionId]);

  const resetSubmission = useCallback(() => {
    setDsl(null);
    setSubmitError(null);
    setLastSubmittedKey(null);

    if (mazeId === null || mazeId === undefined || !sessionId) return;

    writePersistedDemoDraftPath(sessionId, mazeId, nodePath, null, null);
  }, [mazeId, nodePath, sessionId]);

  const submitPath = useCallback(async () => {
    if (!sessionId || !apiRequest || mazeId === null || mazeId === undefined) {
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

      setDsl(nextDsl);
      setLastSubmittedKey(pathKey);
      writePersistedDemoDraftPath(
        sessionId,
        mazeId,
        nodePath,
        nextDsl,
        pathKey,
      );

      return response;
    } catch {
      setSubmitError("Senden des Pfads fehlgeschlagen.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [apiRequest, mazeId, nodePath, pathKey, sessionId]);

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
