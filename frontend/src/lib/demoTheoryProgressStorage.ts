import {
  readSessionStorageItem,
  writeSessionStorageItem,
} from "@/lib/sessionStorage";

const STORAGE_KEY_PREFIX = "demo-object.theory-progress";

export type PersistedDemoTheoryProgress = {
  mazeId: number;
  sessionId: string;
  visitedDsl: boolean;
  visitedShortestPath: boolean;
  updatedAt: string;
};

function isPersistedDemoTheoryProgress(
  value: unknown,
): value is PersistedDemoTheoryProgress {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<PersistedDemoTheoryProgress>;

  return (
    typeof record.mazeId === "number" &&
    typeof record.sessionId === "string" &&
    typeof record.visitedDsl === "boolean" &&
    typeof record.visitedShortestPath === "boolean" &&
    typeof record.updatedAt === "string"
  );
}

function buildStorageKey(sessionId: string, mazeId: number) {
  return `${STORAGE_KEY_PREFIX}:${mazeId}:${sessionId}`;
}

export function readPersistedDemoTheoryProgress(
  sessionId: string,
  mazeId: number,
): PersistedDemoTheoryProgress | null {
  return readSessionStorageItem(
    buildStorageKey(sessionId, mazeId),
    isPersistedDemoTheoryProgress,
  );
}

export function writePersistedDemoTheoryProgress(
  sessionId: string,
  mazeId: number,
  visitedDsl: boolean,
  visitedShortestPath: boolean,
) {
  const record: PersistedDemoTheoryProgress = {
    mazeId,
    sessionId,
    visitedDsl,
    visitedShortestPath,
    updatedAt: new Date().toISOString(),
  };

  writeSessionStorageItem(buildStorageKey(sessionId, mazeId), record);
}
