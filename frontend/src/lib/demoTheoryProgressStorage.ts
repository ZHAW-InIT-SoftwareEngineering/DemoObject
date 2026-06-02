import {
  readDemoActiveStateData,
  updateDemoActiveStateData,
} from "@/lib/demoActiveStateStorage";
import type { PersistedDemoTheoryProgress } from "@/lib/demoPersistenceTypes";

export type { PersistedDemoTheoryProgress } from "@/lib/demoPersistenceTypes";

export function readPersistedDemoTheoryProgress(
  sessionId: string,
  mazeId: number,
): PersistedDemoTheoryProgress | null {
  const progress = readDemoActiveStateData().theoryProgress;

  if (!progress || progress.sessionId !== sessionId || progress.mazeId !== mazeId) {
    return null;
  }

  return progress;
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

  updateDemoActiveStateData((data) => ({
    ...data,
    theoryProgress: record,
  }));
}
