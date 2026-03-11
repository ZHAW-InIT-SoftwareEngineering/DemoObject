import type { SessionsPost201Response } from "@/api";
import {
  clearSessionStorageItem,
  readSessionStorageItem,
  writeSessionStorageItem,
} from "@/lib/sessionStorage";

const STORAGE_KEY = "demo-object.active-session";
const STORAGE_VERSION = 1;

export type PersistedDemoSession = {
  version: typeof STORAGE_VERSION;
  mazeId: number;
  createdAt: string;
  session: SessionsPost201Response;
};

function isPersistedDemoSession(value: unknown): value is PersistedDemoSession {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<PersistedDemoSession>;
  const session = record.session as Partial<SessionsPost201Response> | undefined;

  return (
    record.version === STORAGE_VERSION &&
    typeof record.mazeId === "number" &&
    typeof record.createdAt === "string" &&
    !!session &&
    typeof session.sessionId === "string" &&
    typeof session.qrPayload === "string"
  );
}

export function readPersistedDemoSession(): PersistedDemoSession | null {
  return readSessionStorageItem(STORAGE_KEY, isPersistedDemoSession);
}

export function writePersistedDemoSession(
  session: SessionsPost201Response,
  mazeId: number,
) {
  if (typeof window === "undefined") return;

  const record: PersistedDemoSession = {
    version: STORAGE_VERSION,
    mazeId,
    createdAt: new Date().toISOString(),
    session,
  };

  writeSessionStorageItem(STORAGE_KEY, record);
}

export function clearPersistedDemoSession() {
  clearSessionStorageItem(STORAGE_KEY);
}
