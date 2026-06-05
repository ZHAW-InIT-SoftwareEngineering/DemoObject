import {
  readDemoActiveStateData,
  updateDemoActiveStateData,
} from "@/lib/demoActiveStateStorage";
import type { PersistedDemoStreamingNotice } from "@/lib/demoPersistenceTypes";

export type { PersistedDemoStreamingNotice } from "@/lib/demoPersistenceTypes";

export function hasSeenPersistedDemoStreamingNotice(
  sessionId: string,
  mazeId: number,
) {
  const notice = readPersistedDemoStreamingNotice(sessionId, mazeId);

  return notice !== null;
}

export function readPersistedDemoStreamingNotice(
  sessionId: string,
  mazeId: number,
): PersistedDemoStreamingNotice | null {
  const notice = readDemoActiveStateData().streamingNotice;

  if (!notice || notice.sessionId !== sessionId || notice.mazeId !== mazeId) {
    return null;
  }

  return notice;
}

export function writePersistedDemoStreamingNotice(
  sessionId: string,
  mazeId: number,
) {
  const now = new Date().toISOString();
  const record: PersistedDemoStreamingNotice = {
    mazeId,
    sessionId,
    seenAt: now,
    updatedAt: now,
  };

  updateDemoActiveStateData((data) => ({
    ...data,
    streamingNotice: record,
  }));
}
