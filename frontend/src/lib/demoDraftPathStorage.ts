import type { NodePath } from "@/lib/path/transforms";
import {
  readDemoActiveStateData,
  updateDemoActiveStateData,
} from "@/lib/demoActiveStateStorage";
import type { PersistedDemoDraftPath } from "@/lib/demoPersistenceTypes";

export type { PersistedDemoDraftPath } from "@/lib/demoPersistenceTypes";

export function readPersistedDemoDraftPath(): PersistedDemoDraftPath | null {
  return readDemoActiveStateData().draftPath;
}

export function writePersistedDemoDraftPath(
  sessionId: string,
  mazeId: number,
  nodePath: NodePath,
) {
  const record: PersistedDemoDraftPath = {
    mazeId,
    sessionId,
    nodePath: [...nodePath],
    updatedAt: new Date().toISOString(),
  };

  updateDemoActiveStateData((data) => ({
    ...data,
    draftPath: record,
  }));
}

export function clearPersistedDemoDraftPath() {
  updateDemoActiveStateData((data) => ({
    ...data,
    draftPath: null,
  }));
}
