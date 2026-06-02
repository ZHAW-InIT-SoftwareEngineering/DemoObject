import type {
  MazesMazeIdShortestPathGet200Response,
} from "@/api";
import {
  readDemoActiveStateData,
  updateDemoActiveStateData,
} from "@/lib/demoActiveStateStorage";
import type { PersistedDemoPathSubmission } from "@/lib/demoPersistenceTypes";

export type { PersistedDemoPathSubmission } from "@/lib/demoPersistenceTypes";

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

export function readPersistedDemoPathSubmission(
  sessionId: string,
  mazeId: number,
  pathKey: string,
): PersistedDemoPathSubmission | null {
  const persistedRecord = readDemoActiveStateData().pathSubmissions[pathKey];

  if (
    !persistedRecord ||
    persistedRecord.mazeId !== mazeId ||
    persistedRecord.sessionId !== sessionId ||
    persistedRecord.pathKey !== pathKey
  ) {
    return null;
  }

  return persistedRecord;
}

export function writePersistedDemoPathSubmission(
  sessionId: string,
  mazeId: number,
  pathKey: string,
  dsl: string[] | null,
  shortestPath: MazesMazeIdShortestPathGet200Response | null,
) {
  const record = createPersistedDemoPathSubmission(
    sessionId,
    mazeId,
    pathKey,
    dsl,
    shortestPath,
  );

  updateDemoActiveStateData((data) => ({
    ...data,
    pathSubmissions: {
      ...data.pathSubmissions,
      [pathKey]: record,
    },
  }));
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
  updateDemoActiveStateData((data) => {
    const record = data.pathSubmissions[pathKey];
    if (
      !record ||
      record.sessionId !== sessionId ||
      record.mazeId !== mazeId ||
      record.pathKey !== pathKey
    ) {
      return data;
    }

    const pathSubmissions = { ...data.pathSubmissions };
    delete pathSubmissions[pathKey];

    return {
      ...data,
      pathSubmissions,
    };
  });
}
