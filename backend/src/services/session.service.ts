import { randomUUID } from "crypto";
import type { Session } from "../domain/session";
import { createSession, getSession, updateSession } from "../repositories";
import { isCompleteStartToGoalPath } from "../util";
import { getMazeById } from "./maze.service";
import { computeDSLFromPath } from "./path.service";
import { generateSessionUserName } from "./sessionUsername.service";

export type PatchSessionResult =
  | { status: "patched"; session: Session }
  | { status: "session-not-found" }
  | { status: "maze-not-found" }
  | { status: "already-submitted" }
  | { status: "invalid-path" };

export async function createSessionService(mazeId: number) {
  if (!getMazeById(mazeId)) return null;

  const sessionId = randomUUID();
  const userName = await generateSessionUserName();
  return createSession(sessionId, mazeId, userName);
}

export async function patchSessionService(
  sessionId: string,
  data: Partial<Session>,
): Promise<PatchSessionResult> {
  const session = await getSession(sessionId);
  if (!session) return { status: "session-not-found" };

  const update: Partial<Session> = { ...data };
  if (update.path) {
    if (session.submittedAt) return { status: "already-submitted" };

    const maze = getMazeById(session.mazeId);
    if (!maze) return { status: "maze-not-found" };
    if (!isCompleteStartToGoalPath(maze, update.path)) {
      return { status: "invalid-path" };
    }

    update.dsl = computeDSLFromPath(update.path);
    if (update.elapsedMs !== undefined) {
      update.submittedAt = new Date();
    }
  }

  const updated = await updateSession(sessionId, update);
  if (!updated) return { status: "session-not-found" };

  return { status: "patched", session: updated };
}
