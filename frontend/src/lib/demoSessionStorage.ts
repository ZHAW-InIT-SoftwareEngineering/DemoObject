import type { SessionsPost201Response } from "@/api";
import {
  clearDemoActiveStateData,
  createEmptyDemoActiveStateData,
  readDemoActiveStateData,
  writeDemoActiveStateData,
} from "@/lib/demoActiveStateStorage";
import type { PersistedDemoSession } from "@/lib/demoPersistenceTypes";

export type { PersistedDemoSession } from "@/lib/demoPersistenceTypes";

export function readPersistedDemoSession(): PersistedDemoSession | null {
  return readDemoActiveStateData().session;
}

export function writePersistedDemoSession(
  session: SessionsPost201Response,
  mazeId: number,
) {
  const record: PersistedDemoSession = {
    mazeId,
    createdAt: new Date().toISOString(),
    session,
  };
  const data = createEmptyDemoActiveStateData();
  data.session = record;

  writeDemoActiveStateData(data);
}

export function clearPersistedDemoSession() {
  clearDemoActiveStateData();
}
