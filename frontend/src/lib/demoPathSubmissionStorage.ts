import type {
  MazesMazeIdPathsDslPostRequestPathInner,
  MazesMazeIdShortestPathGet200Response,
} from "@/api";
import {
  clearSessionStorageItem,
  readSessionStorageItem,
  writeSessionStorageItem,
} from "@/lib/sessionStorage";

const STORAGE_KEY_PREFIX = "demo-object.path-submission";
const LEGACY_DRAFT_STORAGE_KEY = "demo-object.draft-path";

export type PersistedDemoPathSubmission = {
  mazeId: number;
  sessionId: string;
  pathKey: string;
  dsl: string[] | null;
  shortestPath: MazesMazeIdShortestPathGet200Response | null;
  updatedAt: string;
};

type LegacyPersistedDemoDraftRecord = {
  mazeId: number;
  sessionId: string;
  dsl?: unknown;
  shortestPath?: unknown;
  lastSubmittedPathKey?: unknown;
  updatedAt: string;
};

function isCoordPathEntry(
  value: unknown,
): value is MazesMazeIdPathsDslPostRequestPathInner {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<MazesMazeIdPathsDslPostRequestPathInner>;
  return typeof record.x === "number" && typeof record.y === "number";
}

function isShortestPathResponse(
  value: unknown,
): value is MazesMazeIdShortestPathGet200Response {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<MazesMazeIdShortestPathGet200Response>;
  return (
    (record.algorithm === "bfs" || record.algorithm === "dijkstra") &&
    Array.isArray(record.path) &&
    record.path.every(isCoordPathEntry) &&
    Array.isArray(record.explorationSteps) &&
    record.explorationSteps.every((step) => {
      if (!step || typeof step !== "object") return false;

      const explorationStep = step as {
        from?: unknown;
        to?: unknown;
        discovered?: unknown;
        improved?: unknown;
        candidateCost?: unknown;
      };

      return (
        isCoordPathEntry(explorationStep.from) &&
        isCoordPathEntry(explorationStep.to) &&
        typeof explorationStep.discovered === "boolean" &&
        typeof explorationStep.improved === "boolean" &&
        typeof explorationStep.candidateCost === "number"
      );
    }) &&
    typeof record.length === "number" &&
    typeof record.cost === "number"
  );
}

function isPersistedDemoPathSubmission(
  value: unknown,
): value is PersistedDemoPathSubmission {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<PersistedDemoPathSubmission>;
  return (
    typeof record.mazeId === "number" &&
    typeof record.sessionId === "string" &&
    typeof record.pathKey === "string" &&
    (record.dsl === null ||
      (Array.isArray(record.dsl) &&
        record.dsl.every((token) => typeof token === "string"))) &&
    (record.shortestPath === null ||
      isShortestPathResponse(record.shortestPath)) &&
    typeof record.updatedAt === "string"
  );
}

function isLegacyPersistedDemoDraftRecord(
  value: unknown,
): value is LegacyPersistedDemoDraftRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<LegacyPersistedDemoDraftRecord>;
  return (
    typeof record.mazeId === "number" &&
    typeof record.sessionId === "string" &&
    (record.lastSubmittedPathKey === null ||
      record.lastSubmittedPathKey === undefined ||
      typeof record.lastSubmittedPathKey === "string") &&
    typeof record.updatedAt === "string"
  );
}

function buildStorageKey(mazeId: number, sessionId: string, pathKey: string) {
  return `${STORAGE_KEY_PREFIX}:${mazeId}:${sessionId}:${pathKey}`;
}

function createPersistedDemoPathSubmission(
  sessionId: string,
  mazeId: number,
  pathKey: string,
  dsl: string[] | null,
  shortestPath: MazesMazeIdShortestPathGet200Response | null,
): PersistedDemoPathSubmission {
  return {
    mazeId,
    sessionId,
    pathKey,
    dsl: dsl ? [...dsl] : null,
    shortestPath,
    updatedAt: new Date().toISOString(),
  };
}

function readLegacyPersistedDemoPathSubmission(
  sessionId: string,
  mazeId: number,
  pathKey: string,
): PersistedDemoPathSubmission | null {
  const legacyRecord = readSessionStorageItem(
    LEGACY_DRAFT_STORAGE_KEY,
    isLegacyPersistedDemoDraftRecord,
  );

  if (
    !legacyRecord ||
    legacyRecord.mazeId !== mazeId ||
    legacyRecord.sessionId !== sessionId ||
    legacyRecord.lastSubmittedPathKey !== pathKey
  ) {
    return null;
  }

  const dsl =
    Array.isArray(legacyRecord.dsl) &&
    legacyRecord.dsl.every((token) => typeof token === "string")
      ? legacyRecord.dsl
      : null;
  const shortestPath = isShortestPathResponse(legacyRecord.shortestPath)
    ? legacyRecord.shortestPath
    : null;

  if (dsl === null && shortestPath === null) {
    return null;
  }

  return {
    mazeId,
    sessionId,
    pathKey,
    dsl,
    shortestPath,
    updatedAt: legacyRecord.updatedAt,
  };
}

export function readPersistedDemoPathSubmission(
  sessionId: string,
  mazeId: number,
  pathKey: string,
): PersistedDemoPathSubmission | null {
  const storageKey = buildStorageKey(mazeId, sessionId, pathKey);
  const persistedRecord = readSessionStorageItem(
    storageKey,
    isPersistedDemoPathSubmission,
  );

  if (persistedRecord) {
    return persistedRecord;
  }

  const legacyRecord = readLegacyPersistedDemoPathSubmission(
    sessionId,
    mazeId,
    pathKey,
  );
  if (!legacyRecord) {
    return null;
  }

  writeSessionStorageItem(storageKey, legacyRecord);
  return legacyRecord;
}

export function writePersistedDemoPathSubmission(
  sessionId: string,
  mazeId: number,
  pathKey: string,
  dsl: string[] | null,
  shortestPath: MazesMazeIdShortestPathGet200Response | null,
) {
  if (typeof window === "undefined") return;

  const record = createPersistedDemoPathSubmission(
    sessionId,
    mazeId,
    pathKey,
    dsl,
    shortestPath,
  );

  writeSessionStorageItem(buildStorageKey(mazeId, sessionId, pathKey), record);
}

export function writePersistedDemoPathSubmissionDsl(
  sessionId: string,
  mazeId: number,
  pathKey: string,
  dsl: string[] | null,
) {
  const persistedRecord = readPersistedDemoPathSubmission(
    sessionId,
    mazeId,
    pathKey,
  );

  writePersistedDemoPathSubmission(
    sessionId,
    mazeId,
    pathKey,
    dsl,
    persistedRecord?.shortestPath ?? null,
  );
}

export function writePersistedDemoPathSubmissionShortestPath(
  sessionId: string,
  mazeId: number,
  pathKey: string,
  shortestPath: MazesMazeIdShortestPathGet200Response | null,
) {
  const persistedRecord = readPersistedDemoPathSubmission(
    sessionId,
    mazeId,
    pathKey,
  );

  writePersistedDemoPathSubmission(
    sessionId,
    mazeId,
    pathKey,
    persistedRecord?.dsl ?? null,
    shortestPath,
  );
}

export function clearPersistedDemoPathSubmission(
  sessionId: string,
  mazeId: number,
  pathKey: string,
) {
  clearSessionStorageItem(buildStorageKey(mazeId, sessionId, pathKey));
}
