import {
  readSessionStorageItem,
  writeSessionStorageItem,
} from "@/lib/sessionStorage";

const STORAGE_KEY_PREFIX = "demo-object.maze-timer";

export type PersistedDemoMazeTimer = {
  mazeId: number;
  sessionId: string;
  startedAt: number;
  submittedAt: number | null;
  updatedAt: string;
};

function isPersistedDemoMazeTimer(
  value: unknown,
): value is PersistedDemoMazeTimer {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<PersistedDemoMazeTimer>;

  return (
    typeof record.mazeId === "number" &&
    typeof record.sessionId === "string" &&
    typeof record.startedAt === "number" &&
    (record.submittedAt === null || typeof record.submittedAt === "number") &&
    typeof record.updatedAt === "string"
  );
}

function buildStorageKey(sessionId: string, mazeId: number) {
  return `${STORAGE_KEY_PREFIX}:${mazeId}:${sessionId}`;
}

export function readPersistedDemoMazeTimer(
  sessionId: string,
  mazeId: number,
): PersistedDemoMazeTimer | null {
  return readSessionStorageItem(
    buildStorageKey(sessionId, mazeId),
    isPersistedDemoMazeTimer,
  );
}

export function writePersistedDemoMazeTimer(
  sessionId: string,
  mazeId: number,
  startedAt: number,
  submittedAt: number | null,
) {
  const record: PersistedDemoMazeTimer = {
    mazeId,
    sessionId,
    startedAt,
    submittedAt,
    updatedAt: new Date().toISOString(),
  };

  writeSessionStorageItem(buildStorageKey(sessionId, mazeId), record);
}
