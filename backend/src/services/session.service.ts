import { randomUUID } from "crypto";
import type { Session } from "../domain/session";
import { createSession, getSession, updateSession } from "../repositories";
import { getMazeById } from "./maze.service";

export async function createSessionService(mazeId: number) {
  if (!getMazeById(mazeId)) return null;

  const sessionId = randomUUID();
  const doc = await createSession(sessionId, mazeId);
  return doc.sessionId;
}

export function updateSessionService(sessionId: string, data: Partial<Session>) {
  return updateSession(sessionId, data);
}

export async function retrieveSessionService(sessionId: string) {
  const doc = await getSession(sessionId);
  return doc;
}
