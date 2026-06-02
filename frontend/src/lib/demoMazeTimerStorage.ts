import {
  readDemoActiveStateData,
  updateDemoActiveStateData,
} from "@/lib/demoActiveStateStorage";
import type { PersistedDemoMazeTimer } from "@/lib/demoPersistenceTypes";

export type { PersistedDemoMazeTimer } from "@/lib/demoPersistenceTypes";

export function readPersistedDemoMazeTimer(
  sessionId: string,
  mazeId: number,
): PersistedDemoMazeTimer | null {
  const timer = readDemoActiveStateData().mazeTimer;

  if (!timer || timer.sessionId !== sessionId || timer.mazeId !== mazeId) {
    return null;
  }

  return timer;
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

  updateDemoActiveStateData((data) => ({
    ...data,
    mazeTimer: record,
  }));
}
