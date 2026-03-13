import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MazesMazeIdPathsDslPostRequest,
  SessionsSessionIdPathsGet200Response,
} from "@/api";
import { sessionsApi } from "../lib/api";

type UsePathSubmissionOptions = {
  apiRequest: MazesMazeIdPathsDslPostRequest | null;
  pathKey: string;
  sessionId?: string | null;
};

export function usePathSubmission({
  apiRequest,
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
    setDsl(null);
    setSubmitError(null);
  }, [pathKey, sessionId]);

  const resetSubmission = useCallback(() => {
    setDsl(null);
    setSubmitError(null);
    setLastSubmittedKey(null);
  }, []);

  const submitPath = useCallback(async () => {
    if (!sessionId || !apiRequest) return null;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await sessionsApi.sessionsSessionIdPathsPut({
        sessionId,
        mazesMazeIdPathsDslPostRequest: apiRequest,
      });

      setDsl(response.dsl ?? null);
      setLastSubmittedKey(pathKey);

      return response;
    } catch {
      setSubmitError("Senden des Pfads fehlgeschlagen.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [apiRequest, pathKey, sessionId]);

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
