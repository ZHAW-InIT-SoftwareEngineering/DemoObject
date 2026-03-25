import type { NodePath } from "@/lib/path/transforms";
import {
  clearSessionStorageItem,
  readSessionStorageItem,
  writeSessionStorageItem,
} from "@/lib/sessionStorage";

const STORAGE_KEY = "demo-object.draft-path";

export type PersistedDemoDraftPath = {
  mazeId: number;
  sessionId: string;
  nodePath: NodePath;
  updatedAt: string;
};

function isPersistedDemoDraftPath(value: unknown): value is PersistedDemoDraftPath {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<PersistedDemoDraftPath>;

  return (
    typeof record.mazeId === "number" &&
    typeof record.sessionId === "string" &&
    Array.isArray(record.nodePath) &&
    record.nodePath.every((nodeId) => typeof nodeId === "number") &&
    typeof record.updatedAt === "string"
  );
}

export function readPersistedDemoDraftPath(): PersistedDemoDraftPath | null {
  return readSessionStorageItem(STORAGE_KEY, isPersistedDemoDraftPath);
}

export function writePersistedDemoDraftPath(
  sessionId: string,
  mazeId: number,
  nodePath: NodePath,
) {
  if (typeof window === "undefined") return;

  const record: PersistedDemoDraftPath = {
    mazeId,
    sessionId,
    nodePath: [...nodePath],
    updatedAt: new Date().toISOString(),
  };

  writeSessionStorageItem(STORAGE_KEY, record);
}

export function clearPersistedDemoDraftPath() {
  clearSessionStorageItem(STORAGE_KEY);
}
