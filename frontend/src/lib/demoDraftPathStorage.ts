import type { NodePath } from "@/lib/path/transforms";
import {
  clearSessionStorageItem,
  readSessionStorageItem,
  writeSessionStorageItem,
} from "@/lib/sessionStorage";

const STORAGE_KEY = "demo-object.draft-path";
const STORAGE_VERSION = 2;

export type PersistedDemoDraftPath = {
  version: typeof STORAGE_VERSION;
  mazeId: number;
  sessionId: string;
  nodePath: NodePath;
  dsl: string[] | null;
  lastSubmittedPathKey: string | null;
  updatedAt: string;
};

function isPersistedDemoDraftPath(value: unknown): value is PersistedDemoDraftPath {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<PersistedDemoDraftPath>;

  return (
    record.version === STORAGE_VERSION &&
    typeof record.mazeId === "number" &&
    typeof record.sessionId === "string" &&
    Array.isArray(record.nodePath) &&
    record.nodePath.every((nodeId) => typeof nodeId === "number") &&
    (record.dsl === null ||
      (Array.isArray(record.dsl) &&
        record.dsl.every((token) => typeof token === "string"))) &&
    (record.lastSubmittedPathKey === null ||
      typeof record.lastSubmittedPathKey === "string") &&
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
  dsl: string[] | null = null,
  lastSubmittedPathKey: string | null = null,
) {
  if (typeof window === "undefined") return;

  const record: PersistedDemoDraftPath = {
    version: STORAGE_VERSION,
    mazeId,
    sessionId,
    nodePath: [...nodePath],
    dsl: dsl ? [...dsl] : null,
    lastSubmittedPathKey,
    updatedAt: new Date().toISOString(),
  };

  writeSessionStorageItem(STORAGE_KEY, record);
}

export function clearPersistedDemoDraftPath() {
  clearSessionStorageItem(STORAGE_KEY);
}
